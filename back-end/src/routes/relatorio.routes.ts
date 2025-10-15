import { Express } from 'express';
import { AppDataSource } from '../services/dbService';
import { Relatorio } from '../entities';
import { materiaPrimaService } from '../services/materiaPrimaService';

function normalizeDateParam(d: any): string | null {
  if (!d && d !== 0) return null;
  const s = String(d).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const parts = s.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }
  return null;
}

export function relatorioRoutes(app: Express): void {
  // GET /api/relatorio/paginate
  app.get('/api/relatorio/paginate', async (req, res) => {
    try {
      const pageRaw = req.query.page;
      const pageSizeRaw = req.query.pageSize;
      const allRaw = String(req.query.all || '').toLowerCase();
      const returnAll = allRaw === 'true' || allRaw === '1';
      const pageNum = (() => {
        const n = Number(pageRaw);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
      })();
      const pageSizeNum = (() => {
        const n = Number(pageSizeRaw);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 100;
      })();

      const codigoRaw = req.query.codigo ?? null;
      const numeroRaw = req.query.numero ?? null;
      const formulaRaw = req.query.formula ?? null;
      const dataInicio = req.query.dataInicio ?? null;
      const dataFim = req.query.dataFim ?? null;
      const normDataInicio = normalizeDateParam(dataInicio) || null;
      const normDataFim = normalizeDateParam(dataFim) || null;
      const sortBy = String(req.query.sortBy || 'Dia');
      const sortDir = String(req.query.sortDir || 'DESC');

      const repo = AppDataSource.getRepository(Relatorio);
      const qb = repo.createQueryBuilder('r');

      if (codigoRaw != null && String(codigoRaw) !== '') {
        const c = Number(codigoRaw);
        if (!Number.isNaN(c)) {
          qb.andWhere('r.Form1 = :c', { c });
        }
      }
      if (numeroRaw != null && String(numeroRaw) !== '') {
        const num = Number(numeroRaw);
        if (!Number.isNaN(num)) {
          qb.andWhere('r.Form2 = :num', { num });
        }
      }
      if (formulaRaw != null && String(formulaRaw) !== '') {
        const fNum = Number(String(formulaRaw));
        if (!Number.isNaN(fNum)) {
          qb.andWhere('r.Form1 = :fNum', { fNum });
        } else {
          const fStr = String(formulaRaw).toLowerCase();
          qb.andWhere('LOWER(r.Nome) LIKE :fStr', { fStr: `%${fStr}%` });
        }
      }
      if (normDataInicio) qb.andWhere('r.Dia >= :ds', { ds: normDataInicio });
      if (normDataFim) {
        const parts = normDataFim.split('-');
        let dePlus = normDataFim;
        try {
          const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          dt.setDate(dt.getDate() + 1);
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const d = String(dt.getDate()).padStart(2, '0');
          dePlus = `${y}-${m}-${d}`;
        } catch {
          dePlus = normDataFim;
        }
        qb.andWhere('r.Dia < :dePlus', { dePlus });
      }

      const allowed = new Set(['Dia', 'Hora', 'Nome', 'Form1', 'Form2']);
      const sb = allowed.has(sortBy) ? sortBy : 'Dia';
      const sd = sortDir === 'ASC' ? 'ASC' : 'DESC';
      qb.orderBy(`r.${sb}`, sd);

      const offset = (pageNum - 1) * pageSizeNum;
      const take = pageSizeNum;

      let rows: any[] = [];
      let total = 0;
      if (returnAll) {
        rows = await qb.getMany();
        total = rows.length;
      } else {
        [rows, total] = await qb.skip(offset).take(take).getManyAndCount();
      }

      const materias = await materiaPrimaService.getAll();
      const materiasByNum: Record<number, any> = {};
      for (const m of materias) {
        const n = typeof m.num === 'number' ? m.num : Number(m.num);
        if (!Number.isNaN(n)) materiasByNum[n] = m;
      }

      const mappedRows = rows.map((row: any) => {
        const values: number[] = [];
        for (let i = 1; i <= 40; i++) {
          const prodValue = row[`Prod_${i}`];
          let v = typeof prodValue === 'number' ? prodValue : prodValue != null ? Number(prodValue) : 0;
          const mp = materiasByNum[i];
          if (mp && typeof mp.medida === 'number' && mp.medida > 0) {
            v = v / mp.medida; // normalize grams to kg, for example
          }
          values.push(Number.isFinite(v) ? v : 0);
        }
        return {
          ...row,
          values,
        };
      });

      return res.json({
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        rows: mappedRows,
      });
    } catch (e: any) {
      console.error('[relatorio/paginate] error:', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });
}
