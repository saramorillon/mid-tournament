import { cleanEnv, num, str, url } from 'envalid'
import { name, version } from '../package.json'

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  TOKEN: str(),
  CLIENT_ID: str(),
  GUILD_ID: str(),
  APP_PORT: num(),
  APP_HOST: url(),
})

export const settings = {
  app: {
    name,
    version,
    env: env.NODE_ENV,
    port: env.APP_PORT,
    host: env.APP_HOST,
  },
  credentials: {
    guildId: env.GUILD_ID,
    clientId: env.CLIENT_ID,
    token: env.TOKEN,
  },
}
