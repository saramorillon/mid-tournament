import { cancel } from '../../../src/commands/cancel'
import { prisma } from '../../../src/prisma'
import { cancelError, cancelSuccess, noRunning } from '../../../src/utils/replies'
import { mockChatInteraction, mockTournament } from '../../mocks'

describe('cancel', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.tournament, 'update').mockResolvedValue(mockTournament())
  })

  it('should reply with no running message if no tournament is running', async () => {
    const interaction = mockChatInteraction()
    await cancel(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [noRunning()] })
  })

  it('should cancel tournament', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    await cancel(interaction)
    expect(prisma.tournament.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { running: false } })
  })

  it('should reply with cancel success if a tournament is running', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    await cancel(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [cancelSuccess('name')] })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await cancel(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [cancelError()] })
  })
})
