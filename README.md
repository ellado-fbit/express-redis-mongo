A useful collection of Express middleware wrappers for Redis and MongoDB.

## Middlewares

| middleware    | description                                           |
|---------------|-------------------------------------------------------|
| redisGet      | Get the value of a key from Redis cache.              |
| redisSet      | Set the string value of a key to Redis cache.         |
| mongoFind     | `pending`                                             |

## Install

```bash
npm install @fundaciobit/express-middleware
```

## Redis GET command
Middleware wrapper for the Redis GET command. Get the value of a key from the Redis cache. Returned value is available via `res.locals.redisValue` by default.

```js
const express = require('express')
const redis = require('redis')
const { redisGet } = require('@fundaciobit/express-middleware')

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

## Redis SET command
Middleware wrapper for the Redis SET command. Set the string value of a key.

```js
const express = require('express')
const redis = require('redis')
const { redisSet } = require('@fundaciobit/express-middleware')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.get('/username/:username',
  ipv4(),  // set IPv4 in req.ipv4
  redisSet({
    client,
    key: (req) => req.path,
    value: (req, res) => JSON.stringify({ username: req.params.username, ip_address: req.ipv4 }),
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
