import { Client, GatewayIntentBits } from 'discord.js'
import helmet from 'helmet'
import { App } from '../../src/app'
import { acceptCallback } from '../../src/commands/accept'
import { createCallback } from '../../src/commands/create'
import { deleteDataCallback } from '../../src/commands/delete'
import { downloadCallback } from '../../src/commands/download'
import { info } from '../../src/commands/info'
import { logger } from '../../src/logger'
import {
  mock,
  mockButtonInteraction,
  mockChatInteraction,
  mockDiscordClient,
  mockExpress,
  mockModalInteraction,
} from '../mocks'

jest.mock('discord.js', () => ({ ...jest.requireActual('discord.js'), Client: jest.fn() }))
jest.mock('express')
jest.mock('helmet')
jest.mock('../../src/logger')
jest.mock('../../src/commands/info')
jest.mock('../../src/commands/accept')
jest.mock('../../src/commands/delete')
jest.mock('../../src/commands/create')

describe('run', () => {
  it('should start client', async () => {
    const app = new App()
    app.startClient = jest.fn()
    app.startServer = jest.fn()
    await app.run()
    expect(app.startClient).toHaveBeenCalled()
  })

  it('should start server', async () => {
    const app = new App()
    app.startClient = jest.fn()
    app.startServer = jest.fn()
    await app.run()
    expect(app.startServer).toHaveBeenCalled()
  })
})

describe('startClient', () => {
  beforeEach(() => {
    mockDiscordClient()
  })

  it('should create client', async () => {
    await new App().startClient()
    expect(Client).toHaveBeenCalledWith({ intents: [GatewayIntentBits.Guilds] })
  })

  it('should log when ready', async () => {
    const clientMock = mockDiscordClient()
    await new App().startClient()
    clientMock.emit('ready')
    expect(logger.info).toHaveBeenCalledWith('Client ready!')
  })

  it('should listen to interaction event', async () => {
    const clientMock = mockDiscordClient()
    const app = new App()
    app.onInteraction = jest.fn()
    await app.startClient()
    clientMock.emit('interactionCreate', 'interaction')
    expect(app.onInteraction).toHaveBeenCalledWith('interaction')
  })

  it('should login using token', async () => {
    const clientMock = mockDiscordClient()
    await new App().startClient()
    expect(clientMock.login).toHaveBeenCalledWith('token')
  })
})

describe('startServer', () => {
  beforeEach(() => {
    mockExpress()
    mock(helmet).mockReturnValue('helmet')
  })

  it('should use helmet', async () => {
    const express = mockExpress()
    const app = new App()
    await app.startServer()
    expect(express.use).toHaveBeenCalledWith('helmet')
  })

  it('should use route', async () => {
    const express = mockExpress()
    const app = new App()
    await app.startServer()
    expect(express.use).toHaveBeenCalledWith('/download', downloadCallback)
  })

  it('should listen to settings port', async () => {
    const express = mockExpress()
    const app = new App()
    await app.startServer()
    expect(express.listen).toHaveBeenCalledWith(3000, expect.any(Function))
  })

  it('should log success', async () => {
    const app = new App()
    await app.startServer()
    expect(logger.info).toHaveBeenCalledWith('Server ready!')
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
