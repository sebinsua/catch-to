'use strict'

const noop = require('lodash/noop')

const noopLogger = noop
noopLogger.preLog = noop
noopLogger.postLog = noop

const logOriginalErrorWith = logger => ({ preLog: logger, postLog: noop })

module.exports = {
  noopLogger,
  logOriginalErrorWith
}
