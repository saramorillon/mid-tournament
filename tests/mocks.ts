import { Participation, Tournament, User } from '@prisma/client'

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

export function mockParticipationWithUser(participation?: Partial<Participation & { user: User }>): Participation & { user: User } {
  return {
    id: 1,
    tournamentId: 1,
    userId: 1,
    prompt: 'prompt',
    url: 'http://url.com',
    votes: 0,
    user: mockUser(participation?.user),
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
