import { useEffect, useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { AdvancedFilters } from '../hooks/useAdvancedFilters';

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  onApply: () => void;
  onClear: () => void;
  colLabels?: { [key: string]: string };
}

export default function AdvancedFilterPanel({ filters, onChange, colLabels }: AdvancedFilterPanelProps) {
  const [productCodeInput, setProductCodeInput] = useState('');
  const [productNameInput, setProductNameInput] = useState('');
  const [formulaCodeInput, setFormulaCodeInput] = useState('');
  const [materiaLabels, setMateriaLabels] = useState<Record<number, string>>({});
  const [formulaLabels, setFormulaLabels] = useState<Record<string, string>>({});
  // loadingLabels is intentionally omitted from UI for now

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Load formula labels
        try {
          const fRes = await fetch('http://localhost:3000/api/formulas/labels');
          if (fRes.ok) {
            const fJs = await fRes.json();
            if (mounted) setFormulaLabels(fJs);
          }
        } catch (err) {
          console.warn('[AdvancedFilterPanel] failed to load formula labels', err);
        }

        // Load materia labels
        const res = await fetch('http://localhost:3000/api/materiaprima/labels');
        if (!res.ok) return;
        const js = await res.json();
        if (!mounted) return;
        // js is keyed by colKey like col6 -> { num, produto }
        const map: Record<number, string> = {};
        Object.entries(js).forEach(([colKey, info]: [string, unknown]) => {
          const infoObj = info as { produto?: string; nome?: string } | undefined;
          const match = colKey.match(/^col(\d+)$/);
          if (!match) return;
          const colIndex = Number(match[1]);
          const num = colIndex - 5;
          if (!Number.isNaN(num) && infoObj && (infoObj.produto || infoObj.nome)) {
            map[num] = infoObj.produto || infoObj.nome || String(num);
          }
        });
        setMateriaLabels(map);
      } catch (err) {
        console.warn('[AdvancedFilterPanel] failed to load materia labels', err);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const onChangeWithEvent = useCallback((nextFilters: AdvancedFilters) => {
    onChange(nextFilters);
    try { window.dispatchEvent(new CustomEvent('advancedFiltersChanged', { detail: nextFilters })); } catch (err) { console.warn('[AdvancedFilterPanel] failed to dispatch advancedFiltersChanged', err); }
    // Persist to localStorage and notify other listeners so side-info updates immediately
    try {
      localStorage.setItem('cortez:advancedFilters:products', JSON.stringify(nextFilters));
      try { window.dispatchEvent(new CustomEvent('advancedFiltersStorageUpdated', { detail: nextFilters })); } catch (err) { console.warn('[AdvancedFilterPanel] failed to dispatch advancedFiltersStorageUpdated', err); }
    } catch (err) {
      console.warn('[AdvancedFilterPanel] failed to persist advanced filters to localStorage', err);
    }
  }, [onChange]);

  const truncate = (s: string, n = 32) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s);

  const getProductLabel = (c: number) => {
    const label = colLabels && colLabels[`col${c+5}`] ? `${colLabels[`col${c+5}`]} (${c})` : (materiaLabels[c] ? `${materiaLabels[c]} (${c})` : `Produto ${c}`);
    return label;
  };

  const addProductCode = () => {
    const parts = productCodeInput.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    const nums = parts.map(p => Number(p)).filter(n => !Number.isNaN(n) && n >= 1 && n <= 40);
    if (!nums.length) { setProductCodeInput(''); return; }
    const next = { ...filters, includeProductCodes: Array.from(new Set([...filters.includeProductCodes, ...nums])) };
    onChangeWithEvent(next);
    setProductCodeInput('');
  };

  const removeProductCode = (code: number) => {
    const next = { ...filters, includeProductCodes: filters.includeProductCodes.filter(c => c !== code), excludeProductCodes: filters.excludeProductCodes.filter(c => c !== code) };
    onChangeWithEvent(next);
  };

  const removeIncludeProductCode = (code: number) => {
    const next = { ...filters, includeProductCodes: filters.includeProductCodes.filter(c => c !== code) };
    onChangeWithEvent(next);
  };

  const removeExcludeProductCode = (code: number) => {
    const next = { ...filters, excludeProductCodes: filters.excludeProductCodes.filter(c => c !== code) };
    onChangeWithEvent(next);
  };

  const addExcludeProductCode = () => {
    const parts = productCodeInput.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    const nums = parts.map(p => Number(p)).filter(n => !Number.isNaN(n) && n >= 1 && n <= 40);
    if (!nums.length) { setProductCodeInput(''); return; }
    const next = { ...filters, excludeProductCodes: Array.from(new Set([...filters.excludeProductCodes, ...nums])) };
    onChangeWithEvent(next);
    setProductCodeInput('');
  };

  const addProductName = () => {
    const v = productNameInput.trim();
    if (!v) return;
    const next = { ...filters, includeProductNames: Array.from(new Set([...filters.includeProductNames, v])) };
    onChangeWithEvent(next);
    setProductNameInput('');
  };

  const addExcludeProductName = () => {
    const v = productNameInput.trim();
    if (!v) return;
    const next = { ...filters, excludeProductNames: Array.from(new Set([...filters.excludeProductNames, v])) };
    onChangeWithEvent(next);
    setProductNameInput('');
  };

  const removeProductName = (name: string) => {
    const next = { ...filters, includeProductNames: filters.includeProductNames.filter(n => n !== name), excludeProductNames: filters.excludeProductNames.filter(n => n !== name) };
    onChangeWithEvent(next);
  };

  const removeIncludeProductName = (name: string) => {
    const next = { ...filters, includeProductNames: filters.includeProductNames.filter(n => n !== name) };
    onChangeWithEvent(next);
  };

  const removeExcludeProductName = (name: string) => {
    const next = { ...filters, excludeProductNames: filters.excludeProductNames.filter(n => n !== name) };
    onChangeWithEvent(next);
  };

  const removeIncludeFormula = (fnum: number) => {
    const next = { ...filters, includeFormulas: filters.includeFormulas.filter(f => f !== fnum) };
    onChangeWithEvent(next);
  };

  const removeExcludeFormula = (fnum: number) => {
    const next = { ...filters, excludeFormulas: filters.excludeFormulas.filter(f => f !== fnum) };
    onChangeWithEvent(next);
  };

  const toggleFixed = () => {
    onChangeWithEvent({ ...filters, isFixed: !filters.isFixed });
  };

  const formatFormulaName = (code: number) => {
    const name = formulaLabels[String(code)];
    return name ? `${code} — ${name}` : `Formula ${code}`;
  };

  return (
    <aside style={{ width: 320, maxWidth: 360, marginBottom: 10, background: 'var(--surface)', borderLeft: '1px solid var(--muted)' }}>
      <div style={{ marginBottom: 12 }}>
        <strong>{filters.isFixed ? 'Filtros avançados' : 'Filtros avançados'}</strong>
        <div style={{ fontSize: 12, color: "black" }}>{`${filters.includeProductCodes.length + filters.excludeProductCodes.length} produtos configurados — ${filters.includeProductNames.length + filters.excludeProductNames.length} nomes`}</div>
      </div>

      {/* Visualização dos filtros aplicados vs excluídos */}
      <section style={{ marginBottom: 12, padding: 8, borderRadius: 6, background: '#fafafa', border: '1px solid rgba(0,0,0,0.04)' }}>
        <Label>Filtros aplicados</Label>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Incluir</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {filters.includeProductCodes.map((c) => (
                <div key={`inc-p-${c}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#eef', border: '1px solid #dfe' }}>
                  <span title={getProductLabel(c)}>{truncate(getProductLabel(c), 32)}</span>
                  <button aria-label={`Remover ${c}`} onClick={() => removeIncludeProductCode(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.includeProductNames.map((n) => (
                <div key={`inc-n-${n}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#eef', border: '1px solid #dfe' }}>
                  <span title={String(n)}>{truncate(String(n), 32)}</span>
                  <button aria-label={`Remover ${n}`} onClick={() => removeIncludeProductName(n)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.includeFormulas.map((f) => (
                <div key={`inc-f-${f}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#eef', border: '1px solid #dfe' }}>
                  <span title={formatFormulaName(f)}>{truncate(formatFormulaName(f), 32)}</span>
                  <button aria-label={`Remover formula ${f}`} onClick={() => removeIncludeFormula(f)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Excluir</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {filters.excludeProductCodes.map((c) => (
                <div key={`exc-p-${c}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#fee', border: '1px solid #fed' }}>
                  <span title={getProductLabel(c)}>{truncate(getProductLabel(c), 32)}</span>
                  <button aria-label={`Remover ${c}`} onClick={() => removeExcludeProductCode(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.excludeProductNames.map((n) => (
                <div key={`exc-n-${n}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#fee', border: '1px solid #fed' }}>
                  <span title={String(n)}>{truncate(String(n), 32)}</span>
                  <button aria-label={`Remover ${n}`} onClick={() => removeExcludeProductName(n)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.excludeFormulas.map((f) => (
                <div key={`exc-f-${f}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#fee', border: '1px solid #fed' }}>
                  <span title={formatFormulaName(f)}>{truncate(formatFormulaName(f), 32)}</span>
                  <button aria-label={`Remover formula ${f}`} onClick={() => removeExcludeFormula(f)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <Label> Códigos de Produto (1-40) </Label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Input value={productCodeInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductCodeInput(e.target.value)} placeholder="ex: 1,2,10" />
          <Button size="sm" onClick={addProductCode}>Incluir</Button>
          <Button size="sm" onClick={addExcludeProductCode}>Excluir</Button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.includeProductCodes.map(c => (
            <button key={`inc-p-${c}`} onClick={() => removeProductCode(c)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--muted)', background: '#eef' }}>{`+ ${c}`}</button>
          ))}
          {filters.excludeProductCodes.map(c => (
            <button key={`exc-p-${c}`} onClick={() => removeProductCode(c)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--muted)', background: '#fee' }}>{`- ${c}`}</button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <Label> Nomes de Produto </Label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Input value={productNameInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductNameInput(e.target.value)} placeholder="Adicionar nome" />
          <Button size="sm" onClick={addProductName}>Incluir</Button>
          <Button size="sm" onClick={addExcludeProductName}>Excluir</Button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.includeProductNames.map(n => (
            <button key={`inc-n-${n}`} onClick={() => removeProductName(n)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--muted)', background: '#eef' }}>{n}</button>
          ))}
          {filters.excludeProductNames.map(n => (
            <button key={`exc-n-${n}`} onClick={() => removeProductName(n)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--muted)', background: '#fee' }}>{n}</button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <Label> Códigos de Fórmula </Label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Input value={formulaCodeInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormulaCodeInput(e.target.value)} placeholder="ex: 1,2" />
          <Button size="sm" onClick={() => {
            const nums = formulaCodeInput.split(/[,;\s]+/).map(s => Number(s)).filter(n => !Number.isNaN(n));
            if (!nums.length) { setFormulaCodeInput(''); return; }
            const next = { ...filters, includeFormulas: Array.from(new Set([...filters.includeFormulas, ...nums])) };
            onChangeWithEvent(next);
            setFormulaCodeInput('');
          }}>Incluir</Button>
          <Button size="sm" onClick={() => {
            const nums = formulaCodeInput.split(/[,;\s]+/).map(s => Number(s)).filter(n => !Number.isNaN(n));
            if (!nums.length) { setFormulaCodeInput(''); return; }
            const next = { ...filters, excludeFormulas: Array.from(new Set([...filters.excludeFormulas, ...nums])) };
            onChangeWithEvent(next);
            setFormulaCodeInput('');
          }}>Excluir</Button>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={filters.isFixed} onChange={toggleFixed} />
          <span>Fixar filtros (aplicar em todas as buscas)</span>
        </label>
      </div>

      {/* <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button onClick={onApply}>Aplicar agora</Button>
        <Button variant="secondary" onClick={onClear}>Limpar filtros</Button>
      </div> */}
    </aside>
  );
}
