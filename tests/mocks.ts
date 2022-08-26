import { Participation, Tournament, User } from '@prisma/client'
import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, User as DiscordUser } from 'discord.js'

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
    followUp: jest.fn(),
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
    followUp: jest.fn(),
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
    followUp: jest.fn(),
    showModal: jest.fn(),
    fields: { getTextInputValue: jest.fn() },
    isChatInputCommand: jest.fn().mockReturnValue(false),
    isButton: jest.fn().mockReturnValue(false),
    isModalSubmit: jest.fn().mockReturnValue(true),
  } as unknown as ModalSubmitInteraction
}
