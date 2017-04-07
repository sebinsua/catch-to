'use strict'

const noop = require('lodash/noop')

const noopLogger = noop
noopLogger.preLog = noop
noopLogger.postLog = noop

module.exports = noopLogger
