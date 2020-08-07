const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient, ObjectID } = require('mongodb')
const { mongoInsertOne, mongoFind, mongoFindOne, mongoUpdateOne, mongoReplaceOne, mongoDeleteOne } = require('../')

const mongodbUri = 'mongodb://127.0.0.1:27017'

// Open MongoDB connection
MongoClient.connect(mongodbUri, { useUnifiedTopology: true, poolSize: 10 })
  .then(client => {
    createApp(client)
  })
  .catch(err => {
    console.log(err.message)
    process.exit(1)
  })

const createApp = (mongoClient) => {
  const app = express()
  app.use(bodyParser.json())

  app.post('/companies',
    mongoInsertOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      docToInsert: (req, res) => req.body
    }),
    (req, res) => {
      const { insertedId } = res.locals
      res.status(200).json({ _id: insertedId })
    })

  app.get('/companies',
    mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ }),
      responseProperty: 'companies'
    }),
    (req, res) => {
      const { companies } = res.locals
      res.status(200).json(companies)
    })

  app.get('/companies/format',
    mongoFind({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      // eslint-disable-next-line no-unused-vars
      query: (req) => ({ }),
      projection: { _id: 0 },
      sort: { name: 1 },
      formatResults: {
        formatters: [
          (docs) => { docs.forEach(doc => { doc.companyName = doc.name; delete doc.name }); return docs },
          (docs) => { docs.forEach(doc => { doc.address = `${doc.address}, ${doc.postalCode} (${doc.city})`; delete doc.postalCode; delete doc.city }); return docs }
        ]
      },
      responseProperty: 'companies'
    }),
    (req, res) => {
      const { companies } = res.locals
      res.status(200).json(companies)
    })

  app.get('/companies/:id',
    mongoFindOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      query: (req) => ({ _id: new ObjectID(req.params.id) }),
      responseProperty: 'company'
    }),
    (req, res) => {
      const { company } = res.locals
      if (company) return res.status(200).json(company)
      res.status(404).send('Document not found')
    })

  app.get('/companies/:id/format',
    mongoFindOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      query: (req) => ({ _id: new ObjectID(req.params.id) }),
      projection: { _id: 0 },
      formatResult: (doc) => ({ companyName: doc.name, address: `${doc.address}, ${doc.postalCode} (${doc.city})` }),
      responseProperty: 'company'
    }),
    (req, res) => {
      const { company } = res.locals
      if (company) return res.status(200).json(company)
      res.status(404).send('Document not found')
    })

  app.patch('/companies/:id',
    mongoUpdateOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      filter: (req) => ({ _id: new ObjectID(req.params.id) }),
      // eslint-disable-next-line no-unused-vars
      contentToUpdate: (req, res) => ({ ...req.body })
    }),
    (req, res) => {
      res.status(200).send('Document successfully updated')
    })

  app.put('/companies/:id',
    mongoReplaceOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      filter: (req) => ({ _id: new ObjectID(req.params.id) }),
      // eslint-disable-next-line no-unused-vars
      contentToReplace: (req, res) => ({ ...req.body }),
      upsert: true
    }),
    (req, res) => {
      const { upsertedId } = res.locals
      if (upsertedId) return res.status(200).json({ _id: upsertedId })  // Created new doc
      res.status(200).send('Document successfully replaced')
    })

  app.delete('/companies/:id',
    mongoDeleteOne({
      mongoClient,
      db: 'test_db',
      collection: 'test_col',
      filter: (req) => ({ _id: new ObjectID(req.params.id) })
    }),
    (req, res) => {
      res.status(200).send('Document successfully deleted')
    })

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port http://localhost:${port} ...`) })
}