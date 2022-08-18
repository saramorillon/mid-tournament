import { deleteData, deleteDataCallback } from '../../../src/commands/delete'
import { prisma } from '../../../src/prisma'
import {
  alreadyDeleted,
  deleteButtons,
  deleteError,
  deleteQuestion,
  deleteSuccess,
  notDeleted,
} from '../../../src/utils/replies'
import { mockButtonInteraction, mockChatInteraction, mockUser } from '../../mocks'

describe('deleteData', () => {
  beforeEach(() => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)
  })

  it('should reply with already deleted message if user has aldready been deleted', async () => {
    const interaction = mockChatInteraction()
    await deleteData(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [alreadyDeleted()] })
  })

  it('should reply with deleteData question if user has not aldready been deleted', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser())
    const interaction = mockChatInteraction()
    await deleteData(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [deleteQuestion()], components: [deleteButtons()] })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await deleteData(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [deleteError()] })
  })
})

describe('deleteDataCallback', () => {
  beforeEach(() => {
    jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser())
  })

  it('should reply with not deleted message if user did not accept', async () => {
    const interaction = mockButtonInteraction()
    await deleteDataCallback(interaction, false)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [notDeleted()], components: [] })
  })

  it('should create user', async () => {
    const interaction = mockButtonInteraction()
    await deleteDataCallback(interaction, true)
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { username: 'username' } })
  })

  it('should reply with delete success if user did accept', async () => {
    const interaction = mockButtonInteraction()
    await deleteDataCallback(interaction, true)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [deleteSuccess()], components: [] })
  })

  it('should reply with delete error if error', async () => {
    jest.spyOn(prisma.user, 'delete').mockRejectedValue(new Error('500'))
    const interaction = mockButtonInteraction()
    await deleteDataCallback(interaction, true)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [deleteError()], components: [] })
  })
})
