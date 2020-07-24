'use strict'

// Middleware wrapper for the MongoDB 'find' method with optional parameter to format results.
// The retrieved documents will be available on the response via the 'res.locals.results' by default.

const RequiredParamError  = require('../errors/errors').RequiredParamError

const mongoFind = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const query = props.query
    const projection = props.projection ? props.projection : {}
    const limit = props.limit ? props.limit : 0
    const sort = props.sort ? props.sort : {}
    const responseProperty = props.responseProperty ? props.responseProperty : 'results'
    const formatResults = props.formatResults

    try {
      // Required checks
      if (!mongoClient) throw new RequiredParamError(`'mongoClient' parameter is required`)
      if (!db) throw new RequiredParamError(`'db' parameter is required`)
      if (!collection) throw new RequiredParamError(`'collection' parameter is required`)
      if (!query) throw new RequiredParamError(`'query' parameter is required`)

      // Type checks
      if (typeof(db) !== 'string') throw new TypeError(`'db' parameter must be a string`)
      if (typeof(collection) !== 'string') throw new TypeError(`'collection' parameter must be a string`)
      if (typeof(query) !== 'function') throw new TypeError('\'query\' parameter must be a function that accepts req object as parameter')
      if (query(req).constructor !== Object) throw new TypeError('\'query\' function parameter must return an object')
      if (projection.constructor !== Object) throw new TypeError(`'projection' parameter must be an object`)
      if (!Number.isInteger(limit)) throw new TypeError(`'limit' parameter must be an integer number`)
      if (typeof(sort) !== 'object') throw new TypeError(`'sort' parameter must be object or array`)
      if (typeof(responseProperty) !== 'string') throw new TypeError(`'responseProperty' parameter must be a string`)
      if (formatResults && formatResults.constructor !== Object) throw new TypeError(`'formatResults' parameter must be an object`)
      if (formatResults && !formatResults.formatters) throw new TypeError(`'formatResults' parameter must include a 'formatters' field`)
      if (formatResults && formatResults.formatters.constructor !== Array) throw new TypeError(`'formatters' field must be an array of functions`)
      if (formatResults) {
        let isErr = false
        formatResults.formatters.forEach(func => {
          if (typeof(func) !== 'function') isErr = true
        })
        if (isErr) throw new TypeError(`All elements of 'formatters' field must be functions`)
      }

    } catch (error) {
      error.message = `[mongoFind] ${error.message}`
      return next(error)
    }

    mongoClient.db(db).collection(collection).find(query(req), { projection: projection }).limit(limit).sort(sort).toArray()
      .then(docs => {

        // Format results
        if (formatResults && formatResults.formatters) {
          formatResults.formatters.forEach(formatter => docs = formatter(docs))
        }

        res.locals[responseProperty] = docs
        return next()
      })
      .catch(error => {
        error.message = `[mongoFind] ${error.message}`
        return next(error)
      })

  }
}

module.exports = mongoFind
