import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import AdvancedFilterPanel from './components/AdvancedFilterPanel';
import useAdvancedFilters from './hooks/useAdvancedFilters';
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Eye, EyeOff, Calculator } from "lucide-react";

interface ProductsProps {
  colLabels: { [key: string]: string };
  setColLabels: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onLabelChange: (colKey: string, newName: string, unidade?: string) => void;
}

function Products({ colLabels, setColLabels, onLabelChange }: ProductsProps) {
  const [savingProduct, setSavingProduct] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<{ [key: string]: string }>({});
  const [produtosAtivos, setProdutosAtivos] = useState<{ [key: string]: boolean }>({});
  const [produtosIgnorarCalculos, setProdutosIgnorarCalculos] = useState<{ [key: string]: boolean }>({});
  const [togglingProduct, setTogglingProduct] = useState<string | null>(null);
  // const [resettingAll, setResettingAll] = useState(false);
  // const [resettingUnits, setResettingUnits] = useState(false);

  // Constantes
  const START_COL = 6;
  const END_COL = 45;

  // Inicializa produtosInfo no localStorage
  const initializeProdutosInfo = () => {
    if (typeof window === "undefined") return;
    
    const existing = localStorage.getItem("produtosInfo");
    if (!existing) {
      const initialInfo: { [key: string]: { nome: string; unidade: string } } = {};
      for (let i = START_COL; i <= END_COL; i++) {
        const key = `col${i}`;
        initialInfo[key] = {
          nome: `Produto ${i - 5}`,
          unidade: "kg",
        };
      }
      localStorage.setItem("produtosInfo", JSON.stringify(initialInfo));
    }
  };

  // Carrega dados do localStorage
  const loadFromStorage = () => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("produtosInfo");
    let parsed: { [key: string]: { nome: string; unidade: string } } = {};
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object' && !Array.isArray(p)) parsed = p as any;
        else parsed = {};
      } catch (e) {
        console.warn('[products] produtosInfo parse failed, resetting to {}', e);
        parsed = {};
      }
    }

    const labels: { [key: string]: string } = {};
    const unidadesObj: { [key: string]: string } = {};

    for (let i = START_COL; i <= END_COL; i++) {
      const key = `col${i}`;
      const entry = parsed[key];
      labels[key] = entry && entry.nome ? entry.nome : `Produto ${i - 5}`;
      unidadesObj[key] = entry && entry.unidade ? entry.unidade : "kg";
    }

    setColLabels(labels);
    setUnidades(unidadesObj);
  };

  // Carrega status ativo/inativo do backend
  const loadProdutosAtivos = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/materiaprima/labels");
      const data = await response.json();
      
      const ativosObj: { [key: string]: boolean } = {};
      const ignorarCalculosObj: { [key: string]: boolean } = {};
      Object.entries(data).forEach(([colKey, info]: [string, any]) => {
        ativosObj[colKey] = info.ativo ?? true;
        ignorarCalculosObj[colKey] = info.ignorarCalculos ?? false;
      });
      
      setProdutosAtivos(ativosObj);
      setProdutosIgnorarCalculos(ignorarCalculosObj);
    } catch (e) {
      console.error('[products] Erro ao carregar status dos produtos:', e);
    }
  };
  
  // Atualiza localStorage
  const updateProdutoInfo = (colKey: string, nome: string, unidade: string) => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("produtosInfo");
    let parsed: { [key: string]: { nome: string; unidade: string } } = {};
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object' && !Array.isArray(p)) parsed = p as any;
      } catch (e) {
        console.warn('[products] updateProdutoInfo: failed parse, overwriting', e);
        parsed = {};
      }
    }

    parsed[colKey] = { nome, unidade };
    localStorage.setItem("produtosInfo", JSON.stringify(parsed));
  };

  useEffect(() => {
    initializeProdutosInfo();
    loadFromStorage();
    loadProdutosAtivos();
  }, []);

  const handleLabelChange = (colKey: string, newName: string, unidade: string = "kg") => {
    setSavingProduct(colKey);
    
    const updatedLabels = { ...colLabels, [colKey]: newName };
    setColLabels(updatedLabels);
    
    const updatedUnidades = { ...unidades, [colKey]: unidade };
    setUnidades(updatedUnidades);
    
    updateProdutoInfo(colKey, newName, unidade);
    
    onLabelChange(colKey, newName, unidade);
    
    try {
      window.dispatchEvent(new CustomEvent('produtos-updated', { detail: { colKey, nome: newName, unidade } }));
    } catch (e) {
      // ignore in non-browser envs
    }
    
    setSavingProduct(null);
  };

  const handleUnidadeChange = async (colKey: string, unidadeValue: string) => {
    // value="0" → gramas (medida=0 no backend)
    // value="1" → quilos (medida=1 no backend)
    const novaUnidade = unidadeValue === "0" ? "g" : "kg";

    const updatedUnidades = { ...unidades, [colKey]: novaUnidade };
    setUnidades(updatedUnidades);

    const nomeAtual = colLabels[colKey] || "";
    updateProdutoInfo(colKey, nomeAtual, novaUnidade);

    // Persist immediately to backend
    try {
      const match = colKey.match(/^col(\d+)$/);
      if (match) {
        const colIndex = Number(match[1]);
        const num = colIndex - 5;
        if (!Number.isNaN(num) && num > 0) {
          await fetch("http://localhost:3000/api/db/setupMateriaPrima", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ num, produto: nomeAtual, medida: novaUnidade === 'g' ? 0 : 1 }] }),
          });
        }
      }
    } catch (e) {
      console.error('Failed to persist unidade change', e);
    }

    // Notify listeners with detail so parent can decide to reload immediately
    try {
      window.dispatchEvent(new CustomEvent('produtos-updated', { detail: { colKey, nome: nomeAtual, unidade: novaUnidade, immediate: true } }));
    } catch (e) {}

    // Call callback so UI labels update as before
    onLabelChange(colKey, nomeAtual, novaUnidade);
  };

  const handleToggleAtivo = async (colKey: string) => {
    setTogglingProduct(colKey);
    
    try {
      const match = colKey.match(/^col(\d+)$/);
      if (!match) return;
      
      const colIndex = Number(match[1]);
      const num = colIndex - 5;
      
      if (Number.isNaN(num) || num <= 0) return;

      console.log(`[products] Toggle produto ${num} (${colKey})`);

      const response = await fetch(`http://localhost:3000/api/materiaprima/${num}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[products] Erro na resposta:', error);
        throw new Error(error.error || "Erro ao alternar status do produto");
      }

      const result = await response.json();
      console.log('[products] Resposta do servidor:', result);
      
      // Atualizar estado local
      setProdutosAtivos(prev => {
        const novo = {
          ...prev,
          [colKey]: result.ativo
        };
        console.log('[products] Novo estado produtosAtivos:', novo);
        return novo;
      });

      // Notificar listeners para atualizar relatórios
      try {
        window.dispatchEvent(new CustomEvent('produtos-updated', { 
          detail: { colKey, ativo: result.ativo, immediate: true } 
        }));
      } catch (e) {
        console.warn('[products] Erro ao disparar evento:', e);
      }

      console.log(`[products] ✅ Produto ${num} ${result.ativo ? 'ATIVADO' : 'DESATIVADO'}`);

    } catch (e) {
      console.error('[products] Erro ao alternar status:', e);
      alert(`Erro ao alternar status: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTogglingProduct(null);
    }
  };

  const handleToggleIgnorarCalculos = async (colKey: string) => {
    setTogglingProduct(colKey);
    
    try {
      const match = colKey.match(/^col(\d+)$/);
      if (!match) return;
      
      const colIndex = Number(match[1]);
      const num = colIndex - 5;
      
      if (Number.isNaN(num) || num <= 0) return;

      console.log(`[products] Toggle ignorar cálculos produto ${num} (${colKey})`);

      const response = await fetch(`http://localhost:3000/api/materiaprima/${num}/toggle-ignorar-calculos`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[products] Erro na resposta:', error);
        throw new Error(error.error || "Erro ao alternar status de cálculos");
      }

      const result = await response.json();
      console.log('[products] Resposta do servidor:', result);
      
      // Atualizar estado local
      setProdutosIgnorarCalculos(prev => {
        const novo = {
          ...prev,
          [colKey]: result.ignorarCalculos
        };
        console.log('[products] Novo estado ignorarCalculos:', novo);
        return novo;
      });

      // Notificar listeners para atualizar relatórios
      try {
        window.dispatchEvent(new CustomEvent('produtos-updated', { 
          detail: { colKey, ignorarCalculos: result.ignorarCalculos, immediate: true } 
        }));
      } catch (e) {
        console.warn('[products] Erro ao disparar evento:', e);
      }

      console.log(`[products] ✅ Produto ${num} ${result.ignorarCalculos ? 'REMOVIDO dos CÁLCULOS' : 'INCLUÍDO nos CÁLCULOS'}`);

    } catch (e) {
      console.error('[products] Erro ao alternar cálculos:', e);
      alert(`Erro ao alternar cálculos: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTogglingProduct(null);
    }
  };

  

  //   setResettingAll(true);
    
  //   try {
  //     console.log('[products] Reativando todos os produtos...');
      
  //     const response = await fetch('http://localhost:3000/api/materiaprima/reset-all', {
  //       method: 'POST',
  //     });

  //     if (!response.ok) {
  //       const error = await response.json();
  //       throw new Error(error.error || 'Erro ao reativar produtos');
  //     }

  //     const result = await response.json();
  //     console.log('[products] Resultado do reset:', result);

  //     // Atualizar estado local - todos como ativos
  //     const todosAtivos: { [key: string]: boolean } = {};
  //     for (let i = START_COL; i <= END_COL; i++) {
  //       todosAtivos[`col${i}`] = true;
  //     }
  //     setProdutosAtivos(todosAtivos);

  //     // Notificar listeners
  //     window.dispatchEvent(new CustomEvent('produtos-updated', { 
  //       detail: { resetAll: true, immediate: true } 
  //     }));

  //     alert(`✅ ${result.total} produtos reativados com sucesso!`);
  //     console.log(`[products] ✅ Reset completo: ${result.total} produtos reativados`);

  //   } catch (e) {
  //     console.error('[products] Erro ao reativar produtos:', e);
  //     alert(`Erro ao reativar: ${e instanceof Error ? e.message : String(e)}`);
  //   } finally {
  //     setResettingAll(false);
  //   }
  // };

  // const handleResetUnitsToKg = async () => {
  //   if (!confirm('Deseja realmente RESETAR todas as unidades para KG? Esta ação não pode ser desfeita.')) {
  //     return;
  //   }

  //   setResettingUnits(true);
    
  //   try {
  //     console.log('[products] Resetando todas as unidades para kg...');
      
  //     // Atualizar localStorage
  //     if (typeof window !== "undefined") {
  //       const raw = localStorage.getItem("produtosInfo");
  //       let parsed: { [key: string]: { nome: string; unidade: string } } = {};
        
  //       if (raw) {
  //         try {
  //           const p = JSON.parse(raw);
  //           if (p && typeof p === 'object' && !Array.isArray(p)) {
  //             parsed = p as any;
  //           }
  //         } catch (e) {
  //           console.warn('[products] Erro ao parsear produtosInfo', e);
  //         }
  //       }

  //       // Atualizar todas as unidades para kg
  //       for (let i = START_COL; i <= END_COL; i++) {
  //         const key = `col${i}`;
  //         if (parsed[key]) {
  //           parsed[key].unidade = 'kg';
  //         } else {
  //           parsed[key] = {
  //             nome: `Produto ${i - 5}`,
  //             unidade: 'kg'
  //           };
  //         }
  //       }

  //       localStorage.setItem("produtosInfo", JSON.stringify(parsed));
  //       console.log('[products] localStorage atualizado com unidades em kg');

  //       // Atualizar estado local
  //       const novasUnidades: { [key: string]: string } = {};
  //       for (let i = START_COL; i <= END_COL; i++) {
  //         novasUnidades[`col${i}`] = 'kg';
  //       }
  //       setUnidades(novasUnidades);

  //       // Salvar no backend
  //       const requests = [];
  //       for (let i = START_COL; i <= END_COL; i++) {
  //         const key = `col${i}`;
  //         const num = i - 5;
  //         const nome = parsed[key]?.nome || `Produto ${num}`;
          
  //         requests.push(
  //           fetch(`http://localhost:3000/api/materiaprima/${num}`, {
  //             method: "PATCH",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ produto: nome, medida: 1 }), // medida 1 = kg
  //           })
  //         );
  //       }

  //       await Promise.all(requests);
  //       console.log('[products] Todas as unidades atualizadas no backend');
  //     }

  //     alert(`✅ Todas as unidades resetadas para KG com sucesso!`);
  //     console.log(`[products] ✅ Reset de unidades completo`);

  //   } catch (e) {
  //     console.error('[products] Erro ao resetar unidades:', e);
  //     alert(`Erro ao resetar unidades: ${e instanceof Error ? e.message : String(e)}`);
  //   } finally {
  //     setResettingUnits(false);
  //   }
  // };

  const editableColumns = Array.from({ length: END_COL - START_COL + 1 }, (_, i) => `col${i + START_COL}`);

  // Advanced filters hook (persistent)
  const adv = useAdvancedFilters();
  const { filters: advancedFilters, setFiltersState: setAdvancedFiltersState, clearFilters: clearAdvancedFilters } = adv;
  return (
    <div className="w-full h-full flex">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center ml-4 mb-6 mt-3">
          <h2 className="text-2xl md:text-3xl font-semibold">Editar Produtos</h2>
        </div>
        <div className="overflow-auto flex-1 min-h-0 thin-red-scrollbar">
          <div className="rounded p-3 w-full grid grid-cols-3 sm:grid-cols-1 lg:grid-cols-1 gap-7 shadow-xl/20 pb-8">
            {editableColumns.map((col) => {
              const colNumber = parseInt(col.replace("col", ""), 10);
              const produtoNumber = colNumber - 5;
              const unidadeAtual = unidades[col] || "kg";
              const labelValue = colLabels[col] || "";
              const isAtivo = produtosAtivos[col] ?? true;

              return (
                <div key={col}>
                  <div className={`flex flex-col justify-center items-start gap-2 shadow-xl/6 rounded-lg px-1 py-1 w-120 transition-opacity ${!isAtivo ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="flex w-full gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`input-${col}`}
                          className={`peer h-9 px-2 pt-4 text-sm border-b border-gray-400 rounded-lg focus:border-black focus:ring-0 ${savingProduct === col ? 'bg-gray-100' : ''}`}
                          type="text"
                          value={labelValue}
                          onChange={(e) => handleLabelChange(col, e.target.value, unidadeAtual)}
                          placeholder=" "
                          disabled={savingProduct === col}
                        />
                        <Label
                          htmlFor={`input-${col}`}
                          className="absolute left-2 px-1 transition-all text-gray-500 text-xs 
                            peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm 
                            peer-focus:top-[-0.6rem] peer-focus:text-base peer-focus:text-black peer-focus:bg-white 
                            peer-not-placeholder-shown:top-[-0.6rem] peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-black peer-not-placeholder-shown:bg-white"
                        >
                           {`Produto ${produtoNumber}`}
                        </Label>
                      </div>

                      <div className="flex items-center justify-center border border-gray-400 rounded-lg px-2 min-w-24">
                        <RadioGroup
                          className="flex flex-row gap-3"
                          value={unidadeAtual === "g" ? "0" : "1"}
                          onValueChange={(value) => handleUnidadeChange(col, value)}
                        >
                          <div className="flex flex-row items-center">
                            <RadioGroupItem value="0" id={`${col}-g`} className="border-gray-500" />
                            <Label htmlFor={`${col}-g`} className="text-sm cursor-pointer ml-1">g</Label>
                          </div>
                          <div className="flex flex-row items-center">
                            <RadioGroupItem value="1" id={`${col}-kg`} className="border-gray-500" />
                            <Label htmlFor={`${col}-kg`} className="text-sm cursor-pointer ml-1">kg</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button
                        size="sm"
                        variant={isAtivo ? "outline" : "secondary"}
                        onClick={() => handleToggleAtivo(col)}
                        className="h-9 px-2"
                        title={isAtivo ? "Desativar produto (ignorar nos cálculos)" : "Ativar produto"}
                        disabled={togglingProduct === col}
                      >
                        {togglingProduct === col ? (
                          <span className="animate-spin">⏳</span>
                        ) : isAtivo ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant={produtosIgnorarCalculos[col] ? "secondary" : "outline"}
                        onClick={() => handleToggleIgnorarCalculos(col)}
                        className="h-9 px-2"
                        title={produtosIgnorarCalculos[col] ? "Incluir nos cálculos" : "Remover dos cálculos (mantém no relatório)"}
                        disabled={togglingProduct === col || !isAtivo}
                      >
                        {togglingProduct === col ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <Calculator className={`h-4 w-4 ${produtosIgnorarCalculos[col] ? 'text-amber-600' : ''}`} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AdvancedFilterPanel
        filters={advancedFilters}
        onChange={(f) => setAdvancedFiltersState(f)}
        onApply={() => {
          try { window.dispatchEvent(new CustomEvent('advancedFiltersChanged', { detail: advancedFilters })); } catch (e) {}
        }}
        onClear={() => { clearAdvancedFilters(); try { window.dispatchEvent(new CustomEvent('advancedFiltersChanged', { detail: {} })); } catch (e) {} }}
        colLabels={colLabels}
      />
    </div>
  );
}

export default Products;