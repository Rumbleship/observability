// tslint:disable-next-line: ban-types
export function withAsyncSpan(this: any, spanData: any, spanFn: Function): Promise<any> {
  return new Promise((resolve, reject) => {
    const value = (this as any).startAsyncSpan(spanData, (span: any) => {
      let innerValue;
      try {
        innerValue = spanFn(span);
      } catch (error) {
        // catch errors here and update the span
        this.addContext({
          error: `${error}`,
          'error.message': error.message,
          'error.stack': error.stack
        });

        // re-throw here so the calling function can
        // decide to do something about the error
        throw error;
      } finally {
        // If it's not a promise and the spanFn throws
        // this is our only chance to finish the span!
        if (!isPromise(innerValue)) {
          this.finishSpan(span);
        }
      }

      if (isPromise(innerValue)) {
        innerValue
          .catch((error: Error) => {
            // catch errors here and update the span
            this.addContext({
              error: `${error}`,
              'error.message': error.message,
              'error.stack': error.stack
            });
            throw error;
          })
          .finally(() => {
            this.finishSpan(span);
          });
      }

      return innerValue;
    });

    // Now that we have the return value we just forward it
    if (isPromise(value)) {
      value.then(resolve).catch(reject);
    } else {
      resolve(value);
    }
  });
}

function isPromise(p: any) {
  return p && typeof p.then === 'function';
}
