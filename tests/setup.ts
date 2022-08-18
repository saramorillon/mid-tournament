import mockdate from 'mockdate'

mockdate.set('2022-01-01T00:00:00.000Z')

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined)
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})
