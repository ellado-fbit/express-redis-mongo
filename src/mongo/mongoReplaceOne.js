'use strict'

// Middleware wrapper for the MongoDB 'replaceOne' method. Replaces a single document within the collection based on the filter.
// If `upsert: true` and no documents match the filter, `mongoReplaceOne` creates a new document based on the replacement document (in this case ...
// ... the _id value of the upserted document is available on the response via 'res.locals.upsertedId' <String> by default).

const RequiredParamError  = require('../errors/errors').RequiredParamError
const NotFoundDocError  = require('../errors/errors').NotFoundDocError

const mongoReplaceOne = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const filter = props.filter
    const contentToReplace = props.contentToReplace
    const upsert = props.upsert ? props.upsert : false
    const responseProperty = props.responseProperty ? props.responseProperty : 'upsertedId'

    try {
      // Required checks
      if (!mongoClient) throw new RequiredParamError(`'mongoClient' parameter is required`)
      if (!db) throw new RequiredParamError(`'db' parameter is required`)
      if (!collection) throw new RequiredParamError(`'collection' parameter is required`)
      if (!filter) throw new RequiredParamError(`'filter' parameter is required`)
      if (!contentToReplace) throw new RequiredParamError(`'contentToReplace' parameter is required`)

      // Type checks
      if (typeof(db) !== 'string') throw new TypeError(`'db' parameter must be a string`)
      if (typeof(collection) !== 'string') throw new TypeError(`'collection' parameter must be a string`)
      if (typeof(filter) !== 'function') throw new TypeError(`'filter' parameter must be a function that accepts req object as parameter`)
      if (filter(req).constructor !== Object) throw new TypeError(`'filter' function parameter must return an object`)
      if (typeof(contentToReplace) !== 'function') throw new TypeError(`'contentToReplace' parameter must be a function that accepts req and res objects as parameters`)
      if (contentToReplace(req, res).constructor !== Object) throw new TypeError(`'contentToReplace' function parameter must return an object`)
      if (typeof(upsert) !== 'boolean') throw new TypeError(`'upsert' parameter must be a boolean`)
      if (typeof(responseProperty) !== 'string') throw new TypeError(`'responseProperty' parameter must be a string`)
    } catch (error) {
      error.message = `[mongoReplaceOne] ${error.message}`
      return next(error)
    }

    mongoClient.db(db).collection(collection).replaceOne(filter(req), contentToReplace(req, res), { upsert: upsert })
      .then(result => {
        if (result.upsertedId) {
          res.locals[responseProperty] = result.upsertedId._id
          return next()
        } else if (result.matchedCount === 0) {
          throw new NotFoundDocError(`Document not found`)
        } else if (result.modifiedCount > 0) {
          return next()
        } else {
          throw new Error(`Document found but not replaced`)
        }
      })
      .catch(error => {
        error.message = `[mongoReplaceOne] ${error.message}`
        return next(error)
      })

  }
}

module.exports = mongoReplaceOne
