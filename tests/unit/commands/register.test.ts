import { register } from '../../../src/commands/register'
import { prisma } from '../../../src/prisma'
import {
  alreadyRegistered,
  closed,
  invalidUrl,
  missingPrompt,
  missingUrl,
  mustAccept,
  newPlayer,
  noRunning,
  registerError,
  registerSuccess,
} from '../../../src/utils/replies'
import {
  mock,
  mockChatInteraction,
  mockDiscordUser,
  mockParticipation,
  mockParticipationWithUser,
  mockTournament,
  mockUser,
} from '../../mocks'

describe('register', () => {
  beforeEach(() => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(mockParticipationWithUser())
    jest.spyOn(prisma.participation, 'upsert').mockResolvedValue(mockParticipation())
  })

  it('should reply with must accept message if user is not found', async () => {
    const interaction = mockChatInteraction()
    mock(interaction.options.getString).mockReturnValue('')
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [mustAccept()] })
  })

  it('should reply with no running message if no tournament is running', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    const interaction = mockChatInteraction()
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [noRunning()] })
  })

  it('should reply with closed message if no tournament is closed', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    const tournament = mockTournament({ endDate: new Date('2000-01-01T00:00:00.000Z') })
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(tournament)
    const interaction = mockChatInteraction()
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [closed(tournament)] })
  })

  it('should reply with missing prompt message if prompt is missing', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    mock(interaction.options.getString).mockReturnValue('')
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [missingPrompt()] })
  })

  it('should reply with missing url message if url is missing', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    mock(interaction.options.getString).mockReturnValueOnce('prompt').mockReturnValue('')
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [missingUrl()] })
  })

  it('should reply with invalid url message if url is not valid', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    mock(interaction.options.getString).mockReturnValueOnce('prompt').mockReturnValueOnce('url')
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [invalidUrl()] })
  })

  it('should reply with already registered message if url already exists', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser({ username: 'another user' }))
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    mock(interaction.options.getString).mockReturnValueOnce('prompt').mockReturnValueOnce('http://url.com')
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [alreadyRegistered()] })
  })

  it('should register participation', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(null)
    const interaction = mockChatInteraction()
    mock(interaction.options.getString).mockReturnValueOnce('prompt').mockReturnValueOnce('http://url.com')
    await register(interaction)
    expect(prisma.participation.upsert).toHaveBeenCalledWith({
      create: {
        prompt: 'prompt',
        tournamentId: 1,
        url: 'http://url.com',
        userId: 1,
        votes: 0,
      },
      update: { prompt: 'prompt', url: 'http://url.com' },
      where: { tournamentId_userId: { tournamentId: 1, userId: 1 } },
    })
  })

  it('should reply with register success message', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(null)
    const interaction = mockChatInteraction()
    mock(interaction.options.getString).mockReturnValueOnce('prompt').mockReturnValueOnce('http://url.com')
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [registerSuccess('name', mockParticipation())] })
  })

  it('should follow up with new player message', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(null)
    const interaction = mockChatInteraction()
    interaction.user = mockDiscordUser()
    mock(interaction.options.getString).mockReturnValueOnce('prompt').mockReturnValueOnce('http://url.com')
    await register(interaction)
    expect(interaction.followUp).toHaveBeenCalledWith({ embeds: [newPlayer(mockDiscordUser(), 'name')] })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await register(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [registerError()] })
  })
})
