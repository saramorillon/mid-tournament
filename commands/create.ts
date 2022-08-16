import { REST, Routes } from 'discord.js'
import { commands } from '../src/commands'
import { settings } from '../src/settings'

const body = commands.map(({ builder }) => builder.toJSON())

new REST({ version: '10' })
  .setToken(settings.credentials.token)
  .put(Routes.applicationCommands(settings.credentials.clientId), { body })
  .then(() => console.log('Successfully created application commands.'))
  .catch(console.error)
