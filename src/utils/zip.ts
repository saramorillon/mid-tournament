import { format } from '@fast-csv/format'
import { Participation, User } from '@prisma/client'
import archiver from 'archiver'
import { IncomingMessage } from 'http'
import https from 'https'

export function zip(participations: (Participation & { user: User })[]) {
  const archive = archiver('zip')
  const chunks: Buffer[] = []
  return new Promise<Buffer>(async (resolve) => {
    archive.on('data', (chunk) => chunks.push(chunk))
    archive.on('end', () => {
      const buffer = Buffer.concat(chunks)
      resolve(buffer)
    })
    const promptoscope = format({ delimiter: ';', quote: '"' })
    promptoscope.write(['Utilisateur', 'Prompt', 'URL'])
    archive.append(promptoscope, { name: 'promptoscope.csv' })
    for (const participation of participations) {
      const stream = await new Promise<IncomingMessage>((resolve) => https.get(participation.url, resolve))
      archive.append(stream, { name: `${participation.user.username}.png` })
      promptoscope.write([participation.user.username, participation.prompt, participation.url])
    }
    promptoscope.end()
    archive.finalize()
  })
}
