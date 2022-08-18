export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify({ level: 'info', message, ...meta }))
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(JSON.stringify({ level: 'error', message, ...meta }))
  },
  start(message: string, meta1?: Record<string, unknown>) {
    this.info(message, meta1)
    return {
      success: (meta2?: Record<string, unknown>) => {
        this.info(message + '_success', { ...meta1, ...meta2 })
      },
      error: (error: unknown, meta2?: Record<string, unknown>) => {
        this.info(message + '_success', { ...meta1, error, ...meta2 })
      },
    }
  },
}
