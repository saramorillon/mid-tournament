import { getMockReq, getMockRes } from '@jest-mock/express'
import axios from 'axios'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { download, downloadCallback } from '../../../src/commands/download'
import { prisma } from '../../../src/prisma'
import {
  downloadError,
  downloadProgress,
  downloadSuccess,
  missingFile,
  missingPath,
  noPlayer,
  noRunning,
  unexpectedError,
} from '../../../src/utils/replies'
import {
  mock,
  mockArchiver,
  mockChatInteraction,
  mockFormatCsv,
  mockParticipation,
  mockParticipationWithUser,
  mockTournament,
} from '../../mocks'

jest.mock('archiver')
jest.mock('axios')
jest.mock('@fast-csv/format')
jest.mock('fs')
jest.mock('fs/promises')

describe('download', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([])
    mock(axios.get).mockResolvedValue({ data: 'stream' })
    mockArchiver()
    mockFormatCsv()
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

  it('should add promptoscope in archive', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([mockParticipationWithUser()])
    const archive = mockArchiver()
    const promptoscope = mockFormatCsv()
    await download(mockChatInteraction())
    expect(promptoscope.write).toHaveBeenCalledWith(['username', 'prompt', 'http://url.com'])
    expect(archive.append).toHaveBeenCalledWith(promptoscope, { name: 'promptoscope.csv' })
  })

  it('should add each participation file in archive', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([mockParticipationWithUser()])
    const archive = mockArchiver()
    await download(mockChatInteraction())
    expect(archive.append).toHaveBeenCalledWith('stream', { name: 'username.png' })
  })

  it('should reply with download progress', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([mockParticipationWithUser()])
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [downloadProgress(0)] })
  })

  it('should reply with download success', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
    jest.spyOn(prisma.participation, 'findMany').mockResolvedValue([mockParticipationWithUser()])
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: [downloadSuccess('/tmp/name', [mockParticipation()])],
    })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await download(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [downloadError()] })
  })
})

describe('downloadCallback', () => {
  it('should return 404 status if path is missing', async () => {
    const req = getMockReq()
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(res.send).toHaveBeenCalledWith(missingPath())
  })

  it('should return 404 status if path does not exists', async () => {
    mock(existsSync).mockReturnValue(false)
    const req = getMockReq({ query: { path: 'path' } })
    const { res } = getMockRes()
    await downloadCallback(req, res)
    expect(res.send).toHaveBeenCalledWith(missingFile())
  })

  it('should download archive', async () => {
    mock(existsSync).mockReturnValue(true)
    const req = getMockReq({ query: { path: 'path' } })
    const { res } = getMockRes({ download: jest.fn().mockImplementation((a, b, fn) => fn()) })
    await downloadCallback(req, res)
    expect(res.download).toHaveBeenCalledWith('path', 'path.zip', expect.any(Function))
  })

  it('should delete file after download', async () => {
    mock(existsSync).mockReturnValue(true)
    const req = getMockReq({ query: { path: 'path' } })
    const { res } = getMockRes({ download: jest.fn().mockImplementation((a, b, fn) => fn()) })
    await downloadCallback(req, res)
    expect(unlink).toHaveBeenCalledWith('path')
  })

  it('should return 500 status if error', async () => {
    mock(existsSync).mockReturnValue(true)
    const req = getMockReq({ query: { path: 'path' } })
    const { res } = getMockRes({ download: jest.fn().mockImplementation((a, b, fn) => fn(new Error('500'))) })
    await downloadCallback(req, res)
    expect(res.send).toHaveBeenCalledWith(unexpectedError())
  })
})
