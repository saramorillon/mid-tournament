import { Client, GatewayIntentBits } from 'discord.js'
import { getCommand } from './commands'
import { acceptCallback } from './commands/accept'
import { createCallback } from './commands/create'
import { deleteDataCallback } from './commands/delete'
import { logger } from './logger'
import { settings } from './settings'

export async function startApp() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  client.once('ready', () => {
    logger.info('Ready!')
  })

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction
      const command = getCommand(commandName)
      if (!command) {
        await interaction.reply({ content: `Command \`/${commandName}\` does not exist`, ephemeral: true })
      } else {
        await command.execute(interaction)
      }
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith('accept')) {
        await acceptCallback(interaction, interaction.customId === 'accept-yes')
      } else if (interaction.customId.startsWith('delete')) {
        await deleteDataCallback(interaction, interaction.customId === 'delete-yes')
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'create') {
        await createCallback(interaction)
      }
    }
  })

  await client.login(settings.credentials.token)
}
