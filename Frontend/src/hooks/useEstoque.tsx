// Removed unused interfaces and cleaned up the hook
export const useEstoque = () => {
  return {
    estoque: [],
    estoqueBaixo: [],
    loading: false,
    error: null,
    carregarEstoque: () => {},
    carregarEstoqueBaixo: () => {},
  };
};