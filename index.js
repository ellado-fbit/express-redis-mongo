'use strict'

const redisGet = require('./src/redis/redisGet')
const redisSet = require('./src/redis/redisSet')
const mongoFind = require('./src/mongo/mongoFind')

module.exports = {
  redisGet: redisGet,
  redisSet: redisSet,
  mongoFind: mongoFind
}
