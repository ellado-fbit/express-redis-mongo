'use strict'

// Middleware wrapper for the Redis SET command.
// Set the string value of a key.

const redisSet = (props) => {
  return (req, res, next) => {

    const client = props.client
    const key = props.key
    const value = props.value
    const expiration = props.expiration

    const errRequiredMsg = (param) => `'${param}' parameter is required`

    try {

      if (!client) {
        throw new Error(errRequiredMsg('client'))
      }

      if (!key) {
        throw new Error(errRequiredMsg('key'))
      }

      if (!value) {
        throw new Error(errRequiredMsg('value'))
      }

      if (!expiration) {
        throw new Error(errRequiredMsg('expiration'))
      }

      if (typeof(key) !== 'function') {
        throw new Error('\'key\' parameter must be a function that accepts req object as parameter')
      }

      if (typeof(key(req)) !== 'string') {
        throw new Error('\'key\' function parameter must return a string')
      }

      if (typeof(value) !== 'function') {
        throw new Error('\'value\' parameter must be a function that accepts req and res objects as parameter')
      }

      if (typeof(value(req, res)) !== 'string') {
        throw new Error('\'value\' function parameter must return a string')
      }

      if (!Number.isInteger(expiration)) {
        throw new Error(`'expiration' parameter must be integer`)
      }

      if (expiration <= 0) {
        throw new Error(`'expiration' parameter must be greater than zero`)
      }

      client.set(key(req), value(req, res), 'EX', expiration, (err) => {
        if (err) {
          err.message = `[redisSet] ${err.message}`
          next(err)
        } else {
          next()
        }
      })

    } catch (error) {
      error.message = `[redisSet] ${error.message}`
      next(error)
    }

  }
}

module.exports = redisSet
