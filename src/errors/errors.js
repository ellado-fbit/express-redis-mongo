'use strict'

class RequiredParamError extends Error {
  constructor(message) {
    super(message)
    this.name = 'RequiredParamError'
    this.statusCode = 400
  }
}

class NotFoundDocError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundDocError'
    this.statusCode = 404
  }
}

module.exports = {
  RequiredParamError: RequiredParamError,
  NotFoundDocError: NotFoundDocError
}
