import { format } from '@fast-csv/format'
import archiver from 'archiver'
import { ChatInputCommandInteraction } from 'discord.js'
import { Request, Response } from 'express'
import { createWriteStream, existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { IncomingMessage } from 'http'
import https from 'https'
import { parse } from 'path'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { settings } from '../settings'
import {
  downloadError,
  downloadProgress,
  downloadSuccess,
  missingFile,
  missingPath,
  noPlayer,
  noRunning,
  unexpectedError,
} from '../utils/replies'
import { sanitize } from '../utils/sanitize'

export async function download(interaction: ChatInputCommandInteraction) {
  const action = logger.start('download')
  await interaction.deferReply({ ephemeral: true })
  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
    } else {
      const participations = await prisma.participation.findMany({
        where: { tournamentId: current.id },
        include: { user: true },
      })
      if (!participations.length) {
        await interaction.editReply({ embeds: [noPlayer()] })
      } else {
        const path = `${settings.zipDir}/${sanitize(current.name)}`
        const archive = archiver('zip')
        archive.pipe(createWriteStream(path))

        const promptoscope = format({ delimiter: ';', quote: '"', writeBOM: true })
        promptoscope.write(['Utilisateur', 'Prompt', 'URL'])
        archive.append(promptoscope, { name: 'promptoscope.csv' })

        for (const [index, participation] of participations.entries()) {
          const stream = await new Promise<IncomingMessage>((resolve) => https.get(participation.url, resolve))
          archive.append(stream, { name: `${sanitize(participation.user.username)}.png` })
          promptoscope.write([participation.user.username, participation.prompt, participation.url])
          await interaction.editReply({ embeds: [downloadProgress(index / participations.length)] })
        }

        promptoscope.end()
        await archive.finalize()

        await interaction.editReply({ embeds: [downloadSuccess(path, participations)] })
      }
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [downloadError()] })
  }
}

export async function downloadCallback(req: Request, res: Response) {
  const action = logger.start('download_callback')
  try {
    const { path } = req.query
    if (typeof path !== 'string') {
      res.status(404).send(missingPath())
    } else if (!existsSync(path)) {
      res.status(404).send(missingFile())
    } else {
      const { name } = parse(path)
      await new Promise<void>((resolve, reject) =>
        res.download(path, `${name}.zip`, (err) => (err ? reject(err) : resolve()))
      )
      console.log('Coucou')
      await unlink(path)
    }
    action.success()
  } catch (error) {
    action.error(error)
    res.status(500).send(unexpectedError())
  }
}
