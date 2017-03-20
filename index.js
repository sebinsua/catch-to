'use strict'

const Boom = require('boom')
const some = require('lodash/fp/some')

const noop = () => undefined

const isErrorClass = potentialErrorClass =>
  potentialErrorClass.name === 'Error' ||
  potentialErrorClass.prototype instanceof Error

const createErrorMatcher = err => some(errorClassOrFn => {
  if (!errorClassOrFn) {
    throw new Error(
      'catchToError() was supplied a configuration object with a missing on property.'
    )
  }

  if (!isErrorClass(errorClassOrFn)) {
    return errorClassOrFn(err)
  }

  return err instanceof errorClassOrFn
})

function createCatchToError (
  fallbackError = Boom.badImplementation,
  log = noop
) {
  return function catchToError (
    errorCategories = []
  ) {
    errorCategories = [].concat(errorCategories)

    return err => {
      log(err)

      const errorMatcher = createErrorMatcher(err)

      for (let i = 0; i < errorCategories.length; i++) {
        const errorsToTestFor = [].concat(errorCategories[i].on)
        const errorCreatorOrError = errorCategories[i].throwError

        if (errorMatcher(errorsToTestFor)) {
          const isError = typeof errorCreatorOrError !== 'function'

          throw isError
            ? errorCreatorOrError
            : errorCreatorOrError(err)
        }
      }

      throw fallbackError(err)
    }
  }
}

module.exports = createCatchToError
