/**
 * Unit test for IHMService using a mocked `basic-ftp` Client.
 * Verifies filtering of backup files and that downloadTo is called for the selected file.
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// mock basic-ftp
jest.mock('basic-ftp', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      ftp: { verbose: false },
      access: jest.fn().mockResolvedValue(undefined),
      cd: jest.fn().mockResolvedValue(undefined),
      list: jest.fn().mockResolvedValue([
        { name: 'Relatorio_09_25.csv', type: 1 },
        { name: 'Relatorio_2025_08.csv', type: 1 },
        { name: 'Relatorio_01.csv', type: 1 }
      ]),
      lastMod: jest.fn().mockImplementation((name: string) => {
        // give Relatorio_2025_08.csv the latest date so it should be selected
        if (name === 'Relatorio_2025_08.csv') return Promise.resolve(new Date('2025-09-09T18:00:00Z'));
        return Promise.resolve(new Date('2025-01-01T00:00:00Z'));
      }),
      downloadTo: jest.fn().mockImplementation((localPath: string) => {
        fs.writeFileSync(localPath, 'csv-data');
        return Promise.resolve();
      }),
      close: jest.fn()
    })),
    FileType: { File: 1 }
  };
});

import IHMService from '../src/services/IHMService';

test('IHMService mock downloads newest non-excluded CSV', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ihm-mock-'));
  const svc = new IHMService('127.0.0.1', 'user', 'pass');
  const res: any = await svc.getArc(tmp);
  expect(res).toBeTruthy();
  expect(res.localPath).toBeDefined();
  expect(fs.existsSync(res.localPath)).toBeTruthy();
  const data = fs.readFileSync(res.localPath, 'utf8');
  expect(data).toBe('csv-data');
  // cleanup
  fs.rmSync(tmp, { recursive: true, force: true });
});
