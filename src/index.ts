import { Client, GatewayIntentBits } from 'discord.js'
import { getCommand } from './commands'
import { settings } from './settings'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once('ready', () => {
  console.log('Ready!')
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction
    const command = getCommand(commandName)
    if (!command) {
      await interaction.reply({ content: `Command "/${commandName}" does not exist`, ephemeral: true })
    } else {
      await command.execute(interaction)
    }
  }
})

client.login(settings.credentials.token)
