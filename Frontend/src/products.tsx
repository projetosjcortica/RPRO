import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "./components/ui/label";

interface ProductsProps {
  colLabels: { [key: string]: string };
  setColLabels: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onLabelChange: (colKey: string, newName: string, unidade?: string) => void;
}

function Products({ colLabels, setColLabels, onLabelChange }: ProductsProps) {
  const [savingProduct, setSavingProduct] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<{ [key: string]: string }>({});

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
  }, []);

  const handleLabelChange = (colKey: string, newName: string, unidade: string = "kg") => {
    setSavingProduct(colKey);
    
    // Atualiza estados
    const updatedLabels = { ...colLabels, [colKey]: newName };
    setColLabels(updatedLabels);
    
    const updatedUnidades = { ...unidades, [colKey]: unidade };
    setUnidades(updatedUnidades);
    
    // Atualiza localStorage
    updateProdutoInfo(colKey, newName, unidade);
    
    // Notifica componente pai
    onLabelChange(colKey, newName, unidade);
    // Notify other parts of the app that product definitions changed so sideinfo/tables can refresh
    try {
      window.dispatchEvent(new CustomEvent('produtos-updated', { detail: { colKey, nome: newName, unidade } }));
    } catch (e) {
      // ignore in non-browser envs
    }
    
    setSavingProduct(null);
  };

  const handleUnidadeChange = (colKey: string, unidadeValue: string) => {
    const novaUnidade = unidadeValue === "1" ? "g" : "kg";
    
    // Atualiza estado
    const updatedUnidades = { ...unidades, [colKey]: novaUnidade };
    setUnidades(updatedUnidades);
    
    // Atualiza localStorage
    const nomeAtual = colLabels[colKey] || "";
    updateProdutoInfo(colKey, nomeAtual, novaUnidade);
    
    // Notifica componente pai
    onLabelChange(colKey, nomeAtual, novaUnidade);
    // Notify other parts of the app that product definitions changed so sideinfo/tables can refresh
    try {
      window.dispatchEvent(new CustomEvent('produtos-updated', { detail: { colKey, nome: nomeAtual, unidade: novaUnidade } }));
    } catch (e) {}
  };

  // Gera colunas editáveis
  const editableColumns = Array.from({ length: END_COL - START_COL + 1 }, (_, i) => `col${i + START_COL}`);

  return (
    <div className="w-full h-full max-w-[1200px] mx-auto overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Editar Produtos</h2>
      
      <ScrollArea className="h-[72vh] max-h-[calc(100vh-140px)]">
        <div className="rounded p-3 grid grid-cols-3 sm:grid-cols-1 lg:grid-cols-1 gap-7 shadow-xl/20 mb-12">
          {editableColumns.map((col) => {
            const colNumber = parseInt(col.replace("col", ""), 10);
            const produtoNumber = colNumber - 5;
            const unidadeAtual = unidades[col] || "kg";
            const labelValue = colLabels[col] || "";

            return (
              <div key={col}>
                <div className="flex flex-col justify-center items-start gap-2 shadow-xl/6 rounded-lg px-1 py-1 w-120">
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
                        className="flex flex-row gap-1"
                        value={unidadeAtual === "g" ? "1" : "2"}
                        onValueChange={(value) => handleUnidadeChange(col, value)}
                      >
                        <div className="flex flex-row items-center">
                          <RadioGroupItem value="1" id={`${col}-g`} />
                          <Label htmlFor={`${col}-g`} className="text-sm cursor-pointer ml-1">g</Label>
                        </div>
                        <div className="flex flex-row items-center">
                          <RadioGroupItem value="2" id={`${col}-kg`} />
                          <Label htmlFor={`${col}-kg`} className="text-sm cursor-pointer ml-1">kg</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div> 
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default Products;