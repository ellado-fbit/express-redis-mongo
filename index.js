'use strict'

const redisGet = require('./src/redis/redisGet')
const redisSet = require('./src/redis/redisSet')

module.exports = {
  redisGet: redisGet,
  redisSet: redisSet
}
