const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const { redisGet, redisSet, redisDel } = require('../')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

app.use(bodyParser.json())

app.get('/users/:username',
  redisGet({
    client,
    key: (req) => req.params.username,
    parseResults: true
  }),
  (req, res) => {
    const { redisValue } = res.locals
    if (redisValue) return res.status(200).json(redisValue)
    res.status(404).send('Not found')
  })

app.post('/users',
  redisSet({
    client,
    key: (req) => req.body.username,
    // eslint-disable-next-line no-unused-vars
    value: (req, res) => JSON.stringify({ ip: req.ip }),
    expiration: 600  // seconds
  }),
  (req, res) => {
    res.status(200).send('Data cached')
  })

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

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.toString())
})

const port = 3000
app.listen(port, () => { console.log(`Server running on http://localhost:${port} ...`) })
