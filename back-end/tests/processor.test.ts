import * as path from 'path';
import fileProcessor from '../src/services/fileProcessorService';
import { initDb, countRelatorioByFile } from '../src/services/dbService';

beforeAll(async () => {
  await initDb();
});

test('fileProcessor inserts relatorio rows from sample csv', async () => {
  const fixture = path.resolve(__dirname, 'fixtures', 'sample.csv');
  // cleanup any previous test runs
  await (await import('../src/services/dbService')).deleteRelatorioByFile(path.basename(fixture));
  const res: any = await fileProcessor.processFile(fixture as any);
  expect(res).toHaveProperty('processedPath');
  expect(res.rowsCount).toBeGreaterThan(0);
  const cnt = await countRelatorioByFile(path.basename(fixture));
  expect(cnt).toBe(res.rowsCount);
});
