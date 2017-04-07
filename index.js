'use strict'

const some = require('lodash/fp/some')
const noop = require('lodash/noop')
const identity = require('lodash/identity')
const badImplementation = require('./bad-implementation')

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
  defaultLog = noop
) {
  return function catchToError (errorCategories = [], log) {
    errorCategories = [].concat(errorCategories)
    log = log || defaultLog

    return err => {
      log(err)

      const errorMatcher = createErrorMatcher(err)

      for (let i = 0; i < errorCategories.length; i++) {
        const category = errorCategories[i]
        const errorsToTestFor = [].concat(category.on)

        if (errorMatcher(errorsToTestFor)) {
          if ('toError' in category || 'throwError' in category) {
            const errorCreatorOrError = category.toError || category.throwError
            const isError = typeof errorCreatorOrError !== 'function'
            throw isError ? errorCreatorOrError : errorCreatorOrError(err)
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

      throw fallbackError(err)
    }
  }
}

const errorHandlerWithoutFallback = createCatchToError(identity)

const createCatchTo = on =>
  (toError = identity, log) => errorHandlerWithoutFallback({ on, toError }, log)

module.exports = createCatchToError
module.exports.createCatchTo = createCatchTo
