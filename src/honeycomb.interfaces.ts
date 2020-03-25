// Extracted from `beeline-nodejs/lib/schema.js`
export enum HoneycombSchema {
  EVENT_TYPE = 'meta.type',
  NODE_VERSION = 'meta.node_version',
  BEELINE_VERSION = 'meta.beeline_version',
  PACKAGE = 'meta.package',
  PACKAGE_VERSION = 'meta.package_version',
  INSTRUMENTATIONS = 'meta.instrumentations',
  INSTRUMENTATION_COUNT = 'meta.instrumentation_count',
  HOSTNAME = 'meta.local_hostname',
  DURATION_MS = 'duration_ms',
  TRACE_ID = 'trace.trace_id',
  TRACE_ID_SOURCE = 'trace.trace_id_source',
  TRACE_PARENT_ID = 'trace.parent_id',
  TRACE_SPAN_ID = 'trace.span_id',
  TRACE_SERVICE_NAME = 'service_name',
  TRACE_SPAN_NAME = 'name',
  TRACE_LINK_SPAN_ID = 'trace.link.span_id',
  TRACE_LINK_TRACE_ID = 'trace.link.trace_id',
  TRACE_LINK_META = 'meta.span_type'
}

export interface HoneycombSpan {
  id: string;
  customContext?: object;
  stack: HoneycombSpan[];
  dataset: string;
  traceId: string;
  parentSpanId?: string;
  startTime: number; // Date.now()
  startTimeHR: number[]; // process.hrtime()
  // [key of HoneycombSchema]: string;
  [HoneycombSchema.TRACE_ID]: string;
  [HoneycombSchema.TRACE_SPAN_ID]: string;
}

export enum HoneycombInstrumentations {
  'http' = 'http',
  'https' = 'https',
  'sequelize' = 'sequelize',
  'bluebird' = 'bluebird',
  'mysql2' = 'mysql2',
  '@hapi/hapi' = '@hapi/hapi'
}

export interface HoneycombConfiguration {
  impl: 'libhoney-event' | 'mock';
  writeKey: string;
  dataset: string;
  serviceName: string;
  enabledInstrumentations: Array<keyof HoneycombInstrumentations>; // string[];
  // [key in HoneycombInstrumentations]: any;
}
