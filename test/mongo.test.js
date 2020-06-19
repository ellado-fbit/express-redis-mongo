const { MongoClient } = require('mongodb')
const mongoFind = require('../src/mongo/mongoFind')
const mongoInsertOne = require('../src/mongo/mongoInsertOne')

describe('Testing MongoBD \'find\' opertion...', () => {
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

  test(`+[mongoInsertOne] Insert document into collection`, done => {
    const req = { body: {
      tie_id: 'cedead8894244b54bae23361789ba3d5',
      title: 'MENORCA A CAVALL'
    }}
    const res = { locals: {} }

    const middleware = mongoInsertOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      docToInsert: (req, res) => req.body
    })
    middleware(req, res, err => {
      expect(res.locals.docInserted).toBeDefined()
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFind] Find document in collection`, done => {
    const req = {}
    const res = { locals: {} }

    // Example of a formatter of results
    const formatName = (docs) => {
      return docs.map(x => ({ companyName: x.title }))
    }

    const middleware = mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ tie_id: 'cedead8894244b54bae23361789ba3d5' }),
      projection: { _id: 0, title: 1 },
      limit: 0,
      formatResults: { formatters: [formatName] },
      responseProperty: 'company'
    })
    middleware(req, res, err => {
      expect(res.locals.company[0].companyName).toBe('MENORCA A CAVALL')
      expect(err).toBeUndefined()
      done()
    })
  })

})
