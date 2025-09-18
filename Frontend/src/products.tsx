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
  // Salva o objeto completo de nomes e unidades no localStorage
  const saveProdutosInfo = (labels: { [key: string]: string }, unidades: { [key: string]: string }) => {
    const produtosInfo: { [key: string]: { nome: string; unidade: string } } = {};
    for (let i = 6; i <= 45; i++) {
      const key = `col${i}`;
      produtosInfo[key] = {
        nome: labels[key] || "",
        unidade: unidades[key] || "kg" // padrão kg
      };
    }
    localStorage.setItem("produtosInfo", JSON.stringify(produtosInfo));
  };

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

        // Salva também nomes e unidades no produtosInfo
        saveProdutosInfo(labelsObj, unidades);
      } catch (err) {
        console.error("Erro ao carregar labels:", err);
      }
    };

    fetchLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setColLabels]);

  // Salva nome e unidade ao alterar nome
  const handleLabelChange = (colKey: string, newName: string, unidade?: string) => {
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
  };

  // Salva unidade ao alterar unidade
  const handleUnidadeChange = (colKey: string, unidade: string) => {
    unidades[colKey] = unidade === "1" ? "g" : "kg";

    console.log(`Changing unit for ${colKey} to ${unidade === "1" ? "grams" : "kilograms"}`);

    // Divide values by 1000 if the unit is set to grams
    if (unidade === "1") {
      const columnValuesRaw = localStorage.getItem(`values_${colKey}`);
      let columnValues: number[] = [];
      if (columnValuesRaw) {
        try {
          columnValues = JSON.parse(columnValuesRaw);
          console.log(`Original values for ${colKey}:`, columnValues);
        } catch (error) {
          console.error("Failed to parse column values from localStorage:", error);
        }
      } else {
        console.warn(`No values found in localStorage for key: values_${colKey}`);
      }

      // Divide each value by 1000
      columnValues = columnValues.map(value => value / 1000);
      console.log(`Updated values for ${colKey}:`, columnValues);
      localStorage.setItem(`values_${colKey}`, JSON.stringify(columnValues));

      // Trigger re-render in TableComponent
      const updatedData: { [key: string]: number }[] = JSON.parse(localStorage.getItem("tableData") || "[]");
      updatedData.forEach((row) => {
        if (row[colKey]) {
          row[colKey] = row[colKey] / 1000;
        }
      });
      localStorage.setItem("tableData", JSON.stringify(updatedData));
    }

    // Atualiza localStorage produtosInfo
    const produtosInfoRaw = localStorage.getItem("produtosInfo");
    let produtosInfo: { [key: string]: { nome: string; unidade: string } } = {};
    if (produtosInfoRaw) {
      try {
        produtosInfo = JSON.parse(produtosInfoRaw);
      } catch (error) {
        console.error("Failed to parse produtosInfo from localStorage:", error);
      }
    }
    produtosInfo[colKey] = {
      nome: colLabels[colKey] || "",
      unidade: unidades[colKey]
    };
    localStorage.setItem("produtosInfo", JSON.stringify(produtosInfo));
    console.log(`Updated produtosInfo for ${colKey}:`, produtosInfo[colKey]);

    onLabelChange(colKey, colLabels[colKey] || "", unidades[colKey]);
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

            // Recupera unidade do localStorage (produtosInfo) ou padrão
            let unidadeAtual = "kg";
            const produtosInfoRaw = localStorage.getItem("produtosInfo");
            if (produtosInfoRaw) {
              try {
                const produtosInfo = JSON.parse(produtosInfoRaw);
                if (produtosInfo[col] && produtosInfo[col].unidade) {
                  unidadeAtual = produtosInfo[col].unidade;
                }
              } catch {}
            }

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
                      onChange={(e) => handleLabelChange(col, e.target.value, unidadeAtual)}
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
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default Products;
