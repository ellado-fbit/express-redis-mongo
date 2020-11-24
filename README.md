# Express wrappers for Redis and MongoDB

A useful collection of Express middleware wrappers for Redis and MongoDB.

## Middlewares

| middleware      | description                                                             |
|-----------------|-------------------------------------------------------------------------|
| redisGet        | Get the value of a key from Redis cache.                                |
| redisSet        | Set the string value of a key to Redis cache.                           |
| redisDel        | Delete a key from the Redis cache.                                      |
| mongoFind       | Query documents of a MongoDB collection and optionally format results.  |
| mongoFindOne    | Query a document of a MongoDB collection and optionally format result.  |
| mongoInsertOne  | Insert a document into a MongoDB collection.                            |
| mongoUpdateOne  | Update a single document in a MongoDB collection.                       |
| mongoReplaceOne | Replace a single document in a MongoDB collection.                      |
| mongoDeleteOne  | Delete a document from a MongoDB collection.                            |
| mongoCreateIndex| Creates an index on a MongoDB collection.                               |

## Install

```bash
npm install @fundaciobit/express-redis-mongo
```

## Index

- [`redisGet`](#redisget)
- [`redisSet`](#redisset)
- [`redisDel`](#redisdel)
- [`mongoFind`](#mongofind)
- [`mongoFindOne`](#mongofindone)
- [`mongoInsertOne`](#mongoinsertone)
- [`mongoUpdateOne`](#mongoupdateone)
- [`mongoReplaceOne`](#mongoreplaceone)
- [`mongoDeleteOne`](#mongodeleteone)
- [`mongoCreateIndex`](#mongocreateindex)
- [Sample Use Case of Combined Middlewares](#sample-use-case-of-combined-middlewares)

## `redisGet`

Middleware wrapper for the Redis `GET` command. Get the value of a key from the Redis cache. Returned value is available on the response via `res.locals.redisValue` by default.

### Parameters

- `client`: (*required*) Redis client.
- `key`: (*required*) Function that accepts the request object as parameter, that returns the key (string).
- `parseResults`: (*optional*) Boolean that indicates if the extracted value from Redis must be JSON parsed. Default value: `false`.
- `responseProperty`: (*optional*) String. Property name on the response object `res.locals` where the returned value will be stored ( `res.locals[responseProperty]` ). Default property: `res.locals.redisValue`.

### Usage

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
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.toString())
})

const port = 3000
app.listen(port, () => { console.log(`Server running on port ${port}...`) })

```

## `redisSet`

Middleware wrapper for the Redis `SET` command. Set the string value of a key.

### Parameters

- `client`: (*required*) Redis client.
- `key`: (*required*) Function that accepts the request object as parameter, that returns the key (string).
- `value`: (*required*) Function that accepts the request and response objects as parameters, that returns the value (string).
- `expiration`: (*required*) Integer. Number of seconds of expiraton time for the key/value.

### Usage

```js
const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const { redisSet } = require('@fundaciobit/express-redis-mongo')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.use(bodyParser.json())

app.post('/users',
  redisSet({
    client,
    key: (req) => req.body.username,
    value: (req, res) => JSON.stringify({ ip: req.ip }),
    expiration: 600  // seconds
  }),
  (req, res) => {
    res.status(200).send('Data cached')
  })

app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.toString())
})

const port = 3000
app.listen(port, () => { console.log(`Server running on port ${port}...`) })

```

## `redisDel`

Middleware wrapper for the Redis DEL command. Deletes a key from the Redis cache. Redis response will be available on `res.locals.redisResponse`. The response will be (integer) 1 in a delete successful operation.

### Parameters

- `client`: (*required*) Redis client.
- `key`: (*required*) Function that accepts the request object as parameter, that returns the key (string).

### Usage

```js
const express = require('express')
const redis = require('redis')
const { redisDel } = require('@fundaciobit/express-redis-mongo')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.delete('/users/:username',
  redisDel({
    client,
    key: (req) => req.params.username
  }),
  (req, res) => {
    const { redisResponse } = res.locals
    if (redisResponse === 1) return res.status(200).send('Deleted Successfully')
    res.status(404).send('Not found')
  })

app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.toString())
})

const port = 3000
app.listen(port, () => { console.log(`Server running on port ${port}...`) })

```

## `mongoFind`

Middleware wrapper of the MongoDB `find` method to query documents of the specified database and collection. The retrieved documents are available on the response via `res.locals.results` by default. It also provides an optional parameter to format results.

### Parameters

- `mongoClient`: (*required*) MongoDB client.
- `db`: (*required*) String. Database name.
- `collection`: (*required*) String. Collection name.
- `query`: (*required*) Function that accepts the request object as parameter, that returns the query object.
- `projection`: (*optional*) Object. Projection query with the fields that will be returned.
- `limit`: (*optional*) Number. The number of returned results. Default value: `0` (0 is equivalent to setting no limit).
- `sort`: (*optional*) Object. List of fields on which to sort the results. To specify sorting order, 1 and -1 are used. 1 is used for ascending order while -1 is used for descending order.
- `responseProperty`: (*optional*) String. Property name on the response object `res.locals` where the returned docs will be stored ( `res.locals[responseProperty]` ). Default property: `res.locals.results`.
- `formatResults`: (*optional*) Object to list formatters that transform results. The `formatters` property must be an array of functions. Each function accepts `docs` as parameter and returns the formatted results. The transformed results are pipelined through formatters.

### Usage

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
      res.status(200).json(companies)
    })

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoFindOne`

Middleware wrapper for the MongoDB `findOne` method with optional parameter to format the result. The retrieved document will be available on the response via the `res.locals.result` by default.

### Parameters

- `mongoClient`: (*required*) MongoDB client.
- `db`: (*required*) String. Database name.
- `collection`: (*required*) String. Collection name.
- `query`: (*required*) Function that accepts the request object as parameter, that returns the query object.
- `projection`: (*optional*) Object. Projection query with the fields that will be returned.
- `responseProperty`: (*optional*) String. Property name on the response object `res.locals` where the returned doc will be stored ( `res.locals[responseProperty]` ). Default property: `res.locals.result`.
- `formatResult`: (*optional*) Function to transform the query result. The function accepts `doc` as parameter and returns the formatted result.

### Usage

```js
const express = require('express')
const { MongoClient, ObjectID } = require('mongodb')
const { mongoFindOne } = require('@fundaciobit/express-redis-mongo')

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

  app.get('/companies/:id',
    mongoFindOne({
      mongoClient,
      db: 'companies_db',
      collection: 'companies_col',
      query: (req) => ({ _id: new ObjectID(req.params.id) }),
      projection: { title: 1 },
      formatResult: (doc) => ({ companyName: doc.title }),
      responseProperty: 'company'
    }),
    (req, res) => {
      const { company } = res.locals
      if (company) return res.status(200).json(company)
      res.status(404).send('Document not found')
    })

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoInsertOne`

Middleware wrapper for the MongoDB `insertOne` method. Inserts a document into a collection. The `_id` value of the inserted document is available on the response via the `res.locals.insertedId` (ObjectID) by default.

### Parameters

- `mongoClient`: (*required*) MongoDB client.
- `db`: (*required*) String. Database name.
- `collection`: (*required*) String. Collection name.
- `docToInsert`: (*required*) Function that accepts the request and response objects as parameters, that returns the document to insert (object).
- `responseProperty`: (*optional*) String. Property name on the response object `res.locals` where the inserted `_id` will be stored ( `res.locals[responseProperty]` ). If not specified, the `_id` will be available on the property `res.locals.insertedId`. The `_id` is returned as an ObjectID.

### Usage

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
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoUpdateOne`

Middleware wrapper for the MongoDB `updateOne` method. Update a single document in a collection based on the filter.

### Parameters

- `mongoClient`: (*required*) MongoDB client.
- `db`: (*required*) String. Database name.
- `collection`: (*required*) String. Collection name.
- `filter`: (*required*) Function that accepts the request object as parameter, that returns the query object.
- `contentToUpdate`: (*required*) Function that accepts the request and response objects as parameters, that returns the document fields to update (object).

### Usage

```js
const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient, ObjectID } = require('mongodb')
const { mongoUpdateOne } = require('@fundaciobit/express-redis-mongo')

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

  app.patch('/companies/:id',
    mongoUpdateOne({
      mongoClient,
      db: 'companies_db',
      collection: 'companies_col',
      filter: (req) => ({ _id: new ObjectID(req.params.id) }),
      contentToUpdate: (req, res) => ({ ...req.body })
    }),
    (req, res) => {
      res.status(200).send('Document successfully updated')
    })

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoReplaceOne`

Middleware wrapper for the MongoDB `replaceOne` method. Replaces a single document within the collection based on the filter. If `upsert: true` and no documents match the filter, then `mongoReplaceOne` creates a new document based on the replacement document and the `_id` value of the upserted document will be available on the response via `res.locals.upsertedId` (String) by default.

### Parameters

- `mongoClient`: (*required*) MongoDB client.
- `db`: (*required*) String. Database name.
- `collection`: (*required*) String. Collection name.
- `filter`: (*required*) Function that accepts the request object as parameter, that returns the query object.
- `contentToReplace`: (*required*) Function that accepts the request and response objects as parameters, that returns the document to replace (object).
- `upsert`: (*optional*) Boolean. Indicates creation of a new document if `upsert: true` and no documents match the filter. Default value: `false`.
- `responseProperty`: (*optional*) String. Property name on the response object `res.locals` where the upserted `_id` will be stored ( `res.locals[responseProperty]` ). If not specified, the `_id` will be available on `res.locals.upsertedId`. The `_id` is returned as a string.

### Usage

```js
const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient, ObjectID } = require('mongodb')
const { mongoReplaceOne } = require('@fundaciobit/express-redis-mongo')

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

  app.put('/companies/:id',
    mongoReplaceOne({
      mongoClient,
      db: 'companies_db',
      collection: 'companies_col',
      filter: (req) => ({ _id: new ObjectID(req.params.id) }),
      contentToReplace: (req, res) => ({ ...req.body }),
      upsert: true
    }),
    (req, res) => {
      const { upsertedId } = res.locals
      if (upsertedId) return res.status(200).json({ _id: upsertedId })  // Created new doc
      res.status(200).send('Document successfully replaced')
    })

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoDeleteOne`

Middleware wrapper for the MongoDB `deleteOne` operation. Deletes the first document that matches the filter.

### Parameters

- `mongoClient`: (*required*) MongoDB client.
- `db`: (*required*) String. Database name.
- `collection`: (*required*) String. Collection name.
- `filter`: (*required*) Function that accepts the request object as parameter, that returns the query object.

### Usage

```js
const express = require('express')
const { MongoClient, ObjectID } = require('mongodb')
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

  app.delete('/companies/:id',
    mongoDeleteOne({
      mongoClient,
      db: 'companies_db',
      collection: 'companies_col',
      filter: (req) => ({ _id: new ObjectID(req.params.id) })
    }),
    (req, res) => {
      res.status(200).send('Document successfully deleted')
    })

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## `mongoCreateIndex`

