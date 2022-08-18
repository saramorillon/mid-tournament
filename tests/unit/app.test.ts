import { Client, GatewayIntentBits } from 'discord.js'
import EventEmitter from 'events'
import { App } from '../../src/app'
import { acceptCallback } from '../../src/commands/accept'
import { createCallback } from '../../src/commands/create'
import { deleteDataCallback } from '../../src/commands/delete'
import { info } from '../../src/commands/info'
import { logger } from '../../src/logger'
import { mock, mockButtonInteraction, mockChatInteraction, mockModalInteraction } from '../mocks'

jest.mock('discord.js', () => ({ ...jest.requireActual('discord.js'), Client: jest.fn() }))
jest.mock('../../src/logger')
jest.mock('../../src/commands/info')
jest.mock('../../src/commands/accept')
jest.mock('../../src/commands/delete')
jest.mock('../../src/commands/create')

class MockClient extends EventEmitter {
  login = jest.fn()
}

describe('run', () => {
  beforeEach(() => {
    mock(Client).mockReturnValue(new MockClient())
  })

  it('should create client', async () => {
    await new App().run()
    expect(Client).toHaveBeenCalledWith({ intents: [GatewayIntentBits.Guilds] })
  })

  it('should log when ready', async () => {
    const clientMock = new MockClient()
    mock(Client).mockReturnValue(clientMock)
    await new App().run()
    clientMock.emit('ready')
    expect(logger.info).toHaveBeenCalledWith('Ready!')
  })

  it('should listen to interaction event', async () => {
    const clientMock = new MockClient()
    mock(Client).mockReturnValue(clientMock)
    const app = new App()
    app.onInteraction = jest.fn()
    await app.run()
    clientMock.emit('interactionCreate', 'interaction')
    expect(app.onInteraction).toHaveBeenCalledWith('interaction')
  })

  it('should login using token', async () => {
    const clientMock = new MockClient()
    mock(Client).mockReturnValue(clientMock)
    await new App().run()
    expect(clientMock.login).toHaveBeenCalledWith('token')
  })
})

describe('onInteraction', () => {
  it('should reply with command not found message if command does not exist', async () => {
    const app = new App()
    const interaction = mockChatInteraction()
    interaction.commandName = 'test'
    await app.onInteraction(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Command `/test` does not exist', ephemeral: true })
  })

  it('should execute command', async () => {
    const app = new App()
    const interaction = mockChatInteraction()
    interaction.commandName = 'mt-info'
    await app.onInteraction(interaction)
    expect(info).toHaveBeenCalledWith(interaction)
  })

  it('should accept privacy policy', async () => {
    const interaction = mockButtonInteraction()
    interaction.customId = 'accept-yes'
    await new App().onInteraction(interaction)
    expect(acceptCallback).toHaveBeenCalledWith(interaction, true)
  })

  it('should decline privacy policy', async () => {
    const interaction = mockButtonInteraction()
    interaction.customId = 'accept-no'
    await new App().onInteraction(interaction)
    expect(acceptCallback).toHaveBeenCalledWith(interaction, false)
  })

  it('should delete user data', async () => {
    const interaction = mockButtonInteraction()
    interaction.customId = 'delete-yes'
    await new App().onInteraction(interaction)
    expect(deleteDataCallback).toHaveBeenCalledWith(interaction, true)
  })

  it('should keep user data', async () => {
    const interaction = mockButtonInteraction()
    interaction.customId = 'delete-no'
    await new App().onInteraction(interaction)
    expect(deleteDataCallback).toHaveBeenCalledWith(interaction, false)
  })

  it('should create tournament', async () => {
    const interaction = mockModalInteraction()
    Object.assign(interaction, { customId: 'create' })
    await new App().onInteraction(interaction)
    expect(createCallback).toHaveBeenCalledWith(interaction)
  })
})
