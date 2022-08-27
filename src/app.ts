import { Client, GatewayIntentBits, Interaction } from 'discord.js'
import express from 'express'
import helmet from 'helmet'
import { commandsMap } from './commands'
import { acceptCallback } from './commands/accept'
import { createCallback } from './commands/create'
import { deleteDataCallback } from './commands/delete'
import { downloadCallback } from './commands/download'
import { logger } from './logger'
import { settings } from './settings'

export class App {
  async run() {
    await this.startClient()
    await this.startServer()
  }

  async startClient() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] })
    client.once('ready', () => {
      logger.info('Client ready!')
    })
    client.on('interactionCreate', this.onInteraction.bind(this))
    await client.login(settings.credentials.token)
  }

  async startServer() {
    const app = express()
    app.use(helmet())
    app.use('/download', downloadCallback)
    await new Promise<void>((resolve) => app.listen(settings.app.port, resolve))
    logger.info('Server ready!')
  }

  async onInteraction(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction
      if (!commandsMap[commandName]) {
        await interaction.reply({ content: `Command \`/${commandName}\` does not exist`, ephemeral: true })
      } else {
        await commandsMap[commandName].execute(interaction)
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
  }
}
