import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { infoError, infoParticipant, infoSuccess, noRunning } from '../utils/replies'

export async function info(interaction: ButtonInteraction | ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const current = await prisma.tournament.findFirst({ where: { running: true }, include: { _count: { select: { participations: true } } } })
    if (!current) {
      await interaction.editReply({ embeds: [noRunning()] })
      return
    }

    const participation = await prisma.participation.findFirst({
      where: { tournamentId: current.id, user: { username: interaction.user.username } },
    })
    if (!participation) {
      await interaction.editReply({ embeds: [infoSuccess(current.name, current.endDate, current._count.participations)] })
      return
    }

    await interaction.editReply({ embeds: [infoParticipant(current.name, current.endDate, participation)] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [infoError()] })
  }
}
