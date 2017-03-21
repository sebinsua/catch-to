# `catch-to`
> Catch errors and declaratively map them to other errors or values.

This is useful when you do not wish to expose the specific errors your system
uses to describe its internal state, and instead want to respond with more general, human-like errors.

## Example

```js
const Boom = require('boom')
const toErrors = require('catch-to')(Boom.badImplementation)

const login = require('./login')
const {
  UnauthorizedLoginError,
  AccountLockedError,
  TooManyLoginsError,
  MissingAuthenticityTokenError
} = require('./errors')

login('username', 'password')
  .catch(
    toErrors([
      {
        on: [ UnauthorizedLoginError, MissingAuthenticityTokenError ],
        toError: err => Boom.unauthorized(err)
      },
      {
        on: TooManyLoginsError
        toError: Boom.badRequest()
      },
      {
        on: AccountLockedError,
        toError: Boom.locked()
      }
    ])
  )
```

## API

### `CreateCatchToSignature`: `(fallbackError?: ToErrorSignature, log?: LogSignature): CatchToSignature`

### `CatchToSignature`: `(errorCategories?: ErrorCategory|Array<ErrorCategory>): CatchSignature`

### `CatchSignature`: `(error: Error): Error|any`

### Types

#### `ErrorCategory`: `Array<{ on: Error|Array<Error>|ErrorPredicateSignature, toError?: Error|ToErrorSignature, toValue?: any|ToValueSignature }>`

#### `ErrorPredicateSignature`: `(error: Error): boolean`

#### `ToErrorSignature`: `(error: Error): Error`

#### `ToValueSignature`: `(error: Error): any`

#### `LogSignature`: `(message?: string): void`

## Install

```sh
yarn add catch-to
```
