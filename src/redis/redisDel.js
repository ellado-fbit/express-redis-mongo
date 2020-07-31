'use strict'

// Middleware wrapper for the Redis DEL command. Deletes a key from the Redis cache.
// Redis response will be available on `res.locals.redisResponse`.
// The response will be (integer) 1 in a delete successful operation.

const RequiredParamError  = require('../errors/errors').RequiredParamError

const redisDel = (props) => {
  return (req, res, next) => {

    const client = props.client
    const key = props.key

    try {
      if (!client) throw new RequiredParamError(`'client' parameter is required`)
      if (!key) throw new RequiredParamError(`'key' parameter is required`)

      if (typeof(key) !== 'function') throw new TypeError(`'key' parameter must be a function that accepts req object as parameter`)
      if (typeof(key(req)) !== 'string') throw new TypeError(`'key' function parameter must return a string`)
    } catch (error) {
      error.message = `[redisDel] ${error.message}`
      return next(error)
    }

    client.del(key(req), (err, response) => {
      try {
        if (err) throw err

        res.locals.redisResponse = response
        return next()

      } catch (error) {
        error.message = `[redisDel] ${error.message}`
        return next(error)
      }
    })

  }
}

module.exports = redisDel
