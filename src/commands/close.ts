import { ChatInputCommandInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { closeError, closeSuccess, noRunning } from '../utils/replies'

export async function close(interaction: ChatInputCommandInteraction) {
  const action = logger.start('close')
  await interaction.deferReply({ ephemeral: true })
  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
    } else {
      await prisma.tournament.update({ where: { id: current.id }, data: { endDate: new Date() } })
      await interaction.editReply({ embeds: [closeSuccess(current.name)] })
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [closeError()] })
  }
}
