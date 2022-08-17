import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { alreadyDeleted, deleteError, deleteQuestion, deleteSuccess, notDeleted } from '../utils/replies'

export async function deleteData(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const user = await prisma.user.findUnique({ where: { username: interaction.user.username } })
    if (!user) {
      await interaction.editReply({ embeds: [alreadyDeleted()], components: [] })
      return
    }

    await interaction.editReply({
      embeds: [deleteQuestion()],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('delete-yes').setLabel('Oui !').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('delete-no').setLabel('Non !').setStyle(ButtonStyle.Danger)
        ),
      ],
    })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [deleteError()], components: [] })
  }
}

export async function deleteDataCallback(interaction: ButtonInteraction, yes: boolean) {
  await interaction.deferUpdate()

  try {
    if (!yes) {
      await interaction.editReply({ embeds: [notDeleted()], components: [] })
      return
    }

    await prisma.user.delete({ where: { username: interaction.user.username } })
    await interaction.editReply({ embeds: [deleteSuccess()], components: [] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [deleteError()], components: [] })
  }
}
