/**
 * Sistema de Features Experimentais - Cortez
 * 
 * Permite habilitar/desabilitar funcionalidades em teste através do painel Admin.
 * 
 * Como usar:
 * 1. No painel Admin, ative "Funcionalidades Experimentais"
 * 2. Features protegidas só aparecem quando ativadas
 * 3. Quando uma feature for aprovada para release, remova a verificação
 * 
 * Features atualmente experimentais:
 * - Ignorar produtos (botão Eye/EyeOff)
 * - Resetar todos produtos (botão verde)
 * - Resetar unidades para KG (botão azul)
 */

export function isExperimentalEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const value = localStorage.getItem('experimental-features');
  return value === 'true';
}

export function setExperimentalEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('experimental-features', String(enabled));
  
  // Notificar outras telas
  window.dispatchEvent(new CustomEvent('experimental-features-changed', { 
    detail: { enabled } 
  }));
}

export function useExperimentalFeatures(callback: (enabled: boolean) => void): () => void {
  const handleChange = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail.enabled);
  };
  
  window.addEventListener('experimental-features-changed', handleChange);
  
  return () => {
    window.removeEventListener('experimental-features-changed', handleChange);
  };
}
