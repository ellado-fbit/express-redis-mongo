const redis = require('redis')
const redisGet = require('../src/redis/redisGet')
const redisSet = require('../src/redis/redisSet')

describe('Testing Redis middlewares...', () => {
  const REDIS_DB_INDEX = 0
  let client

  beforeAll(() => {
    client = redis.createClient({ db: REDIS_DB_INDEX })
  })

  afterAll(() => {
    client.quit()
  })

  test(`[redisGet] (Check error) Redis client not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisGet({ client: '', key: (req) => req.key })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`+[redisSet] (Check error) Redis client not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client: '', key: (req) => req.key, value: (req, res) => '', expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`[redisGet] (Check error) Key parameter not specified`, done => {
    const req = {}
    const res = { locals: {} }
    const middleware = redisGet({ client })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`+[redisSet] (Check error) Key parameter not specified`, done => {
    const req = {}
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, value: (req, res) => '', expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`+[redisSet] (Check error) Value parameter not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`+[redisSet] (Check error) Expiration parameter not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => '' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`[redisGet] (Check error) Key parameter is not a function`, done => {
    const req = {}
    const res = { locals: {} }
    const middleware = redisGet({ client, key: 'pedro' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`[redisGet] (Check error) Key parameter function doesn't return a string`, done => {
    const req = { key: 100 }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`+[redisSet] (Check error) Key parameter function doesn't return a string`, done => {
    const req = { key: 100 }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => '', expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`+[redisSet] (Check error) Value parameter function doesn't return a string`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => 100, expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`+[redisSet] (Check error) Expiration parameter must be integer`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => '', expiration: '60' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`[redisGet] (Check error) responseProperty is not a string`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, responseProperty: 100 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`[redisGet] (Check error) parseResults is not a boolean`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, parseResults: 100 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  // test(`[redisGet] (Check error) extracted value is not a valid JSON format (error in JSON.parse)`, done => {
  //   const req = { key: 'juan' }
  //   const res = { locals: {} }
  //   const middleware = redisGet({ client, key: (req) => req.key, parseResults: true })
  //   middleware(req, res, err => {
  //     expect(err).toBeDefined()
  //     done()
  //   })
  // })

  test(`+[redisSet] Set value for key 'federico'`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisSet({
      client,
      key: (req) => req.key,
      // eslint-disable-next-line no-unused-vars
      value: (req, res) => JSON.stringify({ name: 'federico' }),
      expiration: 100
    })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[redisGet] Get value of key 'federico'`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(JSON.parse(res.locals.redisValue).name).toBe('federico')
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[redisGet] Get with parameter responseProperty to 'result'`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, responseProperty: 'result' })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(JSON.parse(res.locals.result).name).toBe('federico')
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`+[redisSet] Set value for empty key ''`, done => {
    const req = { key: '' }
    const res = { locals: {} }
    const middleware = redisSet({
      client,
      key: (req) => req.key,
      // eslint-disable-next-line no-unused-vars
      value: (req, res) => JSON.stringify({ name: 'empty' }),
      expiration: 100
    })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[redisGet] Get value of empty key ''`, done => {
    const req = { key: '' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(JSON.parse(res.locals.redisValue).name).toBe('empty')
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[redisGet] Get unexisting Key`, done => {
    const req = { key: 'miguelcalderon' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.redisValue).toBeUndefined()
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[redisGet] Get JSON parsed value of existing key`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, parseResults: true })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.redisValue.name).toBe('federico')
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[redisGet] Get JSON parsed value of existing key, and set parameter responseProperty to 'result'`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, responseProperty: 'result', parseResults: true })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.result.name).toBe('federico')
      expect(err).toBeUndefined()
      done()
    })
  })

})
