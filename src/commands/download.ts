import { format } from '@fast-csv/format'
import archiver from 'archiver'
import { ChatInputCommandInteraction } from 'discord.js'
import { Request, Response } from 'express'
import { IncomingMessage } from 'http'
import https from 'https'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { downloadError, downloadSuccess, noPlayer, noRunning } from '../utils/replies'

export async function download(interaction: ChatInputCommandInteraction) {
  const action = logger.start('download')
  await interaction.deferReply({ ephemeral: true })
  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
    } else {
      const participations = await prisma.participation.findMany({ where: { tournamentId: current.id } })
      if (!participations.length) {
        await interaction.editReply({ embeds: [noPlayer()] })
      } else {
        await interaction.editReply({ embeds: [downloadSuccess(current.id, participations)] })
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
    const { id } = req.params
    const tournament = await prisma.tournament.findUnique({
      where: { id: Number(id) },
      include: { participations: { include: { user: true }, orderBy: { user: { username: 'asc' } } } },
    })
    if (!tournament) {
      res.sendStatus(404)
    } else {
      const archive = archiver('zip')
      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Type', `Content-Disposition: attachment; filename="${tournament.name}.zip"`)
      archive.pipe(res)

      const promptoscope = format({ delimiter: ';', quote: '"', writeBOM: true })
      promptoscope.write(['Utilisateur', 'Prompt', 'URL'])
      archive.append(promptoscope, { name: 'promptoscope.csv' })

      for (const participation of tournament.participations) {
        const stream = await new Promise<IncomingMessage>((resolve) => https.get(participation.url, resolve))
        archive.append(stream, { name: `${participation.user.username.replace(/[^a-z0-9-_]/gi, '_')}.png` })
        promptoscope.write([participation.user.username, participation.prompt, participation.url])
      }

      promptoscope.end()
      await archive.finalize()
    }
    action.success()
  } catch (error) {
    action.error(error)
    res.sendStatus(500)
  }
}
