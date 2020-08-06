'use strict'

// Middleware wrapper for the MongoDB 'updateOne' method. Update a single document in a collection based on the filter.

const RequiredParamError  = require('../errors/errors').RequiredParamError
const NotFoundDocError  = require('../errors/errors').NotFoundDocError

const mongoUpdateOne = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const filter = props.filter
    const contentToUpdate = props.contentToUpdate

    try {
      // Required checks
      if (!mongoClient) throw new RequiredParamError(`'mongoClient' parameter is required`)
      if (!db) throw new RequiredParamError(`'db' parameter is required`)
      if (!collection) throw new RequiredParamError(`'collection' parameter is required`)
      if (!filter) throw new RequiredParamError(`'filter' parameter is required`)
      if (!contentToUpdate) throw new RequiredParamError(`'contentToUpdate' parameter is required`)

      // Type checks
      if (typeof(db) !== 'string') throw new TypeError(`'db' parameter must be a string`)
      if (typeof(collection) !== 'string') throw new TypeError(`'collection' parameter must be a string`)
      if (typeof(filter) !== 'function') throw new TypeError(`'filter' parameter must be a function that accepts req object as parameter`)
      if (filter(req).constructor !== Object) throw new TypeError(`'filter' function parameter must return an object`)
      if (typeof(contentToUpdate) !== 'function') throw new TypeError(`'contentToUpdate' parameter must be a function that accepts req and res objects as parameters`)
      if (contentToUpdate(req, res).constructor !== Object) throw new TypeError(`'contentToUpdate' function parameter must return an object`)
    } catch (error) {
      error.message = `[mongoUpdateOne] ${error.message}`
      return next(error)
    }

    mongoClient.db(db).collection(collection).updateOne(filter(req), { $set: contentToUpdate(req, res) })
      .then(result => {
        if (result.matchedCount === 0) {
          throw new NotFoundDocError(`Document not found`)
        } else if (result.modifiedCount > 0) {
          return next()
        } else {
          throw new Error(`Document found but not modified`)
        }
      })
      .catch(error => {
        error.message = `[mongoUpdateOne] ${error.message}`
        return next(error)
      })

  }
}

module.exports = mongoUpdateOne
