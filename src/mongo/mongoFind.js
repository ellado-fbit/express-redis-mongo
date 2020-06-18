'use strict'

// Middleware wrapper for the MongoDB 'find' method with optional parameter to format results.
// The retrieved results will be available on the response via the 'results' property, by default.

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
      .then(items => {

        if (formatResults && formatResults.formatters) {
          formatResults.formatters.forEach(formatter => formatter(items))
        }

        res.locals[responseProperty ? responseProperty : 'results'] = items
        next()
      })
      .catch(error => {
        error.message = `[mongoFind] ${error.message}`
        next(error)
      })

  }
}

module.exports = mongoFind
