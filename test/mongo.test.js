const { MongoClient } = require('mongodb')
const { mongoFind, mongoFindOne, mongoInsertOne, mongoDeleteOne } = require('../')

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
      req.insertedId = res.locals.insertedId  // Note: The returned 'insertedId' is an instance of ObjectID (an object created with the 'ObjectID' constructor function)
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFind] Find document in collection`, done => {
    const middleware = mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      query: (req) => ({ _id: req.insertedId }),
      projection: { title: 1 },
      limit: 0,
      sort: { title: 1 }
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

  test(`[mongoFind] Find documents of empty collection`, done => {
    const middleware = mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_empty_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ }),
      responseProperty: 'companies'
    })
    middleware(req, res, err => {
      const { companies } = res.locals
      expect(companies.length).toBe(0)
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFindOne] Find one document in collection`, done => {
    const middleware = mongoFindOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      query: (req) => ({ _id: req.insertedId }),
      projection: { title: 1 }
    })
    middleware(req, res, err => {
      const { result } = res.locals
      expect(result.title).toBe('MENORCA A CAVALL')
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFindOne] Find one document in collection with 'formatResult' and 'responseProperty' parameters`, done => {
    const middleware = mongoFindOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      query: (req) => ({ _id: req.insertedId }),
      projection: { title: 1 },
      formatResult: (doc) => ({ companyName: doc.title }),
      responseProperty: 'company'
    })
    middleware(req, res, err => {
      const { company } = res.locals
      expect(company.companyName).toBe('MENORCA A CAVALL')
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFindOne] Find a non existing document in collection`, done => {
    const middleware = mongoFindOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ _id: 'abcde12345' })
    })
    middleware(req, res, err => {
      const { result } = res.locals
      expect(result).toBeNull()
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFind] (check error) 'mongoClient' parameter is required`, done => {
    const middleware = mongoFind({})
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.message).toMatch(/'mongoClient' parameter is required/)
      done()
    })
  })

  test(`[mongoFind] (check error) 'db' parameter is required`, done => {
    const middleware = mongoFind({
      mongoClient
    })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.message).toMatch(/'db' parameter is required/)
      done()
    })
  })

  test(`[mongoFind] (check error) 'collection' parameter is required`, done => {
    const middleware = mongoFind({
      mongoClient,
      db: 'test_db'
    })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.message).toMatch(/'collection' parameter is required/)
      done()
    })
  })

  test(`-[mongoDeleteOne] Deletes a document in collection`, done => {
    const middleware = mongoDeleteOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      filter: (req) => ({ _id: req.insertedId })
    })
    middleware(req, res, err => {
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`[mongoFind] Find a non existing document in collection (after deletion)`, done => {
    const middleware = mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      query: (req) => ({ _id: req.insertedId }),
      projection: { title: 1 },
      limit: 0,
      sort: { title: 1 }
    })
    middleware(req, res, err => {
      const { results } = res.locals
      expect(results.length).toBe(0)
      expect(err).toBeUndefined()
      done()
    })
  })

  test(`-[mongoDeleteOne] Deletes a non existing document in collection`, done => {
    const middleware = mongoDeleteOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      filter: (req) => ({ _id: 'kkk' })
    })
    middleware(req, res, err => {
      expect(err).toBeDefined()
      expect(err.name).toBe('NotFoundDocError')
      expect(err.message).toMatch(/Document not found/)
      done()
    })
  })

})
