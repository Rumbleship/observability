# Changelog

All notable changes to this project will be documented in this file. Starting with v0.1.0.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added
  * Basic abstract class type, `Beeline` for typesafety
  * `WithSpan` method decorator
  * `reflect-metadata` dependency
### Removed
### Changed
### Fixed
  * Correctly wrap `resolve` context in async spans
### Deprecated
### Security


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
