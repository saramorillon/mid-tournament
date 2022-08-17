import { Participation } from '@prisma/client'
import archiver from 'archiver'
import { IncomingMessage } from 'http'
import https from 'https'

export function zip(participations: Participation[]) {
  const archive = archiver('zip')
  const chunks: Buffer[] = []
  return new Promise<Buffer>(async (resolve) => {
    archive.on('data', (chunk) => chunks.push(chunk))
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks)
      resolve(buffer)
    })
    for (const participation of participations) {
      const stream = await new Promise<IncomingMessage>((resolve) => https.get(participation.url, resolve))
      archive.append(stream, { name: `${participation.user}.png` })
    }
    archive.finalize()
  })
}
