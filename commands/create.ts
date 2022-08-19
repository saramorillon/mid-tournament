import { REST, Routes } from 'discord.js'
import { commands } from '../src/commands'
import { settings } from '../src/settings'

const { clientId, guildId, token } = settings.credentials

const body = commands.map(({ builder }) => builder.toJSON())

new REST({ version: '10' })
  .setToken(token)
  .put(Routes.applicationGuildCommands(clientId, guildId), { body })
  .then(() => console.log('Successfully created application commands.'))
  .catch(console.error)
