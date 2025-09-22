import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "./components/ui/label";
import { ColLabel } from "./hooks/useLabelService";
import { useMateriaPrima } from "./hooks/useMateriaPrima";
import { useUnidades } from "./hooks/useUnidades";
interface ProductsProps {
  colLabels: { [key: string]: string };
  setColLabels: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onLabelChange: (colKey: string, newName: string, unidade?: string) => void;
}

function Products({ colLabels, setColLabels, onLabelChange }: ProductsProps) {
  // Utiliza o hook para carregar matérias-primas
  const { materias } = useMateriaPrima();
  
  // Utiliza o hook para conversão de unidades
  const { converterUnidade: _converterUnidade } = useUnidades();
  
  // Estado para controlar atualização nos produtos do backend
  const [savingProduct, setSavingProduct] = useState<string | null>(null);

  // Estado local para unidades
  const unidades: { [key: string]: string } = {};
  // Carrega unidades do localStorage (produtosInfo)
  (() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("produtosInfo");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          for (let i = 6; i <= 45; i++) {
            const key = `col${i}`;
            if (parsed[key] && parsed[key].unidade) {
              unidades[key] = parsed[key].unidade;
            } else {
              unidades[key] = "kg";
            }
          }
        } catch {
          for (let i = 6; i <= 45; i++) {
            unidades[`col${i}`] = "kg";
          }
        }
      } else {
        for (let i = 6; i <= 45; i++) {
          unidades[`col${i}`] = "kg";
        }
      }
    }
  })();

  // Salva o objeto completo de nomes e unidades no localStorage
  const saveProdutosInfo = (labels: { [key: string]: string }, unids: { [key: string]: string }) => {
    const produtosInfo: { [key: string]: { nome: string; unidade: string } } = {};
    for (let i = 6; i <= 45; i++) {
      const key = `col${i}`;
      produtosInfo[key] = {
        nome: labels[key] || "",
        unidade: unids[key] || "kg" // padrão kg
      };
    }
    localStorage.setItem("produtosInfo", JSON.stringify(produtosInfo));
  };

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        let labelsObj: { [key: string]: string } = {};
        const response = await fetch("/api/col_labels");
        if (response.ok) {
          const json: any = await response.json();
          if (Array.isArray(json)) {
            json.forEach((item: ColLabel) => {
              if (item && item.col_key) labelsObj[item.col_key] = item.col_name;
            });
          } else if (json && typeof json === "object") {
            labelsObj = json;
          }
        }

        // 🔥 garante que do col6 até col45 existam
        for (let i = 6; i <= 45; i++) {
          const key = `col${i}`;
          if (!labelsObj[key]) {
            labelsObj[key] = "";
          }
        }
  localStorage.setItem("productLabels", JSON.stringify([labelsObj]));
  localStorage.setItem("colLabels", JSON.stringify(labelsObj));
        setColLabels(labelsObj);

        // Salva também nomes e unidades no produtosInfo
        saveProdutosInfo(labelsObj, unidades);
      } catch (err) {
        console.error("Erro ao carregar labels:", err);
      }
    };

    fetchLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setColLabels]);

  // Salva nome, unidade ao alterar nome
  const handleLabelChange = async (colKey: string, newName: string, unidade?: string) => {
    // Marca que estamos salvando
    setSavingProduct(colKey);
    
    try {
      // Primeiro, chama o método original para atualizar o frontend
      onLabelChange(colKey, newName, unidade);
      
      // Atualiza localStorage produtosInfo
      const produtosInfoRaw = localStorage.getItem("produtosInfo");
      let produtosInfo: { [key: string]: { nome: string; unidade: string } } = {};
      if (produtosInfoRaw) {
        try {
          produtosInfo = JSON.parse(produtosInfoRaw);
        } catch {}
      }
      produtosInfo[colKey] = {
        nome: newName,
        unidade: (unidades[colKey] || "kg")
      };
      localStorage.setItem("produtosInfo", JSON.stringify(produtosInfo));
      
      // Sincroniza com o backend
      try {
        const colNum = parseInt(colKey.replace("col", ""), 10);
        if (!isNaN(colNum)) {
          // O índice na MateriaPrima é colNum - 5
          const prodNum = colNum - 5;
          
          // Prepara matérias-primas atualizadas
          const updatedMaterias = [...materias];
          
          // Tenta encontrar a matéria-prima correspondente
          const existingIndex = updatedMaterias.findIndex(m => m.num === prodNum);
          
          if (existingIndex >= 0) {
            // Atualiza o existente
            updatedMaterias[existingIndex] = {
              ...updatedMaterias[existingIndex],
              produto: newName,
              medida: unidade === "g" ? 0 : 1, // 0 para gramas, 1 para kg
            };
          } else {
            // Adiciona novo
            updatedMaterias.push({
              id: `new-${Date.now()}`,
              num: prodNum,
              produto: newName,
              medida: unidade === "g" ? 0 : 1, // 0 para gramas, 1 para kg
            });
          }
          
          // Usa HTTP para salvar no backend
          await fetch("/api/db/setupMateriaPrima", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: updatedMaterias }),
          });
        }
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setSavingProduct(null);
    }
  };

  // Salva unidade ao alterar unidade
  const handleUnidadeChange = async (colKey: string, unidade: string) => {
    const novaUnidade = unidade === "1" ? "g" : "kg";
    console.log(`Alterando unidade do produto ${colKey} para ${novaUnidade}`);
    
    // Atualiza unidade local
    unidades[colKey] = novaUnidade;
    
    // Atualiza localStorage produtosInfo
    const produtosInfoRaw = localStorage.getItem("produtosInfo");
    let produtosInfo: { [key: string]: { nome: string; unidade: string } } = {};
    
    try {
      if (produtosInfoRaw) {
        produtosInfo = JSON.parse(produtosInfoRaw);
      }
    } catch (error) {
      console.error("Failed to parse produtosInfo from localStorage:", error);
    }
    
    produtosInfo[colKey] = {
      nome: colLabels[colKey] || "",
      unidade: novaUnidade
    };
    
    localStorage.setItem("produtosInfo", JSON.stringify(produtosInfo));
    console.log(`Informações do produto ${colKey} atualizadas:`, produtosInfo[colKey]);
    
    // Notifica a alteração da unidade para o componente pai
    onLabelChange(colKey, colLabels[colKey] || "", novaUnidade);
    
    // Sincroniza com o backend
    try {
      // Extrai o número da coluna
      const colNum = parseInt(colKey.replace("col", ""), 10);
      if (!isNaN(colNum)) {
        // O índice na MateriaPrima é colNum - 5
        const prodNum = colNum - 5;
        
        // Prepara matérias-primas atualizadas
        const updatedMaterias = [...materias];
        
        // Tenta encontrar a matéria-prima correspondente
        const existingIndex = updatedMaterias.findIndex(m => m.num === prodNum);
        
        if (existingIndex >= 0) {
          // Atualiza o existente
          updatedMaterias[existingIndex] = {
            ...updatedMaterias[existingIndex],
            medida: novaUnidade === "g" ? 0 : 1 // 0 para gramas, 1 para kg
          };
        } else if (colLabels[colKey]) {
          // Adiciona novo se tiver um nome definido
          updatedMaterias.push({
            id: `new-${Date.now()}`,
            num: prodNum,
            produto: colLabels[colKey] || "",
            medida: novaUnidade === "g" ? 0 : 1 // 0 para gramas, 1 para kg
          });
        }
        
        // Usa HTTP para salvar no backend
        await fetch("/api/db/setupMateriaPrima", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: updatedMaterias }),
        });
        console.log(`Unidade do produto ${colKey} atualizada no backend para ${novaUnidade}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar unidade no backend:", error);
    }
  };

  const columns = Object.keys(colLabels).sort(
    (a, b) =>
      parseInt(a.replace("col", ""), 10) - parseInt(b.replace("col", ""), 10)
  );

  const editableColumns = columns.filter(
    (col) => parseInt(col.replace("col", ""), 10) >= 6
  );

  return (
    <div className="w-full h-full max-w-[1200px] mx-auto overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Editar Produtos</h2>
      
      <ScrollArea className="h-[72vh] max-h-[calc(100vh-140px)]">
        {/* CASO ELE PEDIR SÓ TROCAR O TAMANHO DO GRID COLS */}
        <div className="rounded p-3 grid grid-cols-3 sm:grid-cols-1 lg:grid-cols-1 gap-3 shadow-xl/20 mb-12">
          {editableColumns.length === 0 && (
            <p className="text-gray-500 col-span-full">
              Nenhuma coluna editável encontrada
            </p>
          )}
          {editableColumns.map((col) => {
            const colNumber = parseInt(col.replace("col", ""), 10);
            const produtoNumber = colNumber - 5;

            // Recupera unidade do localStorage (produtosInfo) ou padrão
            let unidadeAtual = "kg";
            const produtosInfoRaw = localStorage.getItem("produtosInfo");
            if (produtosInfoRaw) {
              try {
                const produtosInfo = JSON.parse(produtosInfoRaw);
                if (produtosInfo[col]) {
                  if (produtosInfo[col].unidade) {
                    unidadeAtual = produtosInfo[col].unidade;
                  }
                }
              } catch {}
            }

            return (
              <div key={col}>
                <div className="flex flex-col justify-center items-start gap-2 border border-black rounded-lg px-2 py-3">
                  {/* Layout com Input e Radio lado a lado */}
                  <div className="flex w-full gap-2">
                    {/* Input com float label */}
                    <div className="relative flex-1">
                      <Input
                        id={`input-${col}`}
                        className={`peer h-9 px-2 pt-4 text-sm border-b border-gray-400 rounded-lg focus:border-black focus:ring-0 ${savingProduct === col ? 'bg-gray-100' : ''}`}
                        type="text"
                        value={colLabels?.[col] || ""}
                        onChange={(e) => handleLabelChange(col, e.target.value, unidadeAtual)}
                        placeholder=" "
                        disabled={savingProduct === col}
                      />
                      <Label
                        htmlFor={`input-${col}`}
                        className="absolute left-2 px-1 transition-all
                          text-gray-500 text-xs 
                          peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                          peer-focus:top-[-0.6rem] peer-focus:text-base peer-focus:text-black peer-focus:bg-white
                          peer-not-placeholder-shown:top-[-0.6rem] peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-black peer-not-placeholder-shown:bg-white"
                      >
                        {savingProduct === col ? 'Salvando...' : `Produto ${produtoNumber}`}
                      </Label>
                    </div>

                    {/* Radios agrupados numa caixa */}
                    <div className="flex items-center justify-center border border-gray-200 rounded-lg px-2 min-w-24">
                      <RadioGroup
                        className="flex flex-row gap-1"
                        value={unidadeAtual === "g" ? "1" : "2"}
                        onValueChange={(value) => handleUnidadeChange(col, value)}
                      >
                        <div className="flex flex-row items-center">
                          <RadioGroupItem value="1" className="border-black mx-1" />
                          <Label className="text-sm">g</Label>
                        </div>
                        <div className="flex flex-row items-center">
                          <RadioGroupItem value="2" className="border-black mx-1" />
                          <Label className="text-sm">kg</Label>
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