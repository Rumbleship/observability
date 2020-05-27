import { RumbleshipBeeline } from './rumbleship-beeline';
export function addGaeVersionDataToTrace(beelineCb: () => RumbleshipBeeline | undefined) {
  const beeline = beelineCb();
  beeline?.addTraceContext({
    'gae.env.GAE_APPLICATION': process.env.GAE_APPLICATION,
    'gae.env.GAE_DEPLOYMENT_ID': process.env.GAE_DEPLOYMENT_ID,
    'gae.env.GAE_ENV': process.env.GAE_ENV,
    'gae.env.GAE_INSTANCE': process.env.GAE_INSTANCE,
    'gae.env.GAE_MEMORY_MB': process.env.GAE_MEMORY_MB,
    'gae.env.GAE_RUNTIME': process.env.GAE_RUNTIME,
    'gae.env.GAE_SERVICE': process.env.GAE_SERVICE,
    'gae.env.GAE_VERSION': process.env.GAE_VERSION,
    'gae.env.GOOGLE_CLOUD_PROJECT': process.env.GOOGLE_CLOUD_PROJECT
  });
}
