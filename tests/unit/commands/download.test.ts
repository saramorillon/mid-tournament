import { download } from '../../../src/commands/download'
import { prisma } from '../../../src/prisma'
import { downloadAttachment, downloadError, downloadSuccess, noPlayer, noRunning } from '../../../src/utils/replies'
import { zip } from '../../../src/utils/zip'
import { mock, mockChatInteraction, mockParticipation, mockTournament } from '../../mocks'

jest.mock('../../../src/utils/zip')

describe('download', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([])
    mock(zip).mockResolvedValue(Buffer.from([]))
  })

  it('should reply with no running message if no tournament is running', async () => {
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [noRunning()] })
  })

  it('should reply with no player message if no participation', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [noPlayer()] })
  })

  it('should create zip', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([mockParticipation()])
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(zip).toHaveBeenCalledWith([mockParticipation()])
  })

  it('should reply with download success', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([mockParticipation()])
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: [downloadSuccess([mockParticipation()])],
      files: [downloadAttachment('name', Buffer.from([]))],
    })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [downloadError()] })
  })
})
