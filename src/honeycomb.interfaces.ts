export interface SamplerResponse {
  shouldSample: boolean;
  sampleRate?: number;
}
export type SamplerFn = (event: object) => SamplerResponse;

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
  samplerHook?: (event: HoneycombSpan) => SamplerResponse;
  enabledInstrumentations: Array<keyof HoneycombInstrumentations>; // string[];
  // [key in HoneycombInstrumentations]: any;
}

// tslint:disable-next-line: interface-name
export interface IAsyncTracker {
  tracked: Map<any, any>;

  setTracked: (value: HoneycombSpan) => void;
  getTracked: () => HoneycombSpan;
  deleteTracked: () => void;
  runWithoutTracking<T>(arg0: () => T): T;
  bindFunction<T>(arg0: () => T): T;
  // XXX(toshok) this feels wrong, but maybe not?
  callWithContext<T>(arg0: () => T, context: HoneycombSpan): T;
  // below is the portion of the async_hooks api we need.  they shouldn't be called directly
  // from user code.  They also aren't async safe - if any async code is added to them (like console.log)
  // we'll blow the stack.
  init(asyncId: number, type: string, triggerAsyncId: number, resource: object): void;
  destroy(asyncId: number): void;
}
