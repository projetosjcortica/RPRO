import fs from "fs";
import path from "path";
import { BaseService } from "../core/baseService";
import { ProcessPayload, hashBufferHex } from "../core/utils";
import { backupSvc } from "./backupService";
import { parserService } from "./parserService";
import { dbService } from "./dbService";
import { cacheService } from "./cacheService";

class Subject<T> {
  private observers: Array<{ update(payload: T): Promise<void> }> = [];
  attach(o: { update(payload: T): Promise<void> }) {
    if (!this.observers.includes(o)) this.observers.push(o);
  }
  detach(o: { update(payload: T): Promise<void> }) {
    this.observers = this.observers.filter((x) => x !== o);
  }
  async notify(payload: T) {
    for (const o of this.observers) await o.update(payload);
  }
}

export class FileProcessorService extends BaseService {
  private subject = new Subject<ProcessPayload>();
  constructor() {
    super("FileProcessorService");
  }
  addObserver(o: { update(payload: ProcessPayload): Promise<void> | void }) {
    this.subject.attach({
      update: async (p: ProcessPayload) => {
        await Promise.resolve(o.update(p));
      },
    });
  }
  async processFile(fullPath: string) {
    const st = fs.statSync(fullPath);
    const originalName = path.basename(fullPath);
    const buffer = fs.readFileSync(fullPath);
    const hash = hashBufferHex(buffer);

    const cacheRec = await cacheService.getByName(originalName);
    // Determine sinceTs: prefer cache's lastRowTimestamp, otherwise query DB.
    // Normalize to full ISO-like timestamp 'YYYY-MM-DDTHH:MM:SS' so parser can compare properly.
    let lastTs = cacheRec?.lastRowTimestamp || (await dbService.getLastRelatorioTimestamp(originalName));
    if (lastTs) {
      // Some older code saved as 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DDT HH:MM:SS', normalize to 'YYYY-MM-DDTHH:MM:SS'
      lastTs = String(lastTs).replace(/\s+/, 'T').replace(/T\s+/, 'T');
    }

    if (
      cacheRec &&
      cacheRec.lastHash === hash &&
      cacheRec.lastSize === st.size
    ) {
      return {
        meta: { originalName, size: st.size, hash },
        parsed: { rowsCount: 0, rows: [] },
      };
    }

    const meta = await backupSvc.backupFile({
      originalname: originalName,
      path: fullPath,
      size: st.size,
    });
    const parsed = await parserService.processFile(
      fullPath,
      lastTs ? { sinceTs: lastTs } : undefined
    );
    const newRows = parsed.rows;

    if (newRows.length > 0) {
      const fileTag = originalName;
      const mappedRows = newRows.map((r: any) => {
        const sanitizedNome = r.label
          ? r.label.normalize("NFC").replace(/[\x00-\x1F\x7F-\x9F]/g, "")
          : "Desconhecido"; // Default to 'Desconhecido' if Nome is null or empty
        return {
          Dia: r.date ?? null, // Use separate date field
          Hora: r.time ?? null, // Use separate time field
          Nome: sanitizedNome, // Use sanitized or default name
          Form1: r.form1 ?? null,
          Form2: r.form2 ?? null,
          Prod_1: r.values[0] ?? 0,
          Prod_2: r.values[1] ?? 0,
          Prod_3: r.values[2] ?? 0,
          Prod_4: r.values[3] ?? 0,
          Prod_5: r.values[4] ?? 0,
          Prod_6: r.values[5] ?? 0,
          Prod_7: r.values[6] ?? 0,
          Prod_8: r.values[7] ?? 0,
          Prod_9: r.values[8] ?? 0,
          Prod_10: r.values[9] ?? 0,
          Prod_11: r.values[10] ?? 0,
          Prod_12: r.values[11] ?? 0,
          Prod_13: r.values[12] ?? 0,
          Prod_14: r.values[13] ?? 0,
          Prod_15: r.values[14] ?? 0,
          Prod_16: r.values[15] ?? 0,
          Prod_17: r.values[16] ?? 0,
          Prod_18: r.values[17] ?? 0,
          Prod_19: r.values[18] ?? 0,
          Prod_20: r.values[19] ?? 0,
          Prod_21: r.values[20] ?? 0,
          Prod_22: r.values[21] ?? 0,
          Prod_23: r.values[22] ?? 0,
          Prod_24: r.values[23] ?? 0,
          Prod_25: r.values[24] ?? 0,
          Prod_26: r.values[25] ?? 0,
          Prod_27: r.values[26] ?? 0,
          Prod_28: r.values[27] ?? 0,
          Prod_29: r.values[28] ?? 0,
          Prod_30: r.values[29] ?? 0,
          Prod_31: r.values[30] ?? 0,
          Prod_32: r.values[31] ?? 0,
          Prod_33: r.values[32] ?? 0,
          Prod_34: r.values[33] ?? 0,
          Prod_35: r.values[34] ?? 0,
          Prod_36: r.values[35] ?? 0,
          Prod_37: r.values[36] ?? 0,
          Prod_38: r.values[37] ?? 0,
          Prod_39: r.values[38] ?? 0,
          Prod_40: r.values[39] ?? 0,
          processedFile: fileTag,
        };
      });
      try {
        await dbService.insertRelatorioRows(mappedRows, fileTag);
      } catch (err) {
        console.error('Failed to insert relatorio rows into DB:', err);
        try {
          const errDir = path.join(path.dirname(fullPath), 'errors');
          if (!fs.existsSync(errDir)) fs.mkdirSync(errDir, { recursive: true });
          const errPath = path.join(errDir, path.basename(fullPath) + '.error.json');
          const dump = {
            error: String(err),
            file: originalName,
            sampleRows: mappedRows.slice(0, 20),
          };
          fs.writeFileSync(errPath, JSON.stringify(dump, null, 2), 'utf8');
          console.log(`Wrote error dump to: ${errPath}`);
        } catch (fsErr) {
          console.error('Failed to write error dump:', fsErr);
        }
        // Rethrow so higher-level caller is aware, or optionally continue
        throw err;
      }
      const lastRow = newRows[newRows.length - 1];
      const lastRowTimestamp = lastRow && lastRow.date && lastRow.time
        ? `${lastRow.date}T${lastRow.time}`
        : cacheRec?.lastRowTimestamp || null;
      await cacheService.upsert({
        originalName,
        lastHash: hash,
        lastSize: st.size,
        lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
        lastRowDia: lastRow ? lastRow.date : cacheRec?.lastRowDia || null,
        lastRowHora: lastRow ? lastRow.time : cacheRec?.lastRowHora || null,
        lastRowTimestamp: lastRowTimestamp,
        lastRowCount: (cacheRec?.lastRowCount || 0) + newRows.length,
        lastProcessedAt: new Date().toISOString(),
        ingestedRows: (cacheRec?.ingestedRows || 0) + newRows.length,
      });
    } else {
      await cacheService.upsert({
        originalName,
        lastHash: hash,
        lastSize: st.size,
        lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
        lastProcessedAt: new Date().toISOString(),
      });
    }

    await this.subject.notify({
      filename: originalName,
      lastProcessedAt: new Date().toISOString(),
      rowCount: newRows.length,
    });
    return {
      meta,
      parsed: {
        processedPath: parsed.processedPath,
        rowsCount: newRows.length,
        rows: newRows,
      },
    };
  }
}

export const fileProcessorService = new FileProcessorService();
