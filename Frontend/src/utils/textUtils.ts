/**
 * Função utilitária para truncar texto e adicionar reticências
 * @param text Texto para truncar
 * @param maxLength Comprimento máximo antes de truncar (padrão: 25)
 * @returns Texto truncado com reticências ou o texto original se não precisar truncar
 */
export function truncateText(text: string, maxLength: number = 25): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

/**
 * Classe de estilo CSS para truncar texto com reticências
 * Para usar em componentes onde queremos efeito de truncamento visual
 * Exemplo: className="truncate-text"
 */
export const truncateTextClass = 'overflow-hidden text-ellipsis whitespace-nowrap';