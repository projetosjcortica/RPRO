import parserService from '../src/services/parserService';
import * as path from 'path';

test('parserService processes sample csv and exposes rows', async () => {
  const res: any = await parserService.processFile(path.resolve(__dirname, 'fixtures', 'sample.csv'));
  expect(res.rowsCount).toBeGreaterThan(0);
  expect(Array.isArray(res.rows)).toBe(true);
  expect(res.rows[0]).toHaveProperty('label');
});
