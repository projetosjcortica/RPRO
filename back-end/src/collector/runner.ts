import { startCollector, stopCollector } from './index';

async function main() {
  console.log('[collector-runner] starting collector...');
  startCollector().catch((err) => {
    console.error('[collector-runner] collector error:', err);
    process.exit(1);
  });

  // Listen to parent messages to allow stopping
  if (typeof (process as any).on === 'function') {
    process.on('message', (m: any) => {
      if (m && m.type === 'stop') {
        console.log('[collector-runner] stop requested');
        stopCollector();
        setTimeout(() => process.exit(0), 1000);
      }
    });
  }
}

if (require.main === module) main();
