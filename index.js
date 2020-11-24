'use strict'

const redisGet = require('./src/redis/redisGet')
const redisSet = require('./src/redis/redisSet')
const redisDel = require('./src/redis/redisDel')
const mongoFind = require('./src/mongo/mongoFind')
const mongoFindOne = require('./src/mongo/mongoFindOne')
const mongoInsertOne = require('./src/mongo/mongoInsertOne')
const mongoDeleteOne = require('./src/mongo/mongoDeleteOne')
const mongoUpdateOne = require('./src/mongo/mongoUpdateOne')
const mongoReplaceOne = require('./src/mongo/mongoReplaceOne')
const mongoCreateIndex = require('./src/mongo/mongoCreateIndex')

module.exports = {
  redisGet: redisGet,
  redisSet: redisSet,
  redisDel: redisDel,
  mongoFind: mongoFind,
  mongoFindOne: mongoFindOne,
  mongoInsertOne: mongoInsertOne,
  mongoDeleteOne: mongoDeleteOne,
  mongoUpdateOne: mongoUpdateOne,
  mongoReplaceOne: mongoReplaceOne,
  mongoCreateIndex: mongoCreateIndex
}
