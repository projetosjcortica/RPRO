import fs from 'fs';
import path from 'path';
import { BaseService } from '../core/baseService';
import { ProcessPayload, hashBufferHex } from '../core/utils';
import { backupSvc } from './backupService';
import { parserService } from './parserService';
import { dbService } from './dbService';
import { cacheService } from './CacheService';

class Subject<T> {
  private observers: Array<{ update(payload: T): Promise<void> }> = [];
  attach(o: { update(payload: T): Promise<void> }) { if (!this.observers.includes(o)) this.observers.push(o); }
  detach(o: { update(payload: T): Promise<void> }) { this.observers = this.observers.filter((x) => x !== o); }
  async notify(payload: T) { for (const o of this.observers) await o.update(payload); }
}

export class FileProcessorService extends BaseService {
  private subject = new Subject<ProcessPayload>();
  constructor() { super('FileProcessorService'); }
  addObserver(o: { update(payload: ProcessPayload): Promise<void> | void }) {
    this.subject.attach({ update: async (p: ProcessPayload) => { await Promise.resolve(o.update(p)); } });
  }
  async processFile(fullPath: string) {
    const st = fs.statSync(fullPath);
    const originalName = path.basename(fullPath);
    const buffer = fs.readFileSync(fullPath);
    const hash = hashBufferHex(buffer);

    const cacheRec = await cacheService.getByName(originalName);
    const lastTs = cacheRec?.lastRowTimestamp || (await dbService.getLastRelatorioTimestamp(originalName));

    if (cacheRec && cacheRec.lastHash === hash && cacheRec.lastSize === st.size) {
      return { meta: { originalName, size: st.size, hash }, parsed: { rowsCount: 0, rows: [] } };
    }

    const meta = await backupSvc.backupFile({ originalname: originalName, path: fullPath, size: st.size });
    const parsed = await parserService.processFile(fullPath, lastTs ? { sinceTs: lastTs } : undefined);
    const newRows = parsed.rows;

    if (newRows.length > 0) {
      const fileTag = originalName;
      const mappedRows = newRows.map((r: any) => ({
        Dia: r.datetime.substring(0, 10),
        Hora: r.datetime.substring(11, 19),
        Nome: r.label ?? null,
        Form1: r.form1 ?? null,
        Form2: r.form2 ?? null,
        values: r.values,
      }));
      await dbService.insertRelatorioRows(mappedRows, fileTag);
      const lastRow = newRows[newRows.length - 1];
      await cacheService.upsert({
        originalName,
        lastHash: hash,
        lastSize: st.size,
        lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
        lastRowDia: lastRow ? lastRow.datetime.substring(0, 10) : cacheRec?.lastRowDia || null,
        lastRowHora: lastRow ? lastRow.datetime.substring(11, 19) : cacheRec?.lastRowHora || null,
        lastRowTimestamp: lastRow ? lastRow.datetime : cacheRec?.lastRowTimestamp || null,
        lastRowCount: (cacheRec?.lastRowCount || 0) + newRows.length,
        lastProcessedAt: new Date().toISOString(),
        ingestedRows: (cacheRec?.ingestedRows || 0) + newRows.length,
      });
    } else {
      await cacheService.upsert({ originalName, lastHash: hash, lastSize: st.size, lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null, lastProcessedAt: new Date().toISOString() });
    }

    await this.subject.notify({ filename: originalName, lastProcessedAt: new Date().toISOString(), rowCount: newRows.length });
    return { meta, parsed: { processedPath: parsed.processedPath, rowsCount: newRows.length, rows: newRows } };
  }
}

export const fileProcessorService = new FileProcessorService();
