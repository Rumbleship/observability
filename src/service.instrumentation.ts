import { HoneycombSpan } from './honeycomb.interfaces';
import { RumbleshipBeeline } from './rumbleship-beeline';
export class RFIServiceBeeline extends RumbleshipBeeline {
  private static ServiceRequestMap = new Map<string, HoneycombSpan>();
  private static Finishers = new Map<string, () => void>();
  startTraceForServiceContext(
    service_context_id: string,
    metadataContext: object,
    traceId?: string,
    parentSpanId?: string,
    dataset?: string
  ): HoneycombSpan {
    const trace = this.startTrace(metadataContext, traceId, parentSpanId, dataset);
    // maybe this shouldn't be underlying api, but I need to untangle the overriden `RumbleshipBeeline.bindFunctionToTrace()`
    // and how it interfaces with the Hapi instrumentation
    const boundFinisher = this.api.bindFunctionToTrace(() => {
      this.finishTrace(trace);
    });
    RFIServiceBeeline.Finishers.set(service_context_id, boundFinisher);
    RFIServiceBeeline.ServiceRequestMap.set(service_context_id, this.tracker?.getTracked());
    return trace;
  }

  finishTraceForServiceContext(service_context_id: string) {
    const finisher = RFIServiceBeeline.Finishers.get(service_context_id);
    if (finisher) {
      finisher();
    }
  }
}
