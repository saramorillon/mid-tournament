import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { downloadError, downloadSuccess, noPlayer, noRunning } from '../utils/replies'
import { zip } from '../utils/zip'

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
        const archive = await zip(participations)
        const file = new AttachmentBuilder(archive).setName(`${current.name}.zip`)
        await interaction.editReply({ embeds: [downloadSuccess(participations)], files: [file] })
      }
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [downloadError()] })
  }
}
