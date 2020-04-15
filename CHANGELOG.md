# Changelog

All notable changes to this project will be documented in this file. Starting with v0.1.0.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.1.0] -- 2020-04-15

### Changed
  * Better interop between Services, Relays and Resolvers for `@AddToTrace()`
  * Exposed `traceActive()`
  * When `@AddToTrace()`, if there is no active trace, return the unwrapped original implementation
### Fixed
  * bindFunctionToTrace() executes the function returned by hapi instrumentation `withTraceContextFromRequestId()`

## [1.0.0] -- 2020-04-02

### Added
  * Typesafe `RumbleshipBeeline` that acts as its own factory, enabling tracking of fullly async service contexts
  * `@AddToTrace` decorator to bind function calls into the trace
### Changed
  * Updated tslint.json, tsconfig.json, plugins, etc to support nullish coalescing.
### Deprecated
  * `src/rfi-beeline.ts`: `RFIBeeline` and `HoneycombBeelineFactory` 

## [0.0.7] -- 2020-01-24

### Fixed
  * If the beeline isn't instrumented for Hapi, our subclasses `bindFuctionToTrace` also self-executes the wrapped bind.

## [0.0.6] -- 2020-01-23

### Added
  * `WithSpan` comes back

## [0.0.5] -- 2020-01-21

### Removed
  * `WithSpan` method decorator -- duplicative of what instrumentation already provides

## [0.0.4] -- 2020-01-20

### Added
  * Automatic context-population for ApolloErrorExtensions

## [0.0.3] -- 2020-01-20

### Added
  * Basic abstract class type, `Beeline` for typesafety
  * `WithSpan` method decorator
  * `reflect-metadata` dependency
### Fixed
  * Correctly wrap `resolve` context in async spans

## [0.0.2] -- 2020-01-20

### Added
  * Honeycomb middleware for TypeGraphql
### Changed 
  * package name is now `@rumbleship/o11y` for brevity

## [0.0.1] -- 2020-01-20

### Added
  * Initial release:
    * Factory
    * RFIBeeline subclass that has...
    * `withAsyncSpan` utility wrapper
### Security
