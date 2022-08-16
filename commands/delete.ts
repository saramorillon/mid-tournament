import { REST, Routes } from 'discord.js'
import { settings } from '../src/settings'

new REST({ version: '10' })
  .setToken(settings.credentials.token)
  .put(Routes.applicationCommands(settings.credentials.clientId), { body: [] })
  .then(() => console.log('Successfully deleted application commands.'))
  .catch(console.error)
