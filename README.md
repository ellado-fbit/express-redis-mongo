A useful collection of Express middleware wrappers for Redis and MongoDB.

## Middlewares

| middleware    | description                                           |
|---------------|-----------------------------------------------------------------------|
| redisGet      | Get the value of a key from Redis cache.                              |
| redisSet      | Set the string value of a key to Redis cache.                         |
| mongoFind     | Query documents of a MongoDB collection and optionally format results.|

## Install

```bash
npm install @fundaciobit/express-redis-mongo
```

## `redisGet`: Redis GET command
Middleware wrapper for the Redis GET command. Get the value of a key from the Redis cache. Returned value is available via `res.locals.redisValue` by default.

```js
const express = require('express')
const redis = require('redis')
const { redisGet } = require('@fundaciobit/express-redis-mongo')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.get('/username/esteve',
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

app.get('/username/:username',
  redisGet({
    client,
    key: (req) => req.params.username,
    responseProperty: 'cachedData'
  }),
  (req, res) => {
    const { cachedData } = res.locals
    if (cachedData) return res.status(200).send(cachedData)
    res.status(404).send('Not found')
  })

app.use((err, req, res, next) => {
  res.status(500).send(`Error: ${err.message}`)
})

const port = 3000
app.listen(port, () => { console.log(`Server running on port ${port}...`) })

```

## `redisSet`: Redis `SET` command
Middleware wrapper for the Redis SET command. Set the string value of a key.

```js
const express = require('express')
const redis = require('redis')
const { redisSet } = require('@fundaciobit/express-redis-mongo')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.get('/username/:username',
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
  res.status(500).send(`Error: ${err.message}`)
})

const port = 3000
app.listen(port, () => { console.log(`Server running on port ${port}...`) })

```

## `mongoFind`: MongoDB `find` operation
Middleware wrapper of the MongoDB 'find' method to query documents of the specified database and collection. The retrieved results are available via `res.locals.results` by default. It also provides an optional parameter to format results.

```js
const express = require('express')
const { MongoClient } = require('mongodb')
const { mongoFind } = require('@fundaciobit/express-redis-mongo')

const mongodbUri = 'mongodb://127.0.0.1:27017'

// Open MongoDB connection
MongoClient.connect(mongodbUri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  poolSize: 10
})
.then(client => {
  createApp(client)
})
.catch(err => {
  console.log(err.message)
  process.exit(1)
})

const createApp = (mongoClient) => {
  const app = express()

  // Example of a formatter of results
  const formatNameAndAddress = (items) => {
    return items.map(x => ({
      companyName: x.name,
      postalAddress: `${x.address}, ${x.postalCode} (${x.city})`
    }))
  }

  app.get('/companies/island/:island',
    mongoFind({
      mongoClient,
      db: 'companies_db',
      collection: 'companies_col',
      query: (req) => ({ island: req.params.island }),
      projection: { name: 1, address: 1, postalCode: 1, city: 1 },
      limit: 10,  // docs retrieved
      formatResults: { formatters: [formatNameAndAddress] },
      responseProperty: 'companies'
    }),
    (req, res) => {
      const { companies } = res.locals
      if (companies.length > 0) return res.status(200).json(companies)
      res.status(404).send('Not found')
    })

  app.use((err, req, res, next) => {
    res.status(500).send(`Error: ${err.message}`)
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```
