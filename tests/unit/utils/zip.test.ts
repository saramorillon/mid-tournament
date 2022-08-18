import { format } from '@fast-csv/format'
import archiver from 'archiver'
import https from 'https'
import { PassThrough } from 'stream'
import { zip } from '../../../src/utils/zip'
import { mock, mockParticipationWithUser } from '../../mocks'

jest.mock('archiver')
jest.mock('https')
jest.mock('@fast-csv/format')

class Archiver extends PassThrough {
  append = jest.fn()
  finalize = jest.fn()
}

describe('zip', () => {
  beforeEach(() => {
    mock(https.get).mockImplementation((url, fn) => fn(`stream-${url}`))
    mock(archiver).mockReturnValue(new Archiver())
    mock(format).mockReturnValue({ write: jest.fn(), end: jest.fn() })
  })

  it('should add promptoscope in archive', async () => {
    const archive = new Archiver()
    mock(archiver).mockReturnValue(archive)
    const promptoscope = { write: jest.fn(), end: jest.fn() }
    mock(format).mockReturnValue(promptoscope)
    const promise = zip([mockParticipationWithUser()])
    archive.emit('end')
    await promise
    expect(promptoscope.write).toHaveBeenCalledWith(['username', 'prompt', 'http://url.com'])
    expect(archive.append).toHaveBeenCalledWith(promptoscope, { name: 'promptoscope.csv' })
  })

  it('should add each participation file in archive', async () => {
    const archive = new Archiver()
    mock(archiver).mockReturnValue(archive)
    const promise = zip([mockParticipationWithUser()])
    archive.emit('end')
    await promise
    expect(archive.append).toHaveBeenCalledWith('stream-http://url.com', { name: 'username.png' })
  })

  it('should return archive', async () => {
    const archive = new Archiver()
    mock(archiver).mockReturnValue(archive)
    const promise = zip([mockParticipationWithUser()])
    archive.write(Buffer.from('data'))
    archive.emit('end')
    const result = await promise
    expect(result).toEqual(Buffer.from('data'))
  })
})
