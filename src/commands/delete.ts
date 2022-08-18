import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { alreadyDeleted, deleteButtons, deleteError, deleteQuestion, deleteSuccess, notDeleted } from '../utils/replies'

export async function deleteData(interaction: ChatInputCommandInteraction) {
  const action = logger.start('delete_data')
  await interaction.deferReply({ ephemeral: true })
  try {
    const user = await prisma.user.findUnique({ where: { username: interaction.user.username } })
    if (!user) {
      await interaction.editReply({ embeds: [alreadyDeleted()] })
    } else {
      await interaction.editReply({ embeds: [deleteQuestion()], components: [deleteButtons()] })
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [deleteError()] })
  }
}

export async function deleteDataCallback(interaction: ButtonInteraction, yes: boolean) {
  const action = logger.start('delete_data_callback')
  await interaction.deferUpdate()
  try {
    if (!yes) {
      await interaction.editReply({ embeds: [notDeleted()], components: [] })
    } else {
      await prisma.user.delete({ where: { username: interaction.user.username } })
      await interaction.editReply({ embeds: [deleteSuccess()], components: [] })
    }
    action.success({ delete: yes })
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [deleteError()], components: [] })
  }
}
