const { MongoClient } = require('mongodb')
const mongoFind = require('../src/mongo/mongoFind')
const mongoInsertOne = require('../src/mongo/mongoInsertOne')

describe('Testing MongoBD middlewares...', () => {
  const mongodbUri = 'mongodb://127.0.0.1:27017'
  let mongoClient

  beforeAll(async () => {
    mongoClient = await MongoClient.connect(mongodbUri, {
      useUnifiedTopology: true,
      poolSize: 10,
      connectTimeoutMS: 60000
    })
  })

  afterAll(async () => {
    await mongoClient.close()
  })

  const req = { body: {
    title: 'MENORCA A CAVALL'
  }}
  const res = { locals: {} }

  test(`+[mongoInsertOne] Insert document into collection`, done => {
    const middleware = mongoInsertOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      docToInsert: (req, res) => req.body
    })
    middleware(req, res, err => {
      expect(res.locals.insertedId).toBeDefined()
      req.insertedId = res.locals.insertedId
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFind] Find document in collection`, done => {
    const middleware = mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ _id: req.insertedId }),
      projection: { title: 1 },
      limit: 0
    })
    middleware(req, res, err => {
      const { results } = res.locals
      expect(results[0].title).toBe('MENORCA A CAVALL')
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFind] Find document in collection formatting results`, done => {
    const middleware = mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ _id: req.insertedId }),
      projection: { title: 1 },
      limit: 0,
      formatResults: {
        formatters: [(docs) => {
          return docs.map(x => ({ companyName: x.title }))
        }]
      },
      responseProperty: 'companies'
    })
    middleware(req, res, err => {
      const { companies } = res.locals
      expect(companies[0].companyName).toBe('MENORCA A CAVALL')
      expect(err).toBeUndefined()
      done()
    })
  })

})
