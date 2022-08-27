import { getMockReq, getMockRes } from '@jest-mock/express'
import https from 'https'
import { download, downloadCallback } from '../../../src/commands/download'
import { prisma } from '../../../src/prisma'
import { downloadError, downloadSuccess, noPlayer, noRunning } from '../../../src/utils/replies'
import {
  mock,
  mockArchiver,
  mockChatInteraction,
  mockFormatCsv,
  mockParticipation,
  mockParticipationWithUser,
  mockTournament,
  mockTournamentWithParticipationsWithUser,
  mockUser,
} from '../../mocks'

jest.mock('archiver')
jest.mock('https')
jest.mock('@fast-csv/format')

describe('download', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([])
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

  it('should reply with download success', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([mockParticipation()])
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [downloadSuccess(1, [mockParticipation()])] })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [downloadError()] })
  })
})

describe('downloadCallback', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findUnique').mockResolvedValue(null)
    mock(https.get).mockImplementation((url, fn) => fn(`stream-${url}`))
    mockArchiver()
    mockFormatCsv()
  })

  it('should get tournament', async () => {
    const req = getMockReq({ params: { id: '1' } })
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(prisma.tournament.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { participations: { include: { user: true }, orderBy: { user: { username: 'asc' } } } },
    })
  })

  it('should return 404 status if no tournament is found', async () => {
    const req = getMockReq({ params: { id: '1' } })
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(res.sendStatus).toHaveBeenCalledWith(404)
  })

  it('should pipe archive to response', async () => {
    jest.spyOn(prisma.tournament, 'findUnique').mockResolvedValue(mockTournamentWithParticipationsWithUser())
    const archive = mockArchiver()
    const req = getMockReq({ params: { id: '1' } })
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/zip')
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'Content-Disposition: attachment; filename="name.zip"')
    expect(archive.pipe).toHaveBeenCalledWith(res)
  })

  it('should add promptoscope in archive', async () => {
    jest.spyOn(prisma.tournament, 'findUnique').mockResolvedValue(mockTournamentWithParticipationsWithUser())
    const archive = mockArchiver()
    const promptoscope = mockFormatCsv()
    const req = getMockReq({ params: { id: '1' } })
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(promptoscope.write).toHaveBeenCalledWith(['username', 'prompt', 'http://url.com'])
    expect(archive.append).toHaveBeenCalledWith(promptoscope, { name: 'promptoscope.csv' })
  })

  it('should add each participation file in archive', async () => {
    jest.spyOn(prisma.tournament, 'findUnique').mockResolvedValue(
      mockTournamentWithParticipationsWithUser({
        participations: [mockParticipationWithUser({ user: mockUser({ username: '^ toto //' }) })],
      })
    )
    const archive = mockArchiver()
    const req = getMockReq({ params: { id: '1' } })
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(archive.append).toHaveBeenCalledWith('stream-http://url.com', { name: '__toto___.png' })
  })

  it('should return 500 status if error', async () => {
    jest.spyOn(prisma.tournament, 'findUnique').mockRejectedValue(new Error('500'))
    const req = getMockReq({ params: { id: '1' } })
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(res.sendStatus).toHaveBeenCalledWith(500)
  })
})
