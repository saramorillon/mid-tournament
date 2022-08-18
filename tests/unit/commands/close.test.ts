import { close } from '../../../src/commands/close'
import { prisma } from '../../../src/prisma'
import { closeError, closeSuccess, noRunning } from '../../../src/utils/replies'
import { mockChatInteraction, mockTournament } from '../../mocks'

describe('close', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.tournament, 'update').mockResolvedValue(mockTournament())
  })

  it('should reply with no running message if no tournament is running', async () => {
    const interaction = mockChatInteraction()
    await close(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [noRunning()] })
  })

  it('should close tournament', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    await close(interaction)
    expect(prisma.tournament.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { endDate: new Date() } })
  })

  it('should reply with close success if a tournament is running', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    await close(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [closeSuccess('name')] })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await close(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [closeError()] })
  })
})
