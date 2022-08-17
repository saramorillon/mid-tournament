import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { acceptError, acceptQuestion, acceptSuccess, alreadyAccepted, notAccepted } from '../utils/replies'

export async function accept(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const user = await prisma.user.findUnique({ where: { username: interaction.user.username } })
    if (user) {
      await interaction.editReply({ embeds: [alreadyAccepted()], components: [] })
      return
    }

    await interaction.editReply({
      embeds: [acceptQuestion()],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('accept-yes').setLabel('Oui !').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('accept-no').setLabel('Non !').setStyle(ButtonStyle.Danger)
        ),
      ],
    })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [acceptError()], components: [] })
  }
}

export async function acceptCallback(interaction: ButtonInteraction, yes: boolean) {
  await interaction.deferUpdate()

  try {
    if (!yes) {
      await interaction.editReply({ embeds: [notAccepted()], components: [] })
      return
    }

    await prisma.user.create({ data: { username: interaction.user.username } })
    await interaction.editReply({ embeds: [acceptSuccess()], components: [] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [acceptError()], components: [] })
  }
}
