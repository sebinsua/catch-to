'use strict'

const some = require('lodash/fp/some')
const identity = require('lodash/identity')
const noop = require('lodash/noop')
const badImplementation = require('./bad-implementation')
const { noopLogger, logOriginalErrorWith } = require('./logger')

const isErrorClass = potentialErrorClass =>
  potentialErrorClass.name === 'Error' ||
  potentialErrorClass.prototype instanceof Error

const createErrorMatcher = err => some(errorClassOrFn => {
  if (!errorClassOrFn) {
    throw new Error(
      'catchToError() was supplied a configuration with a missing on property.'
    )
  }

  if (!isErrorClass(errorClassOrFn)) {
    return errorClassOrFn(err)
  }

  return err instanceof errorClassOrFn
})

function createCatchToError (
  fallbackError = badImplementation,
  defaultLog = noopLogger
) {
  return function catchToError (errorCategories = [], log) {
    errorCategories = [].concat(errorCategories)
    log = log || defaultLog

    const preLog = log.preLog || log || noop
    const postLog = log.postLog || noop

    return err => {
      preLog(err)

      const errorMatcher = createErrorMatcher(err)

      for (let i = 0; i < errorCategories.length; i++) {
        const category = errorCategories[i]
        const errorsToTestFor = [].concat(category.on)

        if (errorMatcher(errorsToTestFor)) {
          if ('toError' in category || 'throwError' in category) {
            const errorCreatorOrError = category.toError || category.throwError
            const isError = typeof errorCreatorOrError !== 'function'
            const newError = isError
              ? errorCreatorOrError
              : errorCreatorOrError(err)

            postLog(newError)

            throw newError
          } else if ('toValue' in category) {
            const valueCreatorOrValue = category.toValue
            const isValue = typeof valueCreatorOrValue !== 'function'
            return isValue ? valueCreatorOrValue : valueCreatorOrValue(err)
          } else {
            throw new Error(
              'catchToError() was supplied a configuration with a missing toError/toValue property.'
            )
          }
        }
      }

      const newError = fallbackError(err)

      postLog(newError)

      throw newError
    }
  }
}

const errorHandlerWithoutFallback = createCatchToError(identity)

const createCatchTo = on =>
  (toError = identity, log) =>
    errorHandlerWithoutFallback({ on, toError }, log)

module.exports = createCatchToError
module.exports.createCatchTo = createCatchTo
module.exports.logOriginalErrorWith = logOriginalErrorWith
