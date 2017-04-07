'use strict'

const identity = require('lodash/identity')

let badImplementation
try {
  const Boom = require('boom')
  badImplementation = err => err.isBoom ? err : Boom.badImplementation(err)
} catch (err) {
  badImplementation = identity
}

module.exports = badImplementation
