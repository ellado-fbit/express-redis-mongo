'use strict'

// Middleware wrapper for the MongoDB `findOne` method with optional parameter to format the result.
// The retrieved document will be available on the response via the `res.locals.result` by default.

const RequiredParamError  = require('../errors/errors').RequiredParamError

const mongoFindOne = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const query = props.query
    const projection = props.projection ? props.projection : {}
    const responseProperty = props.responseProperty ? props.responseProperty : 'result'
    const formatResult = props.formatResult

    try {
      // Required checks
      if (!mongoClient) throw new RequiredParamError(`'mongoClient' parameter is required`)
      if (!db) throw new RequiredParamError(`'db' parameter is required`)
      if (!collection) throw new RequiredParamError(`'collection' parameter is required`)
      if (!query) throw new RequiredParamError(`'query' parameter is required`)

      // Type checks
      if (typeof(db) !== 'string') throw new TypeError(`'db' parameter must be a string`)
      if (typeof(collection) !== 'string') throw new TypeError(`'collection' parameter must be a string`)
      if (typeof(query) !== 'function') throw new TypeError(`'query' parameter must be a function that accepts req object as parameter`)
      if (query(req).constructor !== Object) throw new TypeError(`'query' function parameter must return an object`)
      if (projection.constructor !== Object) throw new TypeError(`'projection' parameter must be an object`)
      if (typeof(responseProperty) !== 'string') throw new TypeError(`'responseProperty' parameter must be a string`)
      if (formatResult && typeof(formatResult) !== 'function') throw new TypeError(`'formatResult' parameter must be a function`)
    } catch (error) {
      error.message = `[mongoFindOne] ${error.message}`
      return next(error)
    }

    mongoClient.db(db).collection(collection).findOne(query(req), { projection: projection })
      .then(doc => {
        res.locals[responseProperty] = formatResult && doc ? formatResult(doc) : doc
        return next()
      })
      .catch(error => {
        error.message = `[mongoFindOne] ${error.message}`
        return next(error)
      })

  }
}

module.exports = mongoFindOne
