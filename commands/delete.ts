import { REST, Routes } from 'discord.js'
import { settings } from '../src/settings'

const { clientId, guildId, token } = settings.credentials

new REST({ version: '10' })
  .setToken(token)
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
  .then(() => console.log('Successfully deleted application commands.'))
  .catch(console.error)
