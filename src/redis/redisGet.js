'use strict'

// Middleware wrapper for the Redis GET command. Get the value of a key from the Redis cache.
// Returned value will be available on 'res.locals.redisValue' by default.

const RequiredParamError  = require('../errors/errors').RequiredParamError

const redisGet = (props) => {
  return (req, res, next) => {

    const client = props.client
    const key = props.key
    const parseResults = props.parseResults
    const responseProperty = props.responseProperty ? props.responseProperty : 'redisValue'

    try {
      if (!client) throw new RequiredParamError(`'client' parameter is required`)
      if (!key) throw new RequiredParamError(`'key' parameter is required`)

      if (typeof(key) !== 'function') throw new TypeError(`'key' parameter must be a function that accepts req object as parameter`)
      if (typeof(key(req)) !== 'string') throw new TypeError(`'key' function parameter must return a string`)
      if (parseResults && typeof(parseResults) !== 'boolean') throw new TypeError(`'parseResults' parameter must be boolean`)
      if (responseProperty && typeof(responseProperty) !== 'string') throw new TypeError(`'responseProperty' parameter must be string`)
    } catch (error) {
      error.message = `[redisGet] ${error.message}`
      return next(error)
    }

    client.get(key(req), (err, value) => {
      try {
        if (err) throw err

        res.locals[responseProperty] = parseResults ? JSON.parse(value) : value
        return next()

      } catch (error) {
        error.message = `[redisGet] ${error.message}`
        return next(error)
      }
    })

  }
}

module.exports = redisGet
