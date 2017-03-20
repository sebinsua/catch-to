'use strict'

const identity = require('lodash/identity')

let badImplementation
try {
  badImplementation = require('boom')
} catch (err) {
  badImplementation = identity
}

module.exports = badImplementation
