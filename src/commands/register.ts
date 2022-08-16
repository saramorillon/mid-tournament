import { isBefore } from 'date-fns'
import { ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { alreadyRegistered, closed, missingPrompt, missingUrl, noRunning, registerError, registerSuccess } from '../utils/replies'

export async function register(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
      return
    }

    if (isBefore(current.endDate, new Date())) {
      await interaction.editReply({ embeds: [closed(current.name, current.endDate)] })
      return
    }

    const prompt = interaction.options.getString('prompt')
    if (!prompt) {
      await interaction.editReply({ embeds: [missingPrompt()] })
      return
    }

    const url = interaction.options.getString('url')
    if (!url) {
      await interaction.editReply({ embeds: [missingUrl()] })
      return
    }

    const existingUrl = await prisma.participation.findFirst({ where: { tournamentId: current.id, url } })
    if (existingUrl && existingUrl.user !== interaction.user.username) {
      await interaction.editReply({ embeds: [alreadyRegistered()] })
      return
    }

    await prisma.participation.upsert({
      where: { tournamentId_user: { tournamentId: current.id, user: interaction.user.username } },
      create: { tournamentId: current.id, user: interaction.user.username, prompt, url, votes: 0 },
      update: { prompt, url },
    })

    await interaction.editReply({ embeds: [registerSuccess(current.name)] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [registerError()] })
  }
}
