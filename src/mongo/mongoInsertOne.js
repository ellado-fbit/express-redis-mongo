'use strict'

// Middleware wrapper for the MongoDB 'insertOne' method. Inserts a document into a collection.
// The _id of the inserted document is available on the response via 'res.locals.insertedId' by default.

const mongoInsertOne = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const docToInsert = props.docToInsert
    const responseProperty = props.responseProperty

    mongoClient.db(db).collection(collection).insertOne(docToInsert(req, res))
      .then(result => {
        res.locals[responseProperty ? responseProperty : 'insertedId'] = result.insertedId
        next()
      })
      .catch(error => {
        error.message = `[mongoInsertOne] ${error.message}`
        next(error)
      })

  }
}

module.exports = mongoInsertOne
