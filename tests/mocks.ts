import { format } from '@fast-csv/format'
import { Participation, Tournament, User } from '@prisma/client'
import archiver from 'archiver'
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  ModalSubmitInteraction,
  User as DiscordUser,
} from 'discord.js'
import EventEmitter from 'events'
import express from 'express'
import { PassThrough } from 'stream'

export function mock(fn: unknown): jest.Mock {
  return fn as jest.Mock
}

export function mockTournament(tournament?: Partial<Tournament>): Tournament {
  return {
    id: 1,
    name: 'name',
    description: 'description',
    running: true,
    startDate: new Date('2022-01-01T00:00:00.000Z'),
    endDate: new Date('2023-01-01T00:00:00.000Z'),
    ...tournament,
  }
}

export function mockTournamentWithParticipationsWithUser(
  tournament?: Partial<Tournament & { participations: (Participation & { user: User })[] }>
): Tournament & { participations: (Participation & { user: User })[] } {
  return {
    id: 1,
    name: 'name',
    description: 'description',
    running: true,
    startDate: new Date('2022-01-01T00:00:00.000Z'),
    endDate: new Date('2023-01-01T00:00:00.000Z'),
    participations: [mockParticipationWithUser()],
    ...tournament,
  }
}

export function mockTournamentWithCount(
  tournament?: Partial<Tournament & { _count: { participations: number } }>
): Tournament & { _count: { participations: number } } {
  return {
    ...mockTournament(tournament),
    _count: { participations: 0 },
    ...tournament,
  }
}

export function mockParticipation(participation?: Partial<Participation>): Participation {
  return {
    id: 1,
    tournamentId: 1,
    userId: 1,
    prompt: 'prompt',
    url: 'http://url.com',
    votes: 0,
    ...participation,
  }
}

export function mockParticipationWithUser(
  participation?: Partial<Participation & { user: User }>
): Participation & { user: User } {
  return {
    ...mockParticipation(participation),
    user: mockUser(),
    ...participation,
  }
}

export function mockUser(user?: Partial<User>): User {
  return {
    id: 1,
    username: 'username',
    ...user,
  }
}

export function mockDiscordUser(): DiscordUser {
  return {
    username: 'username',
    avatarURL: jest.fn().mockReturnValue('http://avatar-url.com'),
  } as unknown as DiscordUser
}

export function mockChatInteraction(): ChatInputCommandInteraction {
  return {
    user: { username: 'username' },
    reply: jest.fn(),
    deferReply: jest.fn(),
    editReply: jest.fn(),
    channel: { send: jest.fn() },
    showModal: jest.fn(),
    options: { getString: jest.fn() },
    isChatInputCommand: jest.fn().mockReturnValue(true),
  } as unknown as ChatInputCommandInteraction
}

export function mockButtonInteraction(): ButtonInteraction {
  return {
    user: { username: 'username' },
    customId: '',
    reply: jest.fn(),
    deferUpdate: jest.fn(),
    editReply: jest.fn(),
    channel: { send: jest.fn() },
    isChatInputCommand: jest.fn().mockReturnValue(false),
    isButton: jest.fn().mockReturnValue(true),
  } as unknown as ButtonInteraction
}

export function mockModalInteraction(): ModalSubmitInteraction {
  return {
    user: { username: 'username' },
    reply: jest.fn(),
    deferReply: jest.fn(),
    editReply: jest.fn(),
    channel: { send: jest.fn() },
    showModal: jest.fn(),
    fields: { getTextInputValue: jest.fn() },
    isChatInputCommand: jest.fn().mockReturnValue(false),
    isButton: jest.fn().mockReturnValue(false),
    isModalSubmit: jest.fn().mockReturnValue(true),
  } as unknown as ModalSubmitInteraction
}

class MockClient extends EventEmitter {
  login = jest.fn()
}

export function mockDiscordClient() {
  const clientMock = new MockClient()
  mock(Client).mockReturnValue(clientMock)
  return clientMock
}

class Archiver extends PassThrough {
  pipe = jest.fn()
  append = jest.fn()
  finalize = jest.fn()
}

export function mockArchiver() {
  const archive = new Archiver()
  mock(archiver).mockReturnValue(archive)
  return archive
}

export function mockFormatCsv() {
  const promptoscope = { write: jest.fn(), end: jest.fn() }
  mock(format).mockReturnValue(promptoscope)
  return promptoscope
}

export function mockExpress() {
  const app = { use: jest.fn(), listen: jest.fn().mockImplementation((_, fn) => fn()) }
  mock(express).mockReturnValue(app)
  return app
}
