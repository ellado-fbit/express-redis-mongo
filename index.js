'use strict'

const redisGet = require('./src/redis/redisGet')
const redisSet = require('./src/redis/redisSet')
const redisDel = require('./src/redis/redisDel')
const mongoFind = require('./src/mongo/mongoFind')
const mongoInsertOne = require('./src/mongo/mongoInsertOne')
const mongoDeleteOne = require('./src/mongo/mongoDeleteOne')

module.exports = {
  redisGet: redisGet,
  redisSet: redisSet,
  redisDel: redisDel,
  mongoFind: mongoFind,
  mongoInsertOne: mongoInsertOne,
  mongoDeleteOne: mongoDeleteOne
}
