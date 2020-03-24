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
export interface Tracker {
  setTracked(value: any): void;
  getTracked(): any;
  deleteTracked(): void;
  runWithoutTracking<T>(fn: () => T): T;
  bindFunction<T>(fn: () => T): T;
  callWithContext<T>(fn: () => T, context: any): T;

  // comment copied from underlying honeycomb tracker lib we're hijacking
  // -----
  // below is the portion of the async_hooks api we need.  they shouldn't be called directly
  // from user code.  They also aren't async safe - if any async code is added to them (like console.log)
  // we'll blow the stack.
  init(asyncId: any, type: any, triggerAsyncId: any, _resource: any): void;
  destroy(asyncId: any): void;
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
