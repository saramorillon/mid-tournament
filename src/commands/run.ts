import { ChatInputCommandInteraction } from 'discord.js'

export async function run(interaction: ChatInputCommandInteraction) {
  await interaction.reply('run')
}
