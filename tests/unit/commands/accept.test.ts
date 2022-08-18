import { accept, acceptCallback } from '../../../src/commands/accept'
import { prisma } from '../../../src/prisma'
import {
  acceptButtons,
  acceptError,
  acceptQuestion,
  acceptSuccess,
  alreadyAccepted,
  notAccepted,
} from '../../../src/utils/replies'
import { mockButtonInteraction, mockChatInteraction, mockUser } from '../../mocks'

describe('accept', () => {
  beforeEach(() => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
  })

  it('should reply with already accepted message if user has aldready accepted', async () => {
    const interaction = mockChatInteraction()
    await accept(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [alreadyAccepted()] })
  })

  it('should reply with accept question if user has not aldready accepted', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)
    const interaction = mockChatInteraction()
    await accept(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [acceptQuestion()], components: [acceptButtons()] })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await accept(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [acceptError()] })
  })
})

describe('acceptCallback', () => {
  beforeEach(() => {
    jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser())
  })

  it('should reply with not accepted message if user did not accept', async () => {
    const interaction = mockButtonInteraction()
    await acceptCallback(interaction, false)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [notAccepted()], components: [] })
  })

  it('should create user', async () => {
    const interaction = mockButtonInteraction()
    await acceptCallback(interaction, true)
    expect(prisma.user.create).toHaveBeenCalledWith({ data: { username: 'username' } })
  })

  it('should reply with accept success if user did accept', async () => {
    const interaction = mockButtonInteraction()
    await acceptCallback(interaction, true)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [acceptSuccess()], components: [] })
  })

  it('should reply with accept error if error', async () => {
    jest.spyOn(prisma.user, 'create').mockRejectedValue(new Error('500'))
    const interaction = mockButtonInteraction()
    await acceptCallback(interaction, true)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [acceptError()], components: [] })
  })
})
