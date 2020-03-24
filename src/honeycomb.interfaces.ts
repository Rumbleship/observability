export interface HoneycombSpan {
  id: string;
  customContext?: object;
  stack: HoneycombSpan[];
  dataset: string;
  traceId: string;
  parentSpanId?: string;
  startTime: number; // Date.now()
  startTimeHR: number[]; // process.hrtime()
}

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
  TRACE_SPAN_NAME = 'name'
}
