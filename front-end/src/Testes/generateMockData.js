// Script para gerar dados mock de um mês
// Execute com: node generateMockData.js

function generateMockData() {
  const mockRows = [];
  
  // Configurações
  const formulas = [
    { nome: "Formula Nikkey", form1: 1, form2: 0 },
    { nome: "Formula Test 2", form1: 2, form2: 0 },
    { nome: "Formula Alpha", form1: 1, form2: 1 },
    { nome: "Formula Beta", form1: 2, form2: 1 }
  ];
  
  // Gerar dados para setembro de 2025 (mês completo)
  const startDate = new Date(2025, 8, 1); // setembro = mês 8 (0-indexed)
  const endDate = new Date(2025, 8, 30); // 30 de setembro
  
  // Função para formatar data como DD/MM/YY
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }
  
  // Função para formatar hora como HH:MM:SS
  function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Função para gerar valores realistas
  function generateValues(formulaType) {
    const values = new Array(40).fill(0);
    
    if (formulaType === "Formula Nikkey") {
      // Formula Nikkey: valores altos no primeiro produto, menores nos próximos 4
      values[0] = Math.floor(Math.random() * 500) + 1800; // 1800-2300
      values[1] = Math.floor(Math.random() * 20) + 90;    // 90-110
      values[2] = Math.floor(Math.random() * 20) + 90;    // 90-110
      values[3] = Math.floor(Math.random() * 20) + 90;    // 90-110
      values[4] = Math.floor(Math.random() * 20) + 90;    // 90-110
      // Produtos 5-40 ficam em 0
    } else if (formulaType === "Formula Test 2") {
      // Formula Test 2: valores distribuídos em mais produtos
      for (let i = 0; i < 18; i++) {
        if (i === 17) {
          values[i] = Math.floor(Math.random() * 30) + 200; // produto especial
        } else if (i < 14) {
          values[i] = Math.floor(Math.random() * 10) + 195; // 195-205
        } else {
          values[i] = 0; // produtos 14-16 são 0
        }
      }
      // Produtos 18-40
      for (let i = 18; i < 40; i++) {
        values[i] = Math.floor(Math.random() * 10) + 195; // 195-205
      }
    } else if (formulaType === "Formula Alpha") {
      // Formula Alpha: distribuição diferente
      for (let i = 0; i < 10; i++) {
        values[i] = Math.floor(Math.random() * 50) + 150; // 150-200
      }
      // resto fica em 0
    } else if (formulaType === "Formula Beta") {
      // Formula Beta: poucos produtos com valores altos
      values[0] = Math.floor(Math.random() * 200) + 300; // 300-500
      values[5] = Math.floor(Math.random() * 100) + 200; // 200-300
      values[10] = Math.floor(Math.random() * 100) + 200; // 200-300
      values[15] = Math.floor(Math.random() * 50) + 100; // 100-150
    }
    
    return values;
  }
  
  // Gerar registros para cada dia do mês
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Número aleatório de registros por dia (1-5)
    const recordsPerDay = Math.floor(Math.random() * 5) + 1;
    
    for (let recordIndex = 0; recordIndex < recordsPerDay; recordIndex++) {
      // Escolher fórmula aleatória
      const formula = formulas[Math.floor(Math.random() * formulas.length)];
      
      // Gerar horário aleatório
      const hour = Math.floor(Math.random() * 16) + 7; // 07:00 às 22:00
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      
      const recordDate = new Date(date);
      recordDate.setHours(hour, minute, second);
      
      const mockRow = {
        "Dia": formatDate(recordDate),
        "Hora": formatTime(recordDate),
        "Nome": formula.nome,
        "Form1": formula.form1,
        "Form2": formula.form2,
        "values": generateValues(formula.nome)
      };
      
      mockRows.push(mockRow);
    }
  }
  
  // Ordenar por data e hora
  mockRows.sort((a, b) => {
    const dateA = new Date(`20${a.Dia.split('/')[2]}-${a.Dia.split('/')[1]}-${a.Dia.split('/')[0]}T${a.Hora}`);
    const dateB = new Date(`20${b.Dia.split('/')[2]}-${b.Dia.split('/')[1]}-${b.Dia.split('/')[0]}T${b.Hora}`);
    return dateA - dateB;
  });
  
  return mockRows;
}

// Gerar os dados
const generatedData = generateMockData();

// Criar o conteúdo do arquivo
const fileContent = `// mocks/mockData.ts - GERADO AUTOMATICAMENTE
import { ReportRow } from "../components/types";

export const mockRows: ReportRow[] = ${JSON.stringify(generatedData, null, 2)};

export const processedMockRows: ReportRow[] = mockRows.map(row => {
  const total = row.values.reduce((sum, val) => sum + val, 0);
  return {
    ...row,
    total
  };
});
`;

// Salvar o arquivo (você pode copiar este conteúdo)
console.log('=== ARQUIVO GERADO ===');
console.log(fileContent);
console.log('======================');
console.log(`Total de registros gerados: ${generatedData.length}`);
console.log('Copie o conteúdo acima e substitua o arquivo mockData.ts');