Middleware wrapper for the MongoDB `createIndex` method. Creates an index on a MongoDB collection.

### Parameters

- `mongoClient`: (*required*) MongoDB client.
- `db`: (*required*) String. Database name.
- `collection`: (*required*) String. Collection name.
- `keys`: (*required*) Object. Contains the field and value pairs where the field is the index key and the value describes the type of index for that field (see MongoDB documentation for details).
- `options`: (*optional*) Object. Contains a set of options that controls the creation of the index (see MongoDB documentation for details).

### Usage

```js
const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb')
const { mongoInsertOne, mongoCreateIndex } = require('@fundaciobit/express-redis-mongo')

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
    mongoInsertOne({ mongoClient, db: 'companies_db', collection: 'companies_col', docToInsert: (req, res) => req.body }),
    mongoCreateIndex({ mongoClient, db, collection, keys: { company_id: 1 }, options: { sparse: true, unique: true } }),
    (req, res) => {
      const { insertedId } = res.locals
      res.status(200).json({ _id: insertedId })
    })

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port ${port}...`) })
}
```

## Sample Use Case of Combined Middlewares

The following use case shows the combination of several Express middlewares to authenticate users, validate IP addresses and JSON Schemas, and caching results from MongoDB to Redis.

*Note: Some middlewares used in the use case are defined in the module* [@fundaciobit/express-middleware](https://www.npmjs.com/package/@fundaciobit/express-middleware)

```js
const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const { MongoClient, ObjectID } = require('mongodb')
const { ipv4, validateJsonSchema, signJWT, verifyJWT } = require('@fundaciobit/express-middleware')
const { redisGet, redisSet, redisDel, mongoFindOne, mongoFind, mongoInsertOne, mongoUpdateOne, mongoDeleteOne } = require('@fundaciobit/express-redis-mongo')

