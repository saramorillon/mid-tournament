import { cleanEnv, str } from 'envalid'
import { name, version } from '../package.json'

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  TOKEN: str(),
  CLIENT_ID: str(),
})

export const settings = {
  app: { name, version, env: env.NODE_ENV },
  credentials: {
    clientId: env.CLIENT_ID,
    token: env.TOKEN,
  },
}
