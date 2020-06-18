'use strict'

// Middleware wrapper for the Redis GET command.
// Get the value of a key from the Redis cache.
// Returned value will be available on 'res.locals.redisValue' by default.

const redisGet = (props) => {
  return (req, res, next) => {

    const client = props.client
    const key = props.key
    const parseResults = props.parseResults
    const responseProperty = props.responseProperty

    try {

      if (!client) {
        throw new Error('\'client\' parameter is required')
      }

      if (!key) {
        throw new Error('\'key\' parameter is required')
      }

      if (typeof(key) !== 'function') {
        throw new Error('\'key\' parameter must be a function that accepts req object as parameter')
      }

      if (typeof(key(req)) !== 'string') {
        throw new Error('\'key\' function parameter must return a string')
      }

      if (parseResults && typeof(parseResults) !== 'boolean') {
        throw new Error('\'parseResults\' parameter must be boolean')
      }

      if (responseProperty && typeof(responseProperty) !== 'string') {
        throw new Error('\'responseProperty\' parameter must be string')
      }

      client.get(key(req), (err, value) => {
        if (err) {
          err.message = `[redisGet] ${err.message}`
          next(err)
        }

        if (value) {

          if (parseResults) {
            try {
              value = JSON.parse(value)
            } catch (err) {
              err.message = `[redisGet] The value extracted from Redis is not a valid JSON format: ${err.message}`
              next(err)
            }
          }

          res.locals[responseProperty ? responseProperty : 'redisValue'] = value
        }

        next()
      })

    } catch (error) {
      error.message = `[redisGet] ${error.message}`
      next(error)
    }

  }
}

module.exports = redisGet
