import { sanitize } from '../../../src/utils/sanitize'

describe('sanitize', () => {
  it('should return sanitized name', () => {
    expect(sanitize('^ toto //')).toBe('__toto___')
  })
})
