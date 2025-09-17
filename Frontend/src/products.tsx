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

        // 🔥 garante que do col6 até col20 existam
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
      // Get the current labels from localStorage
      const saved = localStorage.getItem("colLabels");
      let labels: ColLabel[] = [];
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            labels = parsed;
          } else if (parsed && typeof parsed === "object") {
            // Convert object format to array format
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

      // Update the specific column's unit
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

      // Save back to localStorage
      localStorage.setItem("colLabels", JSON.stringify(labels));
    }
    
    // Call the parent's onLabelChange with the unit
    onLabelChange(colKey, colLabels[colKey] || "", unidade);
  };

  // Ordena colunas numericamente
  const columns = Object.keys(colLabels).sort(
    (a, b) =>
      parseInt(a.replace("col", ""), 10) - parseInt(b.replace("col", ""), 10)
  );

  // Só mostra inputs a partir da col6
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
          {editableColumns.map((col) => (
            <div key={col}>
              <div className="flex flex-row justify-center items-center gap-1 border border-black rounded-lg pr-1">
                <Input
                  className="m-0.5 h-8 inset-shadow-1"
                  type="text"
                  placeholder={col}
                  value={colLabels?.[col] || ""}
                  onChange={(e) => onLabelChange(col, e.target.value)}
                />
                <RadioGroup
                  className="flex flex-row gap-1"
                  defaultValue="kilogram"
                  onValueChange={(value) => handleUnidadeChange(col, value)}
                >
                  <div className="flex flex-row items-center">
                    <RadioGroupItem value="gram" className="border-black mx-1" />
                    <Label>g</Label>
                  </div>
                  <div className="flex flex-row items-center">
                    <RadioGroupItem value="kilogram" className="border-black mx-1" />
                    <Label>kg</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default Products;

// Mock só como fallback, sem redeclarar a interface
export const mockLabels: ColLabel[] = [
  { col_key: "col6", col_name: "Peso" },
  { col_key: "col7", col_name: "Altura" },
  { col_key: "col8", col_name: "Largura" },
];