import { inspect, types } from 'util'

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify({ level: 'info', message, ...meta }))
  },
  error(message: string, error: unknown, meta?: Record<string, unknown>) {
    console.error(JSON.stringify({ level: 'error', message, error: parseError(error), ...meta }))
  },
  start(message: string, meta1?: Record<string, unknown>) {
    this.info(message, meta1)
    return {
      success: (meta2?: Record<string, unknown>) => {
        this.info(message + '_success', { ...meta1, ...meta2 })
      },
      error: (error: unknown, meta2?: Record<string, unknown>) => {
        this.error(message + '_failure', error, { ...meta1, ...meta2 })
      },
    }
  },
}

function parseError(error: unknown) {
  if (types.isNativeError(error)) {
    return { name: error.name, message: error.message, stack: error.stack }
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: error }
  }
  return inspect(error)
}
