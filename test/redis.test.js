const redis = require('redis')
const { redisGet, redisSet, redisDel } = require('../')

describe('Testing Redis middlewares...', () => {
  const REDIS_DB_INDEX = 0
  let client

  beforeAll(() => {
    client = redis.createClient({ db: REDIS_DB_INDEX })
  })

  afterAll(() => {
    client.quit()
  })

  // [redisGet] Checking RequiredParamError and TypeError
  // -----------------------------------------------------
  test(`[redisGet] (Check RequiredParamError) 'client' parameter not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisGet({ key: (req) => req.key })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`[redisGet] (Check RequiredParamError) 'key' parameter not specified`, done => {
    const req = {}
    const res = { locals: {} }
    const middleware = redisGet({ client })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`[redisGet] (Check TypeError) 'key' parameter is not a function`, done => {
    const req = {}
    const res = { locals: {} }
    const middleware = redisGet({ client, key: 'pedro' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`[redisGet] (Check TypeError) 'key' parameter function doesn't return a string`, done => {
    const req = { key: 100 }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`[redisGet] (Check TypeError) 'parseResults' parameter is not a boolean`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, parseResults: 'yes' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`[redisGet] (Check TypeError) 'responseProperty' parameter is not a string`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, parseResults: true, responseProperty: 100 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  // [redisSet] Checking RequiredParamError and TypeError
  // -----------------------------------------------------
  test(`+[redisSet] (Check RequiredParamError) 'client' parameter not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ key: (req) => req.key, value: (req, res) => '', expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`+[redisSet] (Check RequiredParamError) 'key' parameter not specified`, done => {
    const req = {}
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, value: (req, res) => '', expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`+[redisSet] (Check RequiredParamError) 'value' parameter not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`+[redisSet] (Check RequiredParamError) 'expiration' parameter not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => '' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`+[redisSet] (Check TypeError) 'key' parameter is not a function`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: req.key, value: (req, res) => '', expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`+[redisSet] (Check TypeError) 'key' parameter function doesn't return a string`, done => {
    const req = { key: 100 }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => '', expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`+[redisSet] (Check TypeError) 'value' parameter is not a function`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisSet({ client, key: (req) => req.key, value: req.key, expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      expect(err.message).toMatch(/'value' parameter must be a function/)
      done()
    })
  })

  test(`+[redisSet] (Check TypeError) 'value' parameter function doesn't return a string`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => 100, expiration: 60 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`+[redisSet] (Check TypeError) 'expiration' parameter must be an integer`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => '', expiration: '60' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`+[redisSet] (Check TypeError) 'expiration' parameter is not greater than zero`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    // eslint-disable-next-line no-unused-vars
    const middleware = redisSet({ client, key: (req) => req.key, value: (req, res) => '', expiration: -1 })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  // [redisDel] Checking RequiredParamError and TypeError
  // -----------------------------------------------------
  test(`-[redisDel] (Check RequiredParamError) 'client' parameter not specified`, done => {
    const req = { key: 'carlitos' }
    const res = { locals: {} }
    const middleware = redisDel({ key: (req) => req.key })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`-[redisDel] (Check RequiredParamError) 'key' parameter not specified`, done => {
    const req = {}
    const res = { locals: {} }
    const middleware = redisDel({ client })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('RequiredParamError')
      done()
    })
  })

  test(`-[redisDel] (Check TypeError) 'key' parameter is not a function`, done => {
    const req = {}
    const res = { locals: {} }
    const middleware = redisDel({ client, key: 'pedro' })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  test(`-[redisDel] (Check TypeError) 'key' parameter function doesn't return a string`, done => {
    const req = { key: 100 }
    const res = { locals: {} }
    const middleware = redisDel({ client, key: (req) => req.key })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('TypeError')
      done()
    })
  })

  // Testing functionalities
  // ------------------------
  test(`+[redisSet] Set value for key 'federico'`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisSet({
      client,
      key: (req) => req.key,
      // eslint-disable-next-line no-unused-vars
      value: (req, res) => JSON.stringify({ name: req.key }),
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

  test(`[redisGet] Get non existing key`, done => {
    const req = { key: 'miguelcalderon' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, parseResults: true })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.redisValue).toBeNull()
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

  test(`+[redisSet] Set value with invalid JSON format`, done => {
    const req = { key: 'invalid' }
    const res = { locals: {} }
    const middleware = redisSet({
      client,
      key: (req) => req.key,
      // eslint-disable-next-line no-unused-vars
      value: (req, res) => '{name": "invalid"}',
      expiration: 100
    })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[redisGet] Extracted value is not a valid JSON format (error in JSON.parse)`, done => {
    const req = { key: 'invalid' }
    const res = { locals: {} }
    const middleware = redisGet({ client, key: (req) => req.key, parseResults: true })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      done()
    })
  })

  test(`-[redisDel] Deletes an existing key`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisDel({ client, key: (req) => req.key })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.redisResponse).toBe(1)
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`-[redisDel] Deletes a non existing key`, done => {
    const req = { key: 'federico' }
    const res = { locals: {} }
    const middleware = redisDel({ client, key: (req) => req.key })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.redisResponse).not.toBe(1)
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`-[redisDel] Deletes an existing key (part 2)`, done => {
    const req = { key: '' }
    const res = { locals: {} }
    const middleware = redisDel({ client, key: (req) => req.key })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.redisResponse).toBe(1)
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`-[redisDel] Deletes an existing key (part 3)`, done => {
    const req = { key: 'invalid' }
    const res = { locals: {} }
    const middleware = redisDel({ client, key: (req) => req.key })
    // eslint-disable-next-line no-unused-vars
    middleware(req, res, err => {
      expect(res.locals.redisResponse).toBe(1)
      expect(err).toBeUndefined()
      done()
    })
  })

})
