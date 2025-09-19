/**
 * Utilitário para sincronizar os nomes dos produtos entre o backend (MateriaPrima) e o frontend (colLabels)
 */

import { MateriaPrima } from '../hooks/useMateriaPrima';
import { apiWs } from '../Testes/api';
import { IS_LOCAL } from '../CFG';

/**
 * Sincroniza os produtos entre o localStorage e o backend
 * @returns Promise com os labels sincronizados
 */
export async function syncProductLabels(): Promise<{ [key: string]: string }> {
  // Recupera os labels atuais do localStorage
  const savedLabels = localStorage.getItem('colLabels');
  let colLabels: { [key: string]: string } = {};
  
  if (savedLabels) {
    try {
      colLabels = JSON.parse(savedLabels);
    } catch (e) {
      console.error('Erro ao parsear colLabels:', e);
    }
  }
  
  // Se estiver usando mock local, retorna os labels do localStorage
  if (IS_LOCAL) {
    return colLabels;
  }
  
  try {
    // Busca matérias-primas do backend via WebSocket
    const materias = await apiWs.getMateriaPrima() as MateriaPrima[];
    
    if (Array.isArray(materias) && materias.length > 0) {
      // Atualiza os labels com os dados do backend
      materias.forEach(mp => {
        const colKey = `col${mp.num + 5}`;
        colLabels[colKey] = mp.produto;
      });
      
      // Salva os labels atualizados no localStorage
      localStorage.setItem('colLabels', JSON.stringify(colLabels));
      localStorage.setItem('materiaPrima', JSON.stringify(materias));
      
      return colLabels;
    }
  } catch (error) {
    console.error('Erro ao sincronizar produtos com o backend:', error);
  }
  
  return colLabels;
}

/**
 * Sincroniza produtos do localStorage para o backend
 * @returns Promise com resultado da sincronização
 */
export async function syncProductsToBackend(): Promise<boolean> {
  if (IS_LOCAL) {
    return true; // Em modo local, não precisa sincronizar
  }
  
  try {
    // Recupera materias do localStorage
    const savedMaterias = localStorage.getItem('materiaPrima');
    if (!savedMaterias) {
      return false;
    }
    
    const materias = JSON.parse(savedMaterias) as MateriaPrima[];
    
    // Envia para o backend
    await apiWs.setupMateriaPrima(materias);
    return true;
  } catch (error) {
    console.error('Erro ao enviar produtos para o backend:', error);
    return false;
  }
}