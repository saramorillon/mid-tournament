import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { downloadError, downloadSuccess, noParticipant, noRunning } from '../utils/replies'
import { zip } from '../utils/zip'

export async function download(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
      return
    }

    const participations = await prisma.participation.findMany({ where: { tournamentId: current.id } })
    if (!participations.length) {
      await interaction.editReply({ embeds: [noParticipant()] })
      return
    }

    const archive = await zip(participations)
    await interaction.editReply({ embeds: [downloadSuccess(participations)], files: [new AttachmentBuilder(archive).setName(`${current.name}.zip`)] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [downloadError()] })
  }
}
