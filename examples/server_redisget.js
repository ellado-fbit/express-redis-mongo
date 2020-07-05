const express = require('express')
const redis = require('redis')
const { redisGet } = require('../')

const REDIS_DB_INDEX = 0
const client = redis.createClient({ db: REDIS_DB_INDEX })

const app = express()

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

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).send(err.toString())
})

const port = 3000
app.listen(port, () => { console.log(`Server running on http://localhost:${port} ...`) })
