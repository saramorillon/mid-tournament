import { ChatInputCommandInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { cancelError, cancelSuccess, noRunning } from '../utils/replies'

export async function cancel(interaction: ChatInputCommandInteraction) {
  const action = logger.start('cancel')
  await interaction.deferReply({ ephemeral: true })
  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
    } else {
      await prisma.tournament.update({ where: { id: current.id }, data: { running: false } })
      await interaction.editReply({ embeds: [cancelSuccess(current.name)] })
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [cancelError()] })
  }
}
