import { info } from '../../../src/commands/info'
import { prisma } from '../../../src/prisma'
import { infoError, infoSuccess, noRunning } from '../../../src/utils/replies'
import { mockChatInteraction, mockParticipation, mockTournament, mockTournamentWithCount } from '../../mocks'

describe('info', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(null)
  })

  it('should reply with no running message if no tournament is running', async () => {
    const interaction = mockChatInteraction()
    await info(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [noRunning()] })
  })

  it('should reply with info success message if user did not participate', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournamentWithCount())
    const interaction = mockChatInteraction()
    await info(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [infoSuccess(mockTournament(), 0)] })
  })

  it('should reply with info player message if user did participate', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournamentWithCount())
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(mockParticipation())
    const interaction = mockChatInteraction()
    await info(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: [infoSuccess(mockTournament(), 0, mockParticipation())],
    })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await info(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [infoError()] })
  })
})
