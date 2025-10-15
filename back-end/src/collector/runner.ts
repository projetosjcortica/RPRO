import { startCollector, stopCollector } from './index';
import { IHMService } from '../services/IHMService';
import { fileProcessorService } from '../services/fileProcessorService';

// Single-cycle runner used by services/collectorService
export async function runner(options: {
  ip: string;
  user: string;
  password: string;
  tmpDir: string;
}) {
  const ihm = new IHMService(options.ip, options.user, options.password);
  const downloaded = await ihm.findAndDownloadNewFiles(options.tmpDir);
  for (const f of downloaded) {
    try {
      await fileProcessorService.processFile(f.localPath);
    } catch (err) {
      console.error('[collector-runner] erro ao processar arquivo', f.name, err);
      // continue to next file
    }
  }
}

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
