'use strict'

const test = require('ava')
const Boom = require('boom')
const sinon = require('sinon')

const createCatchToError = require('.')
const toErrors = createCatchToError(Boom.badImplementation)

test(
  'toErrors(errorCategories) should throw an error when no on property has been supplied',
  t => {
    const someError = new Error('Some error')

    const errorOut = t.throws(() => {
      toErrors({
        toError: Boom.badRequest('This will not be thrown')
      })(someError)
    })

    t.is(
      errorOut.message,
      'catchToError() was supplied a configuration with a missing on property.'
    )
  }
)

test(
  'when given no categories of errors to wait for should log the error',
  t => {
    const logger = sinon.spy()
    const toErrorsWithLogger = createCatchToError(
      Boom.badImplementation,
      logger
    )

    t.is(logger.callCount, 0)
    try {
      toErrorsWithLogger([])(new Error('Some error that will be logged...'))
    } catch (ignoreError) {
      t.is(logger.callCount, 1)
    }
  }
)

test(
  'when given no categories of errors to wait for should throw using badImplementation',
  t => {
    const originalError = new Error('Some error lost to time...')

    const errorOut = t.throws(() => {
      try {
        toErrors([])(originalError)
      } catch (badImplementationError) {
        t.deepEqual(badImplementationError.output.payload, {
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        })
        throw badImplementationError
      }
    })

    t.is(errorOut.message, 'Some error lost to time...')
  }
)

test(
  'when given an array of errors to wait for should generate an error using the function at errorCategory.throwError',
  t => {
    const nothing = t => null
    const error = new Error('Inner error message...')

    const errorOut = t.throws(() => {
      toErrors({
        on: [Error],
        toError: err =>
          Boom.badRequest(`Prefixed error message: ${err.message}`)
      })(error)
    })

    t.is(errorOut.message, 'Prefixed error message: Inner error message...')
  }
)

test(
  'when given an array of errors to wait for should throw the error at errorCategory.throwError',
  t => {
    const error = new Error('Lost error message...')

    const errorOut = t.throws(() => {
      toErrors({
        on: Error,
        toError: Boom.notFound('We cannot find X.')
      })(error)
    })

    t.is(errorOut.message, 'We cannot find X.')
  }
)

test(
  'when given a predicated-based category of errors to wait for should generate an error using the function at errorCategory.throwError',
  t => {
    const badConstraintError = new Error('SQLITE bad constraint error')
    badConstraintError.errno = 19

    const errorOut = t.throws(() => {
      toErrors({
        on: err => err.errno === 19,
        toError: Boom.badRequest('A constraint caused a failure.')
      })(badConstraintError)
    })

    t.is(errorOut.message, 'A constraint caused a failure.')
  }
)
