// Script avançado para gerar dados mock personalizáveis
// Execute com: node generateMockDataAdvanced.js

class MockDataGenerator {
  constructor() {
    // Configurações customizáveis
    this.config = {
      // Período de geração
      startDate: new Date(2025, 8, 1), // setembro 2025
      endDate: new Date(2025, 8, 30),   // fim de setembro
      
      // Fórmulas disponíveis
      formulas: [
        { 
          nome: "Formula Nikkey", 
          form1: 1, 
          form2: 0,
          pattern: "concentrated", // concentra valores nos primeiros produtos
          baseValues: { main: 2000, secondary: 100 }
        },
        { 
          nome: "Formula Test 2", 
          form1: 2, 
          form2: 0,
          pattern: "distributed", // distribui valores em vários produtos
          baseValues: { main: 200, secondary: 200 }
        },
        { 
          nome: "Formula Alpha", 
          form1: 1, 
          form2: 1,
          pattern: "limited", // apenas os primeiros 10 produtos
          baseValues: { main: 170, secondary: 0 }
        },
        { 
          nome: "Formula Beta", 
          form1: 2, 
          form2: 1,
          pattern: "sparse", // valores esparsos em posições específicas
          baseValues: { main: 400, secondary: 250 }
        }
      ],
      
      // Configurações de geração
      recordsPerDayRange: [1, 5], // mín/máx registros por dia
      workingHours: [7, 22], // horário de funcionamento
      
      // Padrões de valores
      variations: {
        low: 0.1,    // variação de 10%
        medium: 0.2, // variação de 20%
        high: 0.3    // variação de 30%
      }
    };
  }
  
  // Gerar valores baseado no padrão da fórmula
  generateValues(formula) {
    const values = new Array(40).fill(0);
    const { pattern, baseValues } = formula;
    const variation = this.config.variations.medium;
    
    switch (pattern) {
      case "concentrated":
        // Formula Nikkey: foco nos primeiros 5 produtos
        values[0] = this.randomizeValue(baseValues.main, variation);
        for (let i = 1; i <= 4; i++) {
          values[i] = this.randomizeValue(baseValues.secondary, this.config.variations.low);
        }
        break;
        
      case "distributed":
        // Formula Test 2: valores em produtos 0-13 e 17-39
        for (let i = 0; i < 14; i++) {
          values[i] = this.randomizeValue(baseValues.main, this.config.variations.low);
        }
        // produtos 14-16 ficam em 0
        values[17] = this.randomizeValue(baseValues.main + 20, variation); // produto especial
        for (let i = 18; i < 40; i++) {
          values[i] = this.randomizeValue(baseValues.secondary, this.config.variations.low);
        }
        break;
        
      case "limited":
        // Formula Alpha: apenas primeiros 10 produtos
        for (let i = 0; i < 10; i++) {
          values[i] = this.randomizeValue(baseValues.main, variation);
        }
        break;
        
      case "sparse":
        // Formula Beta: valores esparsos
        values[0] = this.randomizeValue(baseValues.main, variation);
        values[5] = this.randomizeValue(baseValues.secondary, variation);
        values[10] = this.randomizeValue(baseValues.secondary, variation);
        values[15] = this.randomizeValue(150, variation);
        break;
    }
    
    return values;
  }
  
  // Adicionar variação aleatória a um valor base
  randomizeValue(baseValue, variationPercent) {
    const variation = baseValue * variationPercent;
    const min = baseValue - variation;
    const max = baseValue + variation;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Formatar data como DD/MM/YY
  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }
  
  // Formatar hora como HH:MM:SS
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Gerar um registro individual
  generateRecord(date, formula) {
    const [minHour, maxHour] = this.config.workingHours;
    const hour = Math.floor(Math.random() * (maxHour - minHour + 1)) + minHour;
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    
    const recordDate = new Date(date);
    recordDate.setHours(hour, minute, second);
    
    return {
      "Dia": this.formatDate(recordDate),
      "Hora": this.formatTime(recordDate),
      "Nome": formula.nome,
      "Form1": formula.form1,
      "Form2": formula.form2,
      "values": this.generateValues(formula)
    };
  }
  
