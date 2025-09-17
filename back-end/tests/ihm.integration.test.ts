import * as fs from 'fs';
import * as path from 'path';
import IHMService from '../src/services/IHMService';

const runIntegration = false; // process.env.RUN_IHM_INTEGRATION === 'true';

(runIntegration ? test : test.skip)('IHM integration: connect and download latest CSV', async () => {
  const tmp = path.resolve('tmp');
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
  const host = '192.168.5.200';
  const user = process.env.IHM_USER || 'anonymous';
  const pass = process.env.IHM_PASS || '';
  const svc = new IHMService(host, user, pass);
  const res: any = await svc.getArc(tmp);
  expect(res).toBeTruthy();
  expect(res.localPath).toBeDefined();
});
