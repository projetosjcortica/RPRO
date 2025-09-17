import { useEffect } from "react";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "./components/ui/label";
import { ColLabel } from "./hooks/useLabelService";
import { IS_LOCAL } from "./CFG";

interface ProductsProps {
  colLabels: { [key: string]: string };
  setColLabels: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onLabelChange: (colKey: string, newName: string, unidade?: string) => void;
}

function Products({ colLabels, setColLabels, onLabelChange }: ProductsProps) {
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        let labelsObj: { [key: string]: string } = {};

        if (IS_LOCAL) {
          const saved = localStorage.getItem("colLabels");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                parsed.forEach((item: ColLabel) => {
                  labelsObj[item.col_key] = item.col_name;
                });
              } else if (parsed && typeof parsed === "object") {
                labelsObj = parsed;
              }
            } catch {
              console.warn("colLabels inválido no localStorage");
            }
          }
        } else {
          const response = await fetch("/api/col_labels");
          if (response.ok) {
            const json: any = await response.json();
            if (Array.isArray(json)) {
              json.forEach((item: ColLabel) => {
                labelsObj[item.col_key] = item.col_name;
              });
            } else if (json && typeof json === "object") {
              labelsObj = json;
            }
          }
        }

        // 🔥 garante que do col6 até col45 existam
        for (let i = 6; i <= 45; i++) {
          const key = `col${i}`;
          if (!labelsObj[key]) {
            labelsObj[key] = "";
          }
        }
        localStorage.setItem("labelsMock", JSON.stringify([labelsObj]))
        setColLabels(labelsObj);
      } catch (err) {
        console.error("Erro ao carregar labels:", err);
      }
    };

    fetchLabels();
  }, [setColLabels]);

  const handleUnidadeChange = (colKey: string, unidade: string) => {
    if (IS_LOCAL) {
      const saved = localStorage.getItem("colLabels");
      let labels: ColLabel[] = [];
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            labels = parsed;
          } else if (parsed && typeof parsed === "object") {
            labels = Object.keys(parsed).map(key => ({
              col_key: key,
              col_name: parsed[key],
              unidade: ""
            }));
          }
        } catch {
          console.warn("colLabels inválido no localStorage");
          labels = [];
        }
      }

      const index = labels.findIndex((l) => l.col_key === colKey);
      if (index !== -1) {
        labels[index].unidade = unidade;
      } else {
        labels.push({ 
          col_key: colKey, 
          col_name: colLabels[colKey] || "", 
          unidade 
        });
      }

      localStorage.setItem("colLabels", JSON.stringify(labels));
    }
    
    onLabelChange(colKey, colLabels[colKey] || "", unidade);
  };

  const columns = Object.keys(colLabels).sort(
    (a, b) =>
      parseInt(a.replace("col", ""), 10) - parseInt(b.replace("col", ""), 10)
  );

  const editableColumns = columns.filter(
    (col) => parseInt(col.replace("col", ""), 10) >= 6
  );

  return (
    <div className="w-[60vw] h-[72vh] m-3 overflow-hidden">
      <h2 className="text-3xl font-semibold mb-4">Editar nome dos Produtos</h2>
      <ScrollArea className="h-[72vh]">
        <div className="rounded p-3 grid grid-cols-2 gap-4 shadow-xl/20">
          {editableColumns.length === 0 && (
            <p className="text-gray-500 col-span-2">
              Nenhuma coluna editável encontrada
            </p>
          )}
          {editableColumns.map((col) => {
            const colNumber = parseInt(col.replace("col", ""), 10);
            const produtoNumber = colNumber - 5;

            return (
              <div key={col}>
                <div className="flex flex-row justify-center items-center gap-2 border border-black rounded-lg px-2 py-1">
                  {/* Float label com fundo branco */}
                  <div className="relative flex-1">
                    <Input
                      id={`input-${col}`}
                      className="peer h-9 px-2 pt-4 text-sm border-b border-gray-400 rounded-lg focus:border-black focus:ring-0"
                      type="text"
                      value={colLabels?.[col] || ""}
                      onChange={(e) => onLabelChange(col, e.target.value)}
                      placeholder=" "
                    />
                    <Label
                      htmlFor={`input-${col}`}
                      className="absolute left-2 px-1 transition-all
                        text-gray-500 text-xs 
                        peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                        peer-focus:top-[-0.6rem] peer-focus:text-base peer-focus:text-black peer-focus:bg-white
                        peer-not-placeholder-shown:top-[-0.6rem] peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-black peer-not-placeholder-shown:bg-white"
                    >
                      {`Produto ${produtoNumber}`}
                    </Label>
                  </div>

                  {/* Radios */}
                  <RadioGroup
                    className="flex flex-row gap-1"
                    defaultValue="kilogram"
                    onValueChange={(value) => handleUnidadeChange(col, value)}
                  >
                    <div className="flex flex-row items-center">
                      <RadioGroupItem value="gram" className="border-black mx-1" />
                      <Label className="text-sm">g</Label>
                    </div>
                    <div className="flex flex-row items-center">
                      <RadioGroupItem value="kilogram" className="border-black mx-1" />
                      <Label className="text-sm">kg</Label>
                    </div>
                  </RadioGroup>
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
