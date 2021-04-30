# Observability

Observability library provided for example/use with [Rumbleship GQL Framework](https://github.com/rumbleship/rfi-gql-framework/) to ship spans to [Honeycomb](https://www.honeycomb.io).

NB: this relies heavily on [Rumbleship's fork](https://github.com/Rumbleship/beeline-nodejs) of the [Honeycomb provided beeline](https://github.com/honeycombio/beeline-nodejs), which adds injected instrumentation for the Hapi webserver that Rumbleship's framework runs on top of. Rumbleship's fork is out of date with current head of the Honeycomb code.