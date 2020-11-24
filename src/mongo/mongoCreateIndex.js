'use strict'

// Middleware wrapper for the MongoDB 'createIndex' method. Creates an index on a collection.

const RequiredParamError  = require('../errors/errors').RequiredParamError

const mongoCreateIndex = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const keys = props.keys
    const options = props.options ? props.options : {}

    try {
      // Required checks
      if (!mongoClient) throw new RequiredParamError(`'mongoClient' parameter is required`)
      if (!db) throw new RequiredParamError(`'db' parameter is required`)
      if (!collection) throw new RequiredParamError(`'collection' parameter is required`)
      if (!keys) throw new RequiredParamError(`'keys' parameter is required`)

      // Type checks
      if (typeof(db) !== 'string') throw new TypeError(`'db' parameter must be a string`)
      if (typeof(collection) !== 'string') throw new TypeError(`'collection' parameter must be a string`)
      if (keys.constructor !== Object) throw new TypeError(`'keys' parameter must return an object`)
      if (options.constructor !== Object) throw new TypeError(`'options' parameter must return an object`)

    } catch (error) {
      error.message = `[mongoCreateIndex] ${error.message}`
      return next(error)
    }

    mongoClient.db(db).collection(collection).createIndex(keys, options)
      .then(indexName => {
        return next()
      })
      .catch(error => {
        error.message = `[mongoCreateIndex] ${error.message}`
        return next(error)
      })

  }
}

module.exports = mongoCreateIndex
