# Changelog

All notable changes to this project will be documented in this file. Starting with v0.1.0.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added
### Removed
### Changed
### Fixed
### Deprecated
### Security


## [4.0.2] -- 2020-07-31

### Changed
  * RumbleshipBeeline.initialize just warns if called > 1x instead of throwing
### Fixed
  * launch.json boilerplate for new debugger

## [4.0.1] -- 2020-06-22

### Fixed
  * Removed extra generic types on `runWithoutTrace()`
  * Bind `linkToSpan()` to the current trace
  * Starting a trace extracts context from the beeline stack

## [4.0.0] -- 2020-06-17

### Added
  * Trace management functions (`bindFunctionToTrace, runWithoutTrace, marshalTraceContext, unmarshalTraceContext, getTraceContext, traceActive`) all have `static` definitions that accept a `context_id` to bind to / manage. Instance methods continue unchanged, and inflecting the current `context_id` from the current instance.
### Changed
  * `@AddToTrace` defaults to using async-context-tree tracking from beeline's `async_tracker`; only if one isn't found does attempt to reset the context from top level `RumbleshipContext`

## [3.1.4] -- 2020-05-27

### Added
  * Add GAE ENV_VARs to trace context when starting a trace via this lib
  * Add helper to extract and set GAE ENV_VARs when starting a trace elsewhere (e.g. 'natively' from hapi instrumentation)

## [3.1.3] -- 2020-05-21

### Fixed
  * Anchored route regexes

## [3.1.2] -- 2020-05-21

### Fixed
  * Export all samplers/pipelines

## [3.1.1] -- 2020-05-21

### Removed
  * HealthCheckQuerySampler
### Changed
  * RouteSamplers only consider the root event of matching traces, and completely ignore any child events.

## [3.1.0] -- 2020-05-20

### Added
  * Samplers, defaults to stripping 99/100 events that match the health check `/_ah/health` or root `/` routes
  * starting a trace adds the GAE_VERSION to root span
### Changed
  * `withAsyncSpan` and `withSpan` use `addTraceContext()` instead of `addContext()` so errors propagate to children

## [3.0.1] -- 2020-04-30

### Added
  * Size counts as metadata whenever starting/finishing a trace
### Fixed
  * Nullish coalescing on HnyTracker
  * Clean up deletion of our manual context tracking

## [3.0.0] -- 2020-04-30

### Added
  * Enable RumbleshipContext-specific tracking by directly interfacing with native Honeycomb Tracker to enable
### Removed
  * Map of finishers + extra fn to use it, in favor just using HnyTracker directly
### Changed
  * Expose RumbleshipBeeline.FinishersByContextId
  * unmarshalTraceContext() accepts `string|undefined`; casts to `''` when passing to wrapped beeline
### Fixed
  * Typings on `bindFunctionToTrace()`

## [2.0.1] -- 2020-04-28

### Changed
  * Expose RumbleshipBeeline.FinishersByContextId
### Fixed
  * GQL Middleware now executes the bound function
  * Delete the finisher from map after it is invoked

## [2.0.0] -- 2020-04-22

### Fixed
  * **BREAKING (subtle) CHANGE** RumbleshipBeeline.bindFunctionToTrace(cb) no longer binds _and executes_ the callback. It only binds its, and returns for invoker to with as they please. 

## [1.1.3] -- 2020-04-20

### Changed
  * package.json engine supports node 12
  * circle builds on node12

## [1.1.2] -- 2020-04-16

### Changed
  * HoneycombMiddleware implemented as `MiddlewareFn` not `MiddlewareInterface` to preclude typedi issues

## [1.1.1] -- 2020-04-16

### Added
  * Expose `flush()` on our static RumbleshipBeeline
  * RumbleshipBeeline.shimFromInstrumentation() to pull fully Hapi-instrumented beeline back into context factory
### Fixed
  * HoneycombMiddleware uses the fully typed RumbleshipBeeline

## [1.1.0] -- 2020-04-15

### Changed
  * Better interop between Services, Relays and Resolvers for `@AddToTrace()`
  * Exposed `traceActive()`
  * When `@AddToTrace()`, if there is no active trace, return the unwrapped original implementation
### Fixed
  * bindFunctionToTrace() executes the function returned by hapi instrumentation `withTraceContextFromRequestId()`

## [1.0.0] -- 2020-04-02
jq
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
