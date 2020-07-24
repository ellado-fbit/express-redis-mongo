'use strict'

// Middleware wrapper for the MongoDB 'insertOne' method. Inserts a document into a collection.
// The _id of the inserted document is available on the response via 'res.locals.insertedId' by default.

const RequiredParamError  = require('../errors/errors').RequiredParamError

const mongoInsertOne = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const docToInsert = props.docToInsert
    const responseProperty = props.responseProperty ? props.responseProperty : 'insertedId'

    try {
      // Required checks
      if (!mongoClient) throw new RequiredParamError(`'mongoClient' parameter is required`)
      if (!db) throw new RequiredParamError(`'db' parameter is required`)
      if (!collection) throw new RequiredParamError(`'collection' parameter is required`)
      if (!docToInsert) throw new RequiredParamError(`'docToInsert' parameter is required`)

      // Type checks
      if (typeof(db) !== 'string') throw new TypeError(`'db' parameter must be a string`)
      if (typeof(collection) !== 'string') throw new TypeError(`'collection' parameter must be a string`)
      if (typeof(docToInsert) !== 'function') throw new TypeError(`'docToInsert' parameter must be a function that accepts req and res objects as parameters`)
      if (docToInsert(req, res).constructor !== Object) throw new TypeError(`'docToInsert' function parameter must return an object`)
      if (typeof(responseProperty) !== 'string') throw new TypeError(`'responseProperty' parameter must be a string`)

    } catch (error) {
      error.message = `[mongoInsertOne] ${error.message}`
      return next(error)
    }

    mongoClient.db(db).collection(collection).insertOne(docToInsert(req, res))
      .then(result => {
        res.locals[responseProperty] = result.insertedId
        return next()
      })
      .catch(error => {
        error.message = `[mongoInsertOne] ${error.message}`
        return next(error)
      })

  }
}

module.exports = mongoInsertOne
