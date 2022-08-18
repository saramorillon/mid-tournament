import { App } from '../../src/app'

jest.mock('../../src/app')

describe('index', () => {
  it('should start app', () => {
    require('../../src/index')
    expect(App.prototype.run).toHaveBeenCalled()
  })
})
