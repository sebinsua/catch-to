'use strict'

const some = require('lodash/fp/some')
const noop = require('lodash/noop')
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

function createCatchToError (fallbackError = badImplementation, log = noop) {
  return function catchToError (errorCategories = []) {
    errorCategories = [].concat(errorCategories)

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

module.exports = createCatchToError
