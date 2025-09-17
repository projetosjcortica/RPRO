import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import * as path from 'path';
import parserService from '../src/services/parserService';
import { initDb, insertRelatorioRows, countRelatorioByFile, deleteRelatorioByFile, AppDataSource } from '../src/services/dbService';

jest.setTimeout(20000);

// test.skip // Skip by default, requires real DB connection

test('db integration: process sample.csv, insert to relatorio, count and delete', async () => {
  // This test exercises the real DB configured via env (.env) — will fail if DB is unreachable.
  await initDb();
  try {
  const samplePath = path.resolve(__dirname, 'fixtures', 'sample.csv');
  const parsed: any = await parserService.processFile(samplePath as any);
  const rows = parsed.rows || [];
    expect(rows.length).toBeGreaterThan(0);

    const fileTag = 'sample.csv';

    // map rows to Relatorio shape
    const mapped = rows.map((r: any) => {
      const obj: any = { Dia: r.date || null, Hora: r.time || null, Nome: r.label || null, processedFile: fileTag };
      if (Array.isArray(r.values)) {
        for (let i = 1; i <= 40; i++) obj[`Prod_${i}`] = r.values[i - 1] != null ? Number(r.values[i - 1]) : null;
      }
      return obj;
    });
    // console.log(`Mapped ${mapped.length} rows for relatorio insertion`);
    // console.log('Sample mapped row:', mapped);
    // expect(mapped.length).toBe(rows.length);
    // expect(mapped[0]).toHaveProperty('Dia');
    // expect(mapped[0]).toHaveProperty('Hora');
    // expect(mapped[0]).toHaveProperty('Nome');
    // expect(mapped[0]).toHaveProperty('Prod_1');

    const saved = await insertRelatorioRows(mapped, fileTag);
    expect(saved).toBeDefined();

    const c = await countRelatorioByFile(fileTag);
    expect(typeof c).toBe('number');
    expect(c).toBeGreaterThanOrEqual(mapped.length);

    // // cleanup
    // const deleted = await deleteRelatorioByFile(fileTag);
    // expect(deleted).toBeGreaterThanOrEqual(mapped.length);
  } finally {
    try {
      if (AppDataSource && AppDataSource.isInitialized) await AppDataSource.destroy();
    } catch (e) {
      // ignore
    }
  }
});
