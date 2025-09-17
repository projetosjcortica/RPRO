import * as path from 'path';
import parserService from '../src/services/parserService';

test('parserService processes sample csv', async () => {
  const fixture = path.resolve(__dirname, 'fixtures', 'sample.csv');
  const out: any = await parserService.processFile(fixture as any);
  expect(out).toHaveProperty('processedPath');
  expect(out.rowsCount).toBe(24);
});
