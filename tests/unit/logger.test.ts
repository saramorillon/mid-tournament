import { logger } from '../../src/logger'

describe('info', () => {
  it('should log message', () => {
    logger.info('message', { prop: 'value' })
    expect(console.log).toHaveBeenCalledWith('{"level":"info","message":"message","prop":"value"}')
  })
})

describe('error', () => {
  it('should log message with native error', () => {
    logger.error('message', new Error('500'), { prop: 'value' })
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(
        /\{"level":"error","message":"message","error":\{"name":"Error","message":"500","stack":"Error: 500.+"\},"prop":"value"\}/
      )
    )
  })

  it('should log message with string error', () => {
    logger.error('message', '500', { prop: 'value' })
    expect(console.error).toHaveBeenCalledWith(
      '{"level":"error","message":"message","error":{"name":"Error","message":"500"},"prop":"value"}'
    )
  })

  it('should log message with inspected error', () => {
    logger.error('message', { message: '500' }, { prop: 'value' })
    expect(console.error).toHaveBeenCalledWith(
      '{"level":"error","message":"message","error":"{ message: \'500\' }","prop":"value"}'
    )
  })
})

describe('start', () => {
  it('should log message', () => {
    logger.start('message', { prop: 'value' })
    expect(console.log).toHaveBeenCalledWith('{"level":"info","message":"message","prop":"value"}')
  })

  it('should log success', () => {
    const action = logger.start('message', { prop: 'value' })
    action.success({ prop2: 'value2' })
    expect(console.log).toHaveBeenCalledWith(
      '{"level":"info","message":"message_success","prop":"value","prop2":"value2"}'
    )
  })

  it('should log error', () => {
    const action = logger.start('message', { prop: 'value' })
    action.error('500', { prop2: 'value2' })
    expect(console.error).toHaveBeenCalledWith(
      '{"level":"error","message":"message_failure","error":{"name":"Error","message":"500"},"prop":"value","prop2":"value2"}'
    )
  })
})
