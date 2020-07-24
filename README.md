# Express wrappers for Redis and MongoDB

A useful collection of Express middleware wrappers for Redis and MongoDB.

## Middlewares

| middleware    | description                                                           |
|---------------|-----------------------------------------------------------------------|
| redisGet      | Get the value of a key from Redis cache.                              |
| redisSet      | Set the string value of a key to Redis cache.                         |
| mongoFind     | Query documents of a MongoDB collection and optionally format results.|
| mongoInsertOne| Inserts a document into a collection.                                 |
| mongoDeleteOne| Deletes a document from a collection.                                 |

## Install

```bash
npm install @fundaciobit/express-redis-mongo
```

## Index

- [`redisGet`](#redisget)
- [`redisSet`](#redisset)
- [`mongoFind`](#mongofind)
- [`mongoInsertOne`](#mongoinsertone)
- [`mongoDeleteOne`](#mongodeleteone)

## `redisGet`

Middleware wrapper for the Redis `GET` command. Get the value of a key from the Redis cache. Returned value is available on the response via `res.locals.redisValue` by default.

```js
const express = require('express')
const redis = require('redis')
const { redisGet } = require('@fundaciobit/express-redis-mongo')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.get('/companies/island/:island',
  redisGet({
    client,
    key: (req) => req.path,
    parseResults: true
  }),
  (req, res) => {
    const { redisValue } = res.locals
    if (redisValue) return res.status(200).json(redisValue)
    res.status(404).send('Not found')
  })

app.use((err, req, res, next) => {
  res.status(500).send(err.toString())
})

const port = 3000
app.listen(port, () => { console.log(`Server running on port ${port}...`) })

```

## `redisSet`

Middleware wrapper for the Redis `SET` command. Set the string value of a key.

```js
const express = require('express')
const redis = require('redis')
const { redisSet } = require('@fundaciobit/express-redis-mongo')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.get('/users/:username',
  redisSet({
    client,
    key: (req) => req.path,
    value: (req, res) => JSON.stringify({ user: req.params.username, ip: req.ip }),
    expiration: 600  // seconds
  }),
  (req, res) => {
    res.status(200).send('Data cached')
  })

app.use((err, req, res, next) => {
  res.status(500).send(err.toString())
})

const port = 3000
app.listen(port, () => { console.log(`Server running on port ${port}...`) })

```

## `mongoFind`

Middleware wrapper of the MongoDB `find` method to query documents of the specified database and collection. The retrieved documents are available on the response via `res.locals.results` by default. It also provides an optional parameter to format results.

```js
const express = require('express')
const { MongoClient } = require('mongodb')
const { mongoFind } = require('@fundaciobit/express-redis-mongo')

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

  app.get('/companies/island/:island',
    mongoFind({
      mongoClient,
      db: 'companies_db',
      collection: 'companies_col',
      query: (req) => ({ island: req.params.island }),
      projection: { name: 1, address: 1, postalCode: 1, city: 1 },
      limit: 10,  // docs retrieved
      sort: { name: 1 },
      formatResults: {
        formatters: [(docs) => {
          return docs.map(x => ({
            companyName: x.name,
            postalAddress: `${x.address}, ${x.postalCode} (${x.city})`
          }))
        }]
      },
      responseProperty: 'companies'
    }),
    (req, res) => {
      const { companies } = res.locals
      if (companies.length > 0) return res.status(200).json(companies)
      res.status(204).send('No content found')
    })

  app.use((err, req, res, next) => {
    res.status(500).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoInsertOne`

Middleware wrapper for the MongoDB `insertOne` method. Inserts a document into a collection. The `_id` of the inserted document is available on the response via the `res.locals.insertedId` by default.

```js
const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb')
const { mongoInsertOne } = require('@fundaciobit/express-redis-mongo')

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
      db: 'companies_db',
      collection: 'companies_col',
      docToInsert: (req, res) => req.body
    }),
    (req, res) => {
      const { insertedId } = res.locals
      res.status(200).json({ _id: insertedId })
    })

  app.use((err, req, res, next) => {
    res.status(500).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoDeleteOne`

Middleware wrapper for the MongoDB `deleteOne` operation. Deletes the first document that matches the filter.

```js
const express = require('express')
const { MongoClient } = require('mongodb')
const { mongoDeleteOne } = require('@fundaciobit/express-redis-mongo')

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

  app.delete('/companies/id/:id',
    mongoDeleteOne({
      mongoClient,
      db: 'companies_db',
      collection: 'companies_col',
      filter: (req) => ({ _id: req.params.id })
    }),
    (req, res) => {
      res.sendStatus(200)
    })

  app.use((err, req, res, next) => {
    res.status(500).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```
