import { isBefore } from 'date-fns'
import { ChatInputCommandInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import {
  alreadyRegistered,
  closed,
  invalidUrl,
  missingPrompt,
  missingUrl,
  mustAccept,
  newPlayer,
  noRunning,
  registerError,
  registerSuccess,
} from '../utils/replies'

export async function register(interaction: ChatInputCommandInteraction) {
  const action = logger.start('register')
  await interaction.deferReply({ ephemeral: true })

  try {
    const user = await prisma.user.findUnique({ where: { username: interaction.user.username } })
    if (!user) {
      await interaction.editReply({ embeds: [mustAccept()] })
    } else {
      const current = await prisma.tournament.findFirst({ where: { running: true } })
      if (!current) {
        await interaction.editReply({ embeds: [noRunning()] })
      } else if (isBefore(current.endDate, new Date())) {
        await interaction.editReply({ embeds: [closed(current)] })
      } else {
        const prompt = interaction.options.getString('prompt')
        if (!prompt) {
          await interaction.editReply({ embeds: [missingPrompt()] })
        } else {
          const url = interaction.options.getString('url')
          if (!url) {
            await interaction.editReply({ embeds: [missingUrl()] })
          } else if (!isUrlValid(url)) {
            await interaction.editReply({ embeds: [invalidUrl()] })
          } else {
            const existingUrl = await prisma.participation.findFirst({
              where: { tournamentId: current.id, url },
              include: { user: true },
            })
            if (existingUrl && existingUrl.user.username !== user.username) {
              await interaction.editReply({ embeds: [alreadyRegistered()] })
            } else {
              const participation = await prisma.participation.upsert({
                where: { tournamentId_userId: { tournamentId: current.id, userId: user.id } },
                create: { tournamentId: current.id, userId: user.id, prompt, url, votes: 0 },
                update: { prompt, url },
              })
              await interaction.editReply({ embeds: [registerSuccess(current.name, participation)] })
              await interaction.followUp({ embeds: [newPlayer(interaction.user, current.name)] })
            }
          }
        }
      }
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [registerError()] })
  }
}

function isUrlValid(url: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol)
  } catch (error) {
    return false
  }
}
