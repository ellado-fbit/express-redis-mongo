const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const { MongoClient } = require('mongodb')
const { ipv4, validateJsonSchema, signJWT, verifyJWT } = require('@fundaciobit/express-middleware')
const { redisGet, redisSet, mongoFindOne, mongoFind, mongoInsertOne } = require('../')

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
    password: { type: 'string' },
    isAdmin: { type: 'boolean' },
    name: { type: 'string' },
    surname: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    address: { type: 'string' },
    city: { type: 'string' },
    postalCode: { type: 'string' }
  },
  additionalProperties: false
}

const loginSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string' }
  },
  additionalProperties: false
}

const secret = 'mimamamemima'
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
        next()  // Key not found, then searching users in MongoDB...
      }
    },
    mongoFind({ mongoClient, db, collection, query: (req) => ({ city: req.params.city }), formatResults: { formatters: [(docs) => { return docs.map(x => ({ name: x.name, age: x.age })) }] } }),
    redisSet({ client, key: (req) => req.path, value: (req, res) => JSON.stringify(res.locals.results), expiration: 30 }),  // Caching results in Redis for 30 seconds
    (req, res) => {
      console.log(' ...caching MongoDB results in Redis, sending results...')
      res.status(200).json(res.locals.results)
    })

  app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).send(err.toString())
  })

  const port = 3000
  app.listen(port, () => { console.log(`Server running on port http://localhost:${port} ...`) })
}