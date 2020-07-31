'use strict'

// Middleware wrapper for the Redis SET command.
// Set the string value of a key.

const RequiredParamError  = require('../errors/errors').RequiredParamError

const redisSet = (props) => {
  return (req, res, next) => {

    const client = props.client
    const key = props.key
    const value = props.value
    const expiration = props.expiration

    const errRequiredMsg = (param) => `'${param}' parameter is required`

    try {
      if (!client) throw new RequiredParamError(errRequiredMsg('client'))
      if (!key) throw new RequiredParamError(errRequiredMsg('key'))
      if (!value) throw new RequiredParamError(errRequiredMsg('value'))
      if (!expiration) throw new RequiredParamError(errRequiredMsg('expiration'))

      if (typeof(key) !== 'function') throw new TypeError(`'key' parameter must be a function that accepts req object as parameter`)
      if (typeof(key(req)) !== 'string') throw new TypeError(`'key' function parameter must return a string`)
      if (typeof(value) !== 'function') throw new TypeError(`'value' parameter must be a function that accepts req and res objects as parameters`)
      if (typeof(value(req, res)) !== 'string') throw new TypeError(`'value' function parameter must return a string`)
      if (!Number.isInteger(expiration)) throw new TypeError(`'expiration' parameter must be an integer number`)
      if (expiration <= 0) throw new TypeError(`'expiration' parameter must be greater than zero`)
    } catch (error) {
      error.message = `[redisSet] ${error.message}`
      return next(error)
    }

    client.set(key(req), value(req, res), 'EX', expiration, (err) => {
      try {
        if (err) throw err

        return next()

      } catch (error) {
        error.message = `[redisSet] ${error.message}`
        return next(error)
      }
    })

  }
}

module.exports = redisSet
