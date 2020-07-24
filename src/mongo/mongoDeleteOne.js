'use strict'

// Middleware wrapper for the MongoDB 'deleteOne' operation.
// Deletes the first document that matches the filter.

const RequiredParamError  = require('../errors/errors').RequiredParamError
const NotFoundDocError  = require('../errors/errors').NotFoundDocError

const mongoDeleteOne = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const filter = props.filter

    try {
      // Required checks
      if (!mongoClient) throw new RequiredParamError(`'mongoClient' parameter is required`)
      if (!db) throw new RequiredParamError(`'db' parameter is required`)
      if (!collection) throw new RequiredParamError(`'collection' parameter is required`)
      if (!filter) throw new RequiredParamError(`'filter' parameter is required`)

      // Type checks
      if (typeof(db) !== 'string') throw new TypeError(`'db' parameter must be a string`)
      if (typeof(collection) !== 'string') throw new TypeError(`'collection' parameter must be a string`)
      if (typeof(filter) !== 'function') throw new TypeError(`'filter' parameter must be a function that accepts req object as parameter`)
      if (filter(req).constructor !== Object) throw new TypeError(`'filter' function parameter must return an object`)

    } catch (error) {
      error.message = `[mongoDeleteOne] ${error.message}`
      return next(error)
    }

    mongoClient.db(db).collection(collection).deleteOne(filter(req))
      .then(result => {
        if (result.deletedCount === 1) {
          return next()
        } else {
          throw new NotFoundDocError(`Document not found`)
        }
      })
      .catch(error => {
        error.message = `[mongoDeleteOne] ${error.message}`
        return next(error)
      })

  }
}

module.exports = mongoDeleteOne
