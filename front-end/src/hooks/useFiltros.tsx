// hooks/useFiltros.ts
import { useState } from 'react';
import { Filtros} from '../components/types';

export const useFiltros = () => {
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: '',
    dataFim: '',
    nomeFormula: ''
  });

  const handleFiltroChange = (nome: keyof Filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [nome]: valor
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      nomeFormula: ''
    });
  };

  return {
    filtros,
    handleFiltroChange,
    limparFiltros
  };
};