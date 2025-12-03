---
applyTo: '**/*.tsx'
priority: high
---

# Cortez – Padronização de Componentes PDF (Ração e Amendoim)

## Aplicação: `Pdf.tsx` (Ração) e `CustomPdf.tsx` (Amendoim)

---

## Objetivo

Padronizar a aparência visual, funcionalidades e estrutura dos relatórios PDF de **Ração** (`Pdf.tsx`) e **Amendoim** (`CustomPdf.tsx`), mantendo a integridade dos dados e criando uma experiência consistente para o usuário.

---

## Princípios de Padronização

### 1. Identidade Visual Unificada

**Paleta de Cores Corporativa**:
- **Primária**: `#af1e1eff` (vermelho J.Cortiça)
- **Secundária**: `#374151` (cinza escuro para textos)
- **Background neutro**: `#f9fafb`, `#e5e7eb` (cinzas claros)
- **Borda padrão**: `#d1d5db`
- **Feedback**:
  - Success: `#10b981`
  - Warning: `#f59e0b`
  - Error: `#ef4444`

**Tipografia Consistente**:
```typescript
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" }, // Regular
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" },
  ],
});
```

**Hierarquia de Tamanhos** (baseado em customização `fontSize: 'small' | 'medium' | 'large'`):
| Elemento | Small | Medium | Large |
|----------|-------|--------|-------|
| Título Principal | 20px | 24px | 28px |
| Seção | 14px | 16px | 18px |
| Corpo | 10px | 12px | 14px |
| Tabela | 8px | 10px | 12px |
| Rodapé | 8px | 10px | 12px |

### 2. Estrutura de Layout Padrão

**Dimensões da Página**:
```typescript
{
  padding: 30,
  paddingBottom: 60, // Espaço para rodapé fixo
  fontSize: 12,
  fontFamily: "Roboto",
  lineHeight: 1.5,
}
```

**Header Unificado**:
```typescript
// Com logo
header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,
  borderBottomWidth: 2,
  borderBottomColor: "#d1d5db",
  paddingBottom: 10,
}

// Sem logo
headerWithoutLogo: {
  flexDirection: "column",
  alignItems: "flex-start",
  marginBottom: 20,
  borderBottomWidth: 2,
  borderBottomColor: "#d1d5db",
  paddingBottom: 10,
}

// Logo padrão
logo: {
  width: 80,
  height: 80,
  marginRight: 15,
  borderRadius: 8,
  objectFit: "cover",
}
```

**Seções Padronizadas**:
```typescript
section: {
  marginBottom: 20,
  flexDirection: "column",
}

sectionTitle: {
  fontSize: 16,
  fontWeight: "bold",
  backgroundColor: "#af1e1eff", // Vermelho corporativo
  color: "#ffffff",
  padding: 8,
  borderRadius: 4,
  marginBottom: 12,
  textAlign: "center",
}
```

**Rodapé Fixo**:
```typescript
footer: {
  position: "absolute",
  bottom: 30,
  left: 30,
  right: 30,
  textAlign: "center",
  borderTopWidth: 1,
  borderTopColor: "#e5e7eb",
  paddingTop: 10,
}
```

### 3. Componentes de Tabela Consistentes

**Cabeçalho de Tabela**:
```typescript
tableColHeader: {
  borderBottomWidth: 1,
  borderColor: "#d1d5db",
  backgroundColor: "#e2e2e2ff",
  padding: 8,
  fontWeight: "bold",
  color: "#af1e1eff",
}
```

**Linhas Alternadas** (zebra striping):
```typescript
tableRow: {
  flexDirection: "row",
  backgroundColor: "#ffffff",
}

tableRowEven: {
  flexDirection: "row",
  backgroundColor: "#f9fafb",
}
```

**Bordas e Espaçamento**:
```typescript
table: {
  width: "100%",
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 10,
}
```

### 4. Gráficos e Visualizações

**Gráfico de Barras Horizontais** (análise de produção):
```typescript
chartRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
  paddingVertical: 2,
}

chartLabel: {
  width: '25%',
  fontSize: 8,
  color: '#374151',
  paddingRight: 4,
}

chartBarContainer: {
  width: '45%',
  height: 10,
  backgroundColor: '#e6e7ea',
  borderRadius: 3,
  overflow: 'hidden',
  marginRight: 4,
}

chartBarFill: {
  height: 10,
  backgroundColor: '#af1e1eff',
}

chartValue: {
  width: '15%',
  fontSize: 8,
  textAlign: 'right',
  color: '#374151',
}

chartPercent: {
  width: '15%',
  fontSize: 8,
  textAlign: 'right',
  color: '#6b7280',
}
```

### 5. Funcionalidades Obrigatórias em Ambos os PDFs

#### 5.1. Customização de Tamanho de Fonte
```typescript
interface PdfCustomization {
  fontSize: 'small' | 'medium' | 'large';
  sortOrder: 'alphabetic' | 'silo' | 'most-used';
  formulaSortOrder?: 'alphabetic' | 'code' | 'most-used';
}
```

