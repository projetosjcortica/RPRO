/**
 * Converte informações de data e hora de uma linha em um objeto Date.
 * @param {any} row - Objeto contendo os dados da linha, incluindo campos de data e hora.
 * @returns {Date | null} - Retorna um objeto Date se os dados forem válidos, ou null caso contrário.
 */
export function parseRowDateTime(row: any): Date | null {
  try {
    if (!row) return null; // Retorna null se a linha for inválida

    // Caso o campo datetime já esteja presente, retorna um objeto Date diretamente
    if (row.datetime) return new Date(row.datetime);

    // Obtém os campos de data e hora da linha
    const d = row.date || row.Dia || null;
    const t = row.time || row.Hora || null;

    if (!d || !t) return null; // Retorna null se data ou hora estiverem ausentes

    // Verifica se a data está no formato DD/MM/YYYY
    if (/\//.test(d)) {
      const parts = d.split('/');
      const day = parts[0].padStart(2, '0'); // Garante que o dia tenha dois dígitos
      const month = parts[1].padStart(2, '0'); // Garante que o mês tenha dois dígitos
      const year = parts[2] ? (parts[2].length === 2 ? '20' + parts[2] : parts[2]) : new Date().getFullYear();
      return new Date(`${year}-${month}-${day}T${t}`); // Retorna a data formatada
    }

    // Retorna a data no formato ISO caso não esteja no formato DD/MM/YYYY
    return new Date(`${d}T${t}`);
  } catch (e) {
    // Retorna null em caso de erro
    return null;
  }
}
