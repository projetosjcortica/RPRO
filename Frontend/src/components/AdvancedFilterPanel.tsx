import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { AdvancedFilters } from '../hooks/useAdvancedFilters';

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function AdvancedFilterPanel({ filters, onChange, onApply, onClear }: AdvancedFilterPanelProps) {
  const [productCodeInput, setProductCodeInput] = useState('');
  const [productNameInput, setProductNameInput] = useState('');
  const [formulaCodeInput, setFormulaCodeInput] = useState('');
  const [materiaLabels, setMateriaLabels] = useState<Record<number, string>>({});
  // loadingLabels is intentionally omitted from UI for now

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/materiaprima/labels');
        if (!res.ok) return;
        const js = await res.json();
        if (!mounted) return;
        // js is keyed by colKey like col6 -> { num, produto }
        const map: Record<number, string> = {};
        Object.entries(js).forEach(([colKey, info]: [string, any]) => {
          const match = colKey.match(/^col(\d+)$/);
          if (!match) return;
          const colIndex = Number(match[1]);
          const num = colIndex - 5;
          if (!Number.isNaN(num) && info && (info.produto || info.nome)) {
            map[num] = info.produto || info.nome || String(num);
          }
        });
        setMateriaLabels(map);
      } catch (e) {
        // ignore
      } finally {
        // no-op: loading state intentionally kept unused for now
        if (!mounted) return;
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const addProductCode = () => {
    const parts = productCodeInput.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    const nums = parts.map(p => Number(p)).filter(n => !Number.isNaN(n) && n >= 1 && n <= 40);
    if (!nums.length) { setProductCodeInput(''); return; }
    const next = { ...filters, includeProductCodes: Array.from(new Set([...filters.includeProductCodes, ...nums])) };
    onChange(next);
    setProductCodeInput('');
  };

  const removeProductCode = (code: number) => {
    const next = { ...filters, includeProductCodes: filters.includeProductCodes.filter(c => c !== code), excludeProductCodes: filters.excludeProductCodes.filter(c => c !== code) };
    onChange(next);
  };

  const removeIncludeProductCode = (code: number) => {
    const next = { ...filters, includeProductCodes: filters.includeProductCodes.filter(c => c !== code) };
    onChange(next);
  };

  const removeExcludeProductCode = (code: number) => {
    const next = { ...filters, excludeProductCodes: filters.excludeProductCodes.filter(c => c !== code) };
    onChange(next);
  };

  const addExcludeProductCode = () => {
    const parts = productCodeInput.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    const nums = parts.map(p => Number(p)).filter(n => !Number.isNaN(n) && n >= 1 && n <= 40);
    if (!nums.length) { setProductCodeInput(''); return; }
    const next = { ...filters, excludeProductCodes: Array.from(new Set([...filters.excludeProductCodes, ...nums])) };
    onChange(next);
    setProductCodeInput('');
  };

  const addProductName = () => {
    const v = productNameInput.trim();
    if (!v) return;
    const next = { ...filters, includeProductNames: Array.from(new Set([...filters.includeProductNames, v])) };
    onChange(next);
    setProductNameInput('');
  };

  const addExcludeProductName = () => {
    const v = productNameInput.trim();
    if (!v) return;
    const next = { ...filters, excludeProductNames: Array.from(new Set([...filters.excludeProductNames, v])) };
    onChange(next);
    setProductNameInput('');
  };

  const removeProductName = (name: string) => {
    const next = { ...filters, includeProductNames: filters.includeProductNames.filter(n => n !== name), excludeProductNames: filters.excludeProductNames.filter(n => n !== name) };
    onChange(next);
  };

  const removeIncludeProductName = (name: string) => {
    const next = { ...filters, includeProductNames: filters.includeProductNames.filter(n => n !== name) };
    onChange(next);
  };

  const removeExcludeProductName = (name: string) => {
    const next = { ...filters, excludeProductNames: filters.excludeProductNames.filter(n => n !== name) };
    onChange(next);
  };

  const removeIncludeFormula = (fnum: number) => {
    const next = { ...filters, includeFormulas: filters.includeFormulas.filter(f => f !== fnum) };
    onChange(next);
  };

  const removeExcludeFormula = (fnum: number) => {
    const next = { ...filters, excludeFormulas: filters.excludeFormulas.filter(f => f !== fnum) };
    onChange(next);
  };

  const toggleFixed = () => {
    onChange({ ...filters, isFixed: !filters.isFixed });
  };

  return (
    <aside style={{ width: 320, maxWidth: 360, height: '100%', overflowY: 'auto', background: 'var(--surface)', borderLeft: '1px solid var(--muted)', padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <strong>{filters.isFixed ? 'Filtros fixos' : 'Filtros (não fixos)'}</strong>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{`${filters.includeProductCodes.length + filters.excludeProductCodes.length} produtos configurados — ${filters.includeProductNames.length + filters.excludeProductNames.length} nomes`}</div>
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
                  <span>{materiaLabels[c] ? `${materiaLabels[c]} (${c})` : `Produto ${c}`}</span>
                  <button aria-label={`Remover ${c}`} onClick={() => removeIncludeProductCode(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.includeProductNames.map((n) => (
                <div key={`inc-n-${n}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#eef', border: '1px solid #dfe' }}>
                  <span>{n}</span>
                  <button aria-label={`Remover ${n}`} onClick={() => removeIncludeProductName(n)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.includeFormulas.map((f) => (
                <div key={`inc-f-${f}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#eef', border: '1px solid #dfe' }}>
                  <span>{`Formula ${f}`}</span>
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
                  <span>{materiaLabels[c] ? `${materiaLabels[c]} (${c})` : `Produto ${c}`}</span>
                  <button aria-label={`Remover ${c}`} onClick={() => removeExcludeProductCode(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.excludeProductNames.map((n) => (
                <div key={`exc-n-${n}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#fee', border: '1px solid #fed' }}>
                  <span>{n}</span>
                  <button aria-label={`Remover ${n}`} onClick={() => removeExcludeProductName(n)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {filters.excludeFormulas.map((f) => (
                <div key={`exc-f-${f}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: '#fee', border: '1px solid #fed' }}>
                  <span>{`Formula ${f}`}</span>
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
          <Input value={productCodeInput} onChange={(e: any) => setProductCodeInput(e.target.value)} placeholder="ex: 1,2,10" />
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
          <Input value={productNameInput} onChange={(e: any) => setProductNameInput(e.target.value)} placeholder="Adicionar nome" />
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
          <Input value={formulaCodeInput} onChange={(e: any) => setFormulaCodeInput(e.target.value)} placeholder="ex: 1,2" />
          <Button size="sm" onClick={() => {
            const nums = formulaCodeInput.split(/[,;\s]+/).map(s => Number(s)).filter(n => !Number.isNaN(n));
            if (!nums.length) { setFormulaCodeInput(''); return; }
            const next = { ...filters, includeFormulas: Array.from(new Set([...filters.includeFormulas, ...nums])) };
            onChange(next);
            setFormulaCodeInput('');
          }}>Incluir</Button>
          <Button size="sm" onClick={() => {
            const nums = formulaCodeInput.split(/[,;\s]+/).map(s => Number(s)).filter(n => !Number.isNaN(n));
            if (!nums.length) { setFormulaCodeInput(''); return; }
            const next = { ...filters, excludeFormulas: Array.from(new Set([...filters.excludeFormulas, ...nums])) };
            onChange(next);
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

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button onClick={onApply}>Aplicar agora</Button>
        <Button variant="secondary" onClick={onClear}>Limpar filtros</Button>
      </div>
    </aside>
  );
}
