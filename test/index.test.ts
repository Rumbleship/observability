test('stub', () => {
  expect(true).toBe(true);
});
// import { HoneycombBeelineFactory, RFIBeeline } from './../src/rfi-beeline';
// import { WithSpan } from '../src';
// interface IContext {
//   rfiBeeline: RFIBeeline;
//   trace: any;
// }
// class Class {
//   @WithSpan()
//   async asyncWrapped(context: IContext, ...args: any[]): Promise<boolean> {
//     return true;
//   }

//   @WithSpan()
//   wrapped(context: IContext, ...args: any[]): boolean {
//     return true;
//   }
// }
// describe('Given a beeline', () => {
//   let context: IContext;
//   beforeEach(() => {
//     const rfiBeeline = new HoneycombBeelineFactory({
//       writeKey: 'foua',
//       dataset: 'test',
//       serviceName: 'test'
//     }).make(Math.random().toString());
//     const trace = rfiBeeline.startTrace({ name: 'test', dataset: 'something' });
//     context = { rfiBeeline, trace };
//   });

//   afterEach(() => {
//     context.rfiBeeline.finishTrace(context.trace);
//   });

//   describe('Given a class with wrapped method', () => {
//     test('Then: the method return type doesnt change', async done => {
//       const c = new Class();
//       // tslint:disable-next-line: no-floating-promises
//       expect(c.asyncWrapped(context) instanceof Promise).toBe(true);
//       expect(await c.asyncWrapped(context)).toBe(true);
//       done();
//     });
//     // test('Then: the method return type doesnt change', () => {
//     //   const c = new Class();
//     //   // tslint:disable-next-line: no-floating-promises
//     //   expect(c.asyncWrapped(context)).toBe(true);
//     // });
//   });
// });