const mongodbUri = 'mongodb://127.0.0.1:27017'
const db = 'users_db'
const collection = 'users_col'

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const usersSchema = {
  type: 'object',
  required: ['username', 'password', 'isAdmin', 'name', 'surname', 'age', 'address', 'city', 'postalCode'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string', minLength: 6, maxLength: 10 },
    isAdmin: { type: 'boolean' },
    name: { type: 'string' },
    surname: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    address: { type: 'string' },
    city: { type: 'string' },
    postalCode: { type: 'string', pattern: '^\\d+$' }
  },
  additionalProperties: false
}

const loginSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string', minLength: 6, maxLength: 10 }
  },
  additionalProperties: false
}

const secret = 'my_secret'
const ipAddressesWhitelist = ['120.230.33.44', '120.230.33.45', '127.0.0.1']

class AuthenticationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthenticationError'
    this.statusCode = 401
  }
}

// Open MongoDB connection
MongoClient.connect(mongodbUri, { useUnifiedTopology: true, poolSize: 10 })
  .then(client => {
    console.log('Connected to MongoDB...')
    createApp(client)
  })
  .catch(err => {
    console.log(err.message)
    process.exit(1)
  })

const createApp = (mongoClient) => {
  const app = express()

  app.use(bodyParser.json())

  app.use(
    ipv4(),
    (req, res, next) => {
      const { ipv4 } = req
      if (ipAddressesWhitelist.indexOf(ipv4) !== -1) {
        next()
      } else {
        throw new AuthenticationError(`Forbidden access for IP '${ipv4}'`)
      }
    })

  // Login endpoint
  // ---------------
  app.post('/login',
    validateJsonSchema({ schema: loginSchema, instanceToValidate: (req) => req.body }),
    mongoFindOne({ mongoClient, db, collection, query: (req) => ({ username: req.body.username, password: req.body.password }), responseProperty: 'user' }),
    (req, res, next) => {
      const { user } = res.locals
      if (user) {
        req.user = { username: user.username, isAdmin: user.isAdmin }
        next()
      } else {
        throw new AuthenticationError(`Invalid credentials for user: ${req.body.username}`)
      }
    },
    signJWT({ payload: (req) => ({ username: req.user.username, isAdmin: req.user.isAdmin }), secret, signOptions: { expiresIn: '24h' } }),
    (req, res) => { res.status(200).json({ token: req.token }) }
  )

  // Create users endpoint
  // ----------------------
  app.post('/users',
    verifyJWT({ secret }),
    (req, res, next) => {
      const { tokenPayload } = req
      if (tokenPayload.isAdmin) {
        next()
      } else {
        throw new AuthenticationError(`Only admin users can create new users`)
      }
    },
    validateJsonSchema({ schema: usersSchema, instanceToValidate: (req) => req.body }),
    mongoInsertOne({ mongoClient, db, collection, docToInsert: (req, res) => req.body }),
    (req, res) => { res.status(200).json({ _id: res.locals.insertedId }) }
  )

  // Read users endpoint (filtering by city and caching results)
  // ------------------------------------------------------------
  app.get('/users/city/:city',
    verifyJWT({ secret }),
    redisGet({ client, key: (req) => req.path, parseResults: true }),  // Searching in Redis cache
    (req, res, next) => {
      const { redisValue } = res.locals
      if (redisValue) {
        console.log('Sending Redis cached results...')
        res.status(200).json(redisValue)  // Sending chached results
      } else {
        next()  // Key not found, proceed to searching users in MongoDB...
      }
    },
    mongoFind({ mongoClient, db, collection, query: (req) => ({ city: req.params.city }), formatResults: { formatters: [(docs) => { return docs.map(x => ({ name: x.name, age: x.age })) }] } }),
    redisSet({ client, key: (req) => req.path, value: (req, res) => JSON.stringify(res.locals.results), expiration: 60 }),  // Caching results in Redis for 60 seconds
    (req, res) => {
      console.log(' ...caching MongoDB results in Redis, sending results...')
      res.status(200).json(res.locals.results)
    })

  // Update users endpoint (emptying cache after updation)
  // ------------------------------------------------------
  const usersSchemaNoRequired = { ...usersSchema }
  delete usersSchemaNoRequired.required  // Deleted the 'required' field of the JSON schema to support validation of a subset of fields
  app.patch('/users/:id',
    verifyJWT({ secret }),
    (req, res, next) => {
      if (!req.tokenPayload.isAdmin) throw new AuthenticationError(`Only admin users can update users`)
      next()
    },
    validateJsonSchema({ schema: usersSchemaNoRequired, instanceToValidate: (req) => req.body }),
    mongoUpdateOne({ mongoClient, db, collection, filter: (req) => ({ _id: new ObjectID(req.params.id) }), contentToUpdate: (req, res) => ({ ...req.body }) }),
    // Remove all related key/values from Redis cache
    redisDel({ client, key: (req) => `/users/city/Palma` }),
    redisDel({ client, key: (req) => `/users/city/La%20Habana` }),
    (req, res) => { res.status(200).send('Document successfully updated. Cache removed.') }
  )

  // Delete users endpoint (emptying cache after deletion)
  // ------------------------------------------------------
  app.delete('/users/:id',
    verifyJWT({ secret }),
    (req, res, next) => {
      if (!req.tokenPayload.isAdmin) throw new AuthenticationError(`Only admin users can delete users`)
      next()
    },
    mongoDeleteOne({ mongoClient, db, collection, filter: (req) => ({ _id: new ObjectID(req.params.id) }) }),
    // Remove all related key/values from Redis cache
    redisDel({ client, key: (req) => `/users/city/Palma` }),
    redisDel({ client, key: (req) => `/users/city/La%20Habana` }),
    (req, res) => { res.status(200).send('Document successfully deleted. Cache removed.') }
  )

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port http://localhost:${port} ...`) })
}
```