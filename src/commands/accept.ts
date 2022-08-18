import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { acceptError, acceptQuestion, acceptSuccess, alreadyAccepted, notAccepted } from '../utils/replies'

export async function accept(interaction: ChatInputCommandInteraction) {
  const action = logger.start('accept')
  await interaction.deferReply({ ephemeral: true })
  try {
    const user = await prisma.user.findUnique({ where: { username: interaction.user.username } })
    if (user) {
      await interaction.editReply({ embeds: [alreadyAccepted()], components: [] })
    } else {
      await interaction.editReply({
        embeds: [acceptQuestion()],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('accept-yes').setLabel('Oui !').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('accept-no').setLabel('Non !').setStyle(ButtonStyle.Danger)
          ),
        ],
      })
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [acceptError()], components: [] })
  }
}

export async function acceptCallback(interaction: ButtonInteraction, yes: boolean) {
  const action = logger.start('accept_callback')
  await interaction.deferUpdate()
  try {
    if (!yes) {
      await interaction.editReply({ embeds: [notAccepted()], components: [] })
    } else {
      await prisma.user.create({ data: { username: interaction.user.username } })
      await interaction.editReply({ embeds: [acceptSuccess()], components: [] })
    }
    action.success({ accept: yes })
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [acceptError()], components: [] })
  }
}
