'use strict'

// Middleware wrapper for the MongoDB 'find' method with optional parameter to format results.
// The retrieved documents will be available on the response via the 'res.locals.results' by default.

const mongoFind = (props) => {
  return (req, res, next) => {

    const mongoClient = props.mongoClient
    const db = props.db
    const collection = props.collection
    const query = props.query
    const projection = props.projection
    const limit = props.limit
    const responseProperty = props.responseProperty
    const formatResults = props.formatResults

    mongoClient.db(db).collection(collection).find(query(req), { projection: projection }).limit(limit).toArray()
      .then(docs => {

        if (formatResults && formatResults.formatters) {
          formatResults.formatters.forEach(formatter => docs = formatter(docs))
        }

        res.locals[responseProperty ? responseProperty : 'results'] = docs
        next()
      })
      .catch(error => {
        error.message = `[mongoFind] ${error.message}`
        next(error)
      })

  }
}

module.exports = mongoFind
