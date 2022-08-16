import { ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { cancelError, cancelSuccess, noRunning } from '../utils/replies'

export async function cancel(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const current = await prisma.tournament.findFirst({ where: { running: true } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
      return
    }

    await prisma.tournament.update({ where: { id: current.id }, data: { running: false } })
    await interaction.editReply({ embeds: [cancelSuccess(current.name)] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [cancelError()] })
  }
}
