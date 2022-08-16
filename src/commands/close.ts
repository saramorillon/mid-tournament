import { ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { closeError, closeSuccess, noRunning } from '../utils/replies'

export async function close(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
      return
    }

    await prisma.tournament.update({ where: { id: current.id }, data: { endDate: new Date() } })
    await interaction.editReply({ embeds: [closeSuccess(current.name)] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [closeError()] })
  }
}
