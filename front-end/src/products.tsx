// Products.tsx - CORRIGIDO
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
        if (IS_LOCAL) {
          // Para mock, usa localStorage ou objeto vazio
          const saved = localStorage.getItem("colLabels");
          if (saved) {
            let parsed: any = null;
            try {
              parsed = JSON.parse(saved);
            } catch (e) {
              console.warn('colLabels in localStorage is invalid JSON')
            }
            if (Array.isArray(parsed)) {
              const labelsArray: ColLabel[] = parsed;
              const labelsObj: { [key: string]: string } = {};
              labelsArray.forEach(item => (labelsObj[item.col_key] = item.col_name));
              setColLabels(labelsObj);
            } else if (parsed && typeof parsed === 'object') {
              // If stored as object, use it directly
              setColLabels(parsed as { [key: string]: string });
            }
          }
        } else {
          // Para API real, faz a chamada
          const response = await fetch("/api/col_labels");
          if (response.ok) {
            const json: any = await response.json();
            if (Array.isArray(json)) {
              const labelsArray: ColLabel[] = json;
              const labelsObj: { [key: string]: string } = {};
              labelsArray.forEach(item => (labelsObj[item.col_key] = item.col_name));
              setColLabels(labelsObj);
            } else if (json && typeof json === 'object') {
              setColLabels(json as { [key: string]: string });
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar labels:", err);
      }
    };

    fetchLabels();
  }, [setColLabels]);

  const handleUnidadeChange = (colKey: string, unidade: string) => {
    // Para mock, salva no localStorage
    if (IS_LOCAL) {
      const saved = localStorage.getItem("colLabels");
      const labels: ColLabel[] = saved ? JSON.parse(saved) : [];
      
      const index = labels.findIndex(l => l.col_key === colKey);
      if (index !== -1) {
        labels[index].unidade = unidade;
      } else {
        labels.push({ col_key: colKey, col_name: colLabels[colKey] || "", unidade });
      }
      
      localStorage.setItem("colLabels", JSON.stringify(labels));
    }
  };

  const columns = Object.keys(colLabels).sort((a, b) =>
    parseInt(a.replace("col", ""), 10) - parseInt(b.replace("col", ""), 10)
  );

  const editableColumns = columns.filter(col => parseInt(col.replace("col", ""), 10) > 5);

  return (
    <div className="w-[60vw] h-[95vh] m-3 overflow-auto">
      <h2 className="text-3xl font-semibold mb-4">Editar nome dos Produtos</h2>
      <ScrollArea className="h-[72vh]">
        <div className="rounded p-3 grid grid-cols-2 gap-4 shadow-xl/20">
          {editableColumns.length === 0 && (
            <p className="text-gray-500 col-span-2">Nenhuma coluna editável encontrada</p>
          )}
          {editableColumns.map(col => (
            <div key={col}>
              <div className="flex flex-row justify-center items-center gap-1 border border-black rounded-lg pr-1">
                <Input
                  className="m-0.5 h-8 inset-shadow-1"
                  type="text"
                  placeholder={col}
                  value={colLabels?.[col] || ""}
                  onChange={e => onLabelChange(col, e.target.value)}
                />
                <div>
                  <RadioGroup 
                    className="flex flex-row gap-1"
                    onValueChange={(value) => handleUnidadeChange(col, value)}
                  >
                    <div className="flex flex-row">
                      <RadioGroupItem value="gram" className="border-black mx-1" />
                      <Label>g</Label>
                    </div>
                    <div className="flex flex-row">
                      <RadioGroupItem value="kilogram" className="border-black mx-1" />
                      <Label>kg</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default Products;