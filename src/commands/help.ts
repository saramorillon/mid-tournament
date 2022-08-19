import { ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js'
import { logger } from '../logger'
import { helpError, helpSuccess } from '../utils/replies'

export async function help(interaction: ChatInputCommandInteraction) {
  const action = logger.start('help')
  try {
    if (!interaction.member || typeof interaction.member.permissions === 'string') {
      await interaction.reply({ embeds: [helpSuccess()], ephemeral: true })
    } else {
      await interaction.reply({
        embeds: [helpSuccess(interaction.member.permissions.has(PermissionFlagsBits.Administrator))],
        ephemeral: true,
      })
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.reply({ embeds: [helpError()], ephemeral: true })
  }
}
