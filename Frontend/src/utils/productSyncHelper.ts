/**
 * Utilitário para sincronizar os nomes dos produtos entre o backend export async function syncProductsToBackend(): Promise<boolean> {
  try {
    // Recupera materias do localStorage
    const savedMaterias = localStorage.getItem('materiaPrima');
    if (!savedMaterias) {
      return true; // Nada para sincronizar
    }
    
    const materias = JSON.parse(savedMaterias) as MateriaPrima[];
    
    // Envia para o backend
    const httpClient = getHttpApi();
    await httpClient.setupMateriaPrima(materias);
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar produtos com o backend:', error);
    return false;
  }
}aPrima) e o frontend (colLabels)
 */

import { MateriaPrima } from '../hooks/useMateriaPrima';
// import { getHttpApi } from '../services/httpApi';
import { getProcessador } from '../Processador';

/**
 * Sincroniza os produtos entre o localStorage e o backend
 * @returns Promise com os labels sincronizados
 */
export async function syncProductLabels(): Promise<{ [key: string]: string }> {
  // Recupera os labels atuais do localStorage (productLabels é o canonical)
  const savedLabels = localStorage.getItem('productLabels') || localStorage.getItem('colLabels');
  let colLabels: { [key: string]: string } = {};

  if (savedLabels) {
    try {
      const parsed = JSON.parse(savedLabels);
      if (Array.isArray(parsed) && parsed.length > 0) {
        colLabels = parsed[0];
      } else if (parsed && typeof parsed === 'object') {
        colLabels = parsed;
      }
    } catch (e) {
      console.error('Erro ao parsear productLabels/colLabels:', e);
    }
  }

  try {
    // Busca matérias-primas do backend via HTTP
    const processador = getProcessador();
    const materias = await processador.getMateriaPrima();

    if (Array.isArray(materias) && materias.length > 0) {
      // Atualiza os labels com os dados do backend
      materias.forEach(mp => {
        const colKey = `col${mp.num + 5}`;
        colLabels[colKey] = mp.produto;
      });
      
  // Salva os labels atualizados no localStorage (productLabels canonical)
  localStorage.setItem('productLabels', JSON.stringify([colLabels]));
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
  try {
    // Recupera materias do localStorage
    const savedMaterias = localStorage.getItem('materiaPrima');
    if (!savedMaterias) {
      return true; // Nada para sincronizar
    }
    
    const materias = JSON.parse(savedMaterias) as MateriaPrima[];
    
    // Envia para o backend
    const processador = getProcessador();
    await processador.dbSetupMateriaPrima(materias);
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar produtos com o backend:', error);
    return false;
  }
}