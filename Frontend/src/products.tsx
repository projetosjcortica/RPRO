import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { Label } from "./components/ui/label";
import { getProcessador } from "./Processador";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";

interface ProductsProps {
  setColLabels: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

function Products({ setColLabels }: ProductsProps) {
  const processador = getProcessador();
  const [colLabels, setLocalColLabels] = useState<{ [key: string]: string }>({});
  const [savingProduct, setSavingProduct] = useState<string | null>(null);

  // Define the type for produtosInfo to avoid implicit 'any' errors
  interface ProdutosInfo {
    [key: string]: {
      unidade?: string;
    };
  }

  // Updated fetchLabels function to use the defined type
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labelsObj: { [key: string]: string } = await processador.getMateriaPrimaLabels();

        for (let i = 6; i <= 45; i++) {
          const key = `col${i}`;
          if (!labelsObj[key]) {
            labelsObj[key] = "";
          }
        }

        localStorage.setItem("colLabels", JSON.stringify(labelsObj));
        setColLabels(labelsObj);
        setLocalColLabels(labelsObj);
      } catch (err) {
        console.error("Erro ao carregar labels:", err);
      }
    };

    fetchLabels();
  }, [setColLabels]);

  const handleLabelChange = (col: string, value: string, unidadeAtual: string) => {
    const produtosInfoRaw = localStorage.getItem("produtosInfo");
    let produtosInfo: ProdutosInfo = {};

    if (produtosInfoRaw) {
      try {
        produtosInfo = JSON.parse(produtosInfoRaw);
      } catch {
        console.error("Erro ao parsear produtosInfo do localStorage");
      }
    }

    produtosInfo[col] = {
      ...(produtosInfo[col] || {}),
      unidade: unidadeAtual,
    };

    localStorage.setItem("produtosInfo", JSON.stringify(produtosInfo));
    const newLabels = { ...colLabels, [col]: value };
    setLocalColLabels(newLabels);
    setColLabels(newLabels);
  };

  const handleUnidadeChange = (col: string, value: string) => {
    const produtosInfoRaw = localStorage.getItem("produtosInfo");
    let produtosInfo: ProdutosInfo = {};

    if (produtosInfoRaw) {
      try {
        produtosInfo = JSON.parse(produtosInfoRaw);
      } catch {
        console.error("Erro ao parsear produtosInfo do localStorage");
      }
    }

    if (!produtosInfo[col]) { 
      produtosInfo[col] = {};
    }

    produtosInfo[col].unidade = value === "1" ? "g" : "kg";
    localStorage.setItem("produtosInfo", JSON.stringify(produtosInfo));
  };

  const columns = Object.keys(colLabels).sort(
    (a, b) => parseInt(a.replace("col", ""), 10) - parseInt(b.replace("col", ""), 10)
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