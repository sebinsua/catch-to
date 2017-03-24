'use strict'

const identity = require('lodash/identity')

let badImplementation
try {
  badImplementation = require('boom').badImplementation
} catch (err) {
  badImplementation = identity
}

module.exports = badImplementation