  // Gerar todos os dados
  generate() {
    const mockRows = [];
    const { startDate, endDate, formulas, recordsPerDayRange } = this.config;
    
    console.log(`Gerando dados de ${this.formatDate(startDate)} até ${this.formatDate(endDate)}`);
    console.log(`Fórmulas: ${formulas.map(f => f.nome).join(', ')}`);
    
    // Iterar por cada dia
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Determinar quantos registros gerar para este dia
      const [minRecords, maxRecords] = recordsPerDayRange;
      const recordsToday = Math.floor(Math.random() * (maxRecords - minRecords + 1)) + minRecords;
      
      // Gerar registros para este dia
      for (let i = 0; i < recordsToday; i++) {
        // Escolher fórmula aleatória
        const formula = formulas[Math.floor(Math.random() * formulas.length)];
        
        // Gerar registro
        const record = this.generateRecord(new Date(date), formula);
        mockRows.push(record);
      }
    }
    
    // Ordenar por data e hora
    mockRows.sort((a, b) => {
      const dateA = new Date(`20${a.Dia.split('/')[2]}-${a.Dia.split('/')[1]}-${a.Dia.split('/')[0]}T${a.Hora}`);
      const dateB = new Date(`20${b.Dia.split('/')[2]}-${b.Dia.split('/')[1]}-${b.Dia.split('/')[0]}T${b.Hora}`);
      return dateA - dateB;
    });
    
    console.log(`Total de registros gerados: ${mockRows.length}`);
    
    return mockRows;
  }
  
  // Gerar estatísticas dos dados
  generateStats(data) {
    const stats = {
      totalRecords: data.length,
      formulas: {},
      dateRange: {
        first: data[0]?.Dia,
        last: data[data.length - 1]?.Dia
      },
      avgRecordsPerDay: 0
    };
    
    // Contar registros por fórmula
    data.forEach(record => {
      if (!stats.formulas[record.Nome]) {
        stats.formulas[record.Nome] = 0;
      }
      stats.formulas[record.Nome]++;
    });
    
    // Calcular média de registros por dia
    const uniqueDays = [...new Set(data.map(r => r.Dia))];
    stats.avgRecordsPerDay = (data.length / uniqueDays.length).toFixed(1);
    
    return stats;
  }
  
  // Exportar para arquivo TypeScript
  exportToFile(data) {
    const fileContent = `// mocks/mockData.ts - GERADO AUTOMATICAMENTE
// Data de geração: ${new Date().toLocaleString('pt-BR')}
import { ReportRow } from "../components/types";

export const mockRows: ReportRow[] = ${JSON.stringify(data, null, 2)};

export const processedMockRows: ReportRow[] = mockRows.map(row => {
  const total = row.values.reduce((sum, val) => sum + val, 0);
  return {
    ...row,
    total
  };
});

// Estatísticas dos dados gerados:
// ${JSON.stringify(this.generateStats(data), null, 2).split('\n').map(line => `// ${line}`).join('\n')}
`;
    
    return fileContent;
  }

  // Escrever arquivo diretamente
  async writeToFile(data, filePath) {
    const fs = await import('fs');
    const content = this.exportToFile(data);
    
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Arquivo salvo com sucesso: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar arquivo: ${error.message}`);
      return false;
    }
  }
}

// Executar o gerador
const generator = new MockDataGenerator();

// Você pode customizar as configurações aqui:
// generator.config.startDate = new Date(2025, 7, 1); // agosto
// generator.config.endDate = new Date(2025, 7, 31);   // fim de agosto
// generator.config.recordsPerDayRange = [2, 8]; // mais registros por dia

const generatedData = generator.generate();
const stats = generator.generateStats(generatedData);

console.log('\n=== ESTATÍSTICAS ===');
console.log(`Total de registros: ${stats.totalRecords}`);
console.log(`Período: ${stats.dateRange.first} até ${stats.dateRange.last}`);
console.log(`Média de registros por dia: ${stats.avgRecordsPerDay}`);
console.log('Registros por fórmula:');
Object.entries(stats.formulas).forEach(([formula, count]) => {
  console.log(`  ${formula}: ${count} registros`);
});

console.log('\n=== SALVANDO ARQUIVO ===');
// Caminho para o arquivo mockData.ts
const mockDataPath = './mockData.ts';

(async () => {
  const success = await generator.writeToFile(generatedData, mockDataPath);

  if (success) {
    console.log('\n🎉 Dados mock gerados e salvos com sucesso!');
    console.log('O arquivo mockData.ts foi atualizado automaticamente.');
  } else {
    console.log('\n❌ Falha ao salvar. Aqui está o conteúdo para copiar manualmente:');
    console.log('\n=== ARQUIVO GERADO ===');
    console.log(generator.exportToFile(generatedData));
    console.log('======================');
  }
})();