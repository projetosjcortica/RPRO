import { useEffect, useState } from "react";
import axios from "axios";
import TableComponent from "./TableComponent";
import Products from "./products";
import FiltrosBar from "./components/searchBar";
import { Button } from "./components/ui/button";
import { Filtros } from "./components/types";
import { fetchLabels, ColLabel } from "./hooks/useLabelService";
import { IS_LOCAL } from "./CFG";

export default function Report() {
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    nomeFormula: "",
  });

  const [colLabels, setColLabels] = useState<{ [key: string]: string }>({});
  const [view, setView] = useState<'table' | 'product'>('table');

  // Carregar labels
  useEffect(() => {
    const loadLabels = async () => {
      try {
        // Prioriza localStorage se estiver usando mock
        if (IS_LOCAL) { // ← CORREÇÃO AQUI
          const saved = localStorage.getItem("colLabels");
          if (saved) {
            setColLabels(JSON.parse(saved));
            return;
          }
        }

        const labelsArray: ColLabel[] = await fetchLabels();
        const labelsObj: { [key: string]: string } = {};
        labelsArray.forEach(l => labelsObj[l.col_key] = l.col_name);
        setColLabels(labelsObj);

        if (IS_LOCAL) localStorage.setItem("colLabels", JSON.stringify(labelsObj));
      } catch (err) {
        console.error("Erro ao buscar labels:", err);
      }
    };

    loadLabels();
  }, []);

  // Função para alterar labels - CORRIGIDA
  const handleLabelChange = async (colKey: string, value: string, unidade?: string) => {
    setColLabels(prev => {
      const newLabels = { ...prev, [colKey]: value };
      if (IS_LOCAL) localStorage.setItem("colLabels", JSON.stringify(newLabels));
      return newLabels;
    });

    if (!IS_LOCAL) {
      try {
        await axios.put(`/api/col_labels/${colKey}`, { 
          col_name: value, 
          unidade: unidade || null 
        });
      } catch (error) {
        console.error("Erro ao atualizar label:", error);
      }
    }
  };

  let content;
  if (view === 'table') {
    content = <TableComponent filtros={filtros} colLabels={colLabels} />;
  } else if (view === 'product') {
    content = (
      <Products
        colLabels={colLabels}
        setColLabels={setColLabels}
        onLabelChange={handleLabelChange}
      />
    );
  }

  return (
    <div className="overflow-hidden flex flex-col gap-7 w-[100vw] h-full">
      <div className="h-30 flex flex-row justify-between">
        <div className="flex flex-row items-end gap-2">
          <Button onClick={() => setView('table')}>Relatórios</Button>
          <Button onClick={() => setView('product')}>Produtos</Button>
        </div>
        <div className="flex flex-row items-end justify-end gap-2">
          <FiltrosBar onAplicarFiltros={setFiltros} />
          <Button>Automático</Button>
          <Button>Upload</Button>
        </div>
      </div>
      <div className="flex flex-row gap-3.5 items-end h-[81vh]">
        <div className="w-[83vw] mx-auto h-[82.5vh] overflow-auto shadow-xl/16 flex justify-center">
          {content}
        </div>
      </div>
    </div>
  );
}
