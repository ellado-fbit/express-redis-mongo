const { MongoClient } = require('mongodb')
const mongoFind = require('../src/mongo/mongoFind')

describe('Testing MongoBD \'find\' opertion...', () => {
  const mongodbUri = 'mongodb://127.0.0.1:27017'
  let mongoClient

  beforeAll(async () => {
    mongoClient = await MongoClient.connect(mongodbUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      poolSize: 10,
      connectTimeoutMS: 60000
    })
  })

  afterAll(async () => {
    await mongoClient.close()
  })

  test(`[mongoFind] Find item in collection`, done => {
    const req = {}
    const res = { locals: {} }
    const middleware = mongoFind({
      mongoClient,
      db: 'tie_db',
      collection: 'companies_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ 'tie_id': 'cedead8894244b54bae23361789ba3d5' }),
      projection: { _id: 0, title: 1 },
      limit: 0
    })
    middleware(req, res, err => {
      expect(res.locals.results[0].title).toBe('MENORCA A CAVALL')
      expect(err).toBeUndefined()
      done()
    })
  })

})