#### 5.2. Ordenação de Dados
- **Alfabética**: `items.sort((a, b) => a.nome.localeCompare(b.nome))`
- **Por código**: `items.sort((a, b) => a.codigo.localeCompare(b.codigo))`
- **Mais usado**: `items.sort((a, b) => b.quantidade - a.quantidade)`

#### 5.3. Informações Essenciais
```typescript
// Header
- Logo (opcional)
- Título do relatório
- Data de geração
- Descrição (opcional)

// Corpo
- Informações gerais (período, totais)
- Tabelas de dados (fórmulas/produtos)
- Gráficos de análise
- Comentários/observações

// Rodapé
- Data/hora de geração
- Usuário responsável
- Paginação (X / Y)
- © J.Cortiça Automação
```

#### 5.4. Formatação de Dados
```typescript
// Datas
const formatarData = (data: string) => {
  if (!data || data === '-') return '-';
  try {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

// Números (kg, unidades)
value.toLocaleString('pt-BR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

// Porcentagens
percentage.toFixed(1) + '%'
```

### 6. Tratamento de Estados

**Dados Vazios**:
```typescript
{items.length === 0 && (
  <View style={styles.noContentMessage}>
    <Text style={styles.noContentIcon}>📄</Text>
    <Text>Nenhum dado disponível para este período.</Text>
  </View>
)}
```

**Valores Nulos/Indefinidos**:
```typescript
{field || '-'}
{Number(value || 0).toLocaleString('pt-BR')}
```

### 7. Paginação e Quebras

**Quebra de Página Inteligente**:
```typescript
<Page size="A4" style={styles.page} wrap>
  {/* Conteúdo que pode quebrar entre páginas */}
</Page>

// Elementos fixos em todas as páginas
<View fixed>
  {/* Header ou footer repetido */}
</View>
```

**Cabeçalho Fixo em Tabelas Longas**:
```typescript
tableHeaderFixed: {
  position: 'absolute',
  left: 30,
  right: 30,
  top: 160, // Ajustar conforme altura do header da página
  flexDirection: 'row',
  backgroundColor: '#e2e2e2ff',
  zIndex: 20,
}
```

---

## Checklist de Implementação

### Para `Pdf.tsx` (Ração)
- [x] Paleta de cores corporativa
- [x] Tipografia Roboto
- [x] Customização de tamanho de fonte
- [x] Ordenação de fórmulas (alfabética, código, mais usado)
- [x] Tabelas com zebra striping
- [x] Gráficos de barras horizontais
- [x] Rodapé fixo com paginação
- [x] Formatação de datas e números
- [x] Tratamento de dados vazios
- [x] Comentários do relatório
- [ ] Grid de produtos (card layout)
- [ ] Cards de total de produção
- [ ] Múltiplos gráficos configuráveis

### Para `CustomPdf.tsx` (Amendoim)
- [x] Paleta de cores corporativa
- [x] Tipografia Roboto
- [x] Logo condicional
- [x] Grid de produtos em cards
- [x] Card de total de produção
- [x] Gráficos placeholder
- [ ] Customização de tamanho de fonte
- [ ] Ordenação de dados
- [ ] Tabelas detalhadas (como em Ração)
- [ ] Gráficos de barras funcionais
- [ ] Rodapé com paginação
- [ ] Comentários/observações
- [ ] Múltiplas páginas com wrap

---

## Regras de Execução

1. **Ambos os PDFs devem compartilhar estilos base** através de um arquivo comum ou herança
2. **Cores e tipografia devem ser idênticas** em ambos os componentes
3. **Funcionalidades presentes em um devem estar no outro** (ordenação, customização, gráficos)
4. **Dados específicos de cada tipo** (fórmulas vs. produtos) mantêm sua estrutura, mas apresentação é uniforme
5. **Testes visuais obrigatórios** após cada modificação para garantir consistência

---

## Exemplo de Implementação Unificada

### Estilos Base (compartilhados)
```typescript
const baseStyles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 60,
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#333",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#af1e1eff",
    color: "#ffffff",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});
```

### Componente de Tabela Reutilizável
```typescript
const renderStandardTable = (
  data: Array<{ col1: string; col2: string; col3?: string }>,
  headers: string[],
  columnWidths: string[]
) => (
  <View style={styles.table}>
    <View style={styles.tableRow}>
      {headers.map((h, i) => (
        <Text key={i} style={[styles.tableColHeader, { width: columnWidths[i] }]}>
          {h}
        </Text>
      ))}
    </View>
    {data.map((row, i) => (
      <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
        <Text style={[styles.tableCol, { width: columnWidths[0] }]}>{row.col1}</Text>
        <Text style={[styles.tableCol, { width: columnWidths[1] }]}>{row.col2}</Text>
        {row.col3 && <Text style={[styles.tableCol, { width: columnWidths[2] }]}>{row.col3}</Text>}
      </View>
    ))}
  </View>
);
```

---

## Cortez. Relatórios consistentes, dados confiáveis.
