# Guia de Uso - Sistema de Gestão de Estoque

## 🚀 Como Acessar

1. Certifique-se de que o backend está rodando:
   ```bash
   cd back-end
   npm run dev
   ```

2. Inicie o frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Acesse: **http://localhost:5173/estoque-management**

## 📊 Funcionalidades

### 1. Dashboard Principal
- **Total de Itens**: Quantidade total de matérias-primas cadastradas
- **Abaixo do Mínimo**: Itens em nível crítico
- **Acima do Máximo**: Itens com excesso de estoque
- **Taxa de Rotação**: Velocidade de consumo do estoque
- **Valor Total**: Valor total estimado do estoque

### 2. Aba "Estoque Atual"
- Visualize todos os itens em estoque
- Veja quantidade atual, mínimo e máximo
- Status colorido:
  - 🔴 **Crítico**: Abaixo do mínimo
  - 🔵 **Excesso**: Acima do máximo
  - 🟢 **Normal**: Dentro dos limites

**Filtros disponíveis:**
- ✅ Apenas Ativos
- ⚠️ Abaixo do Mínimo

### 3. Aba "Projeções"
Estimativas de quando cada item acabará baseado no consumo histórico:
- **Gráfico de barras**: Dias restantes por produto
- **Tabela detalhada**:
  - Quantidade atual
  - Consumo médio por dia
  - Dias restantes
  - Data estimada de fim
  - Status (Crítico/Atenção/Normal)

**Cores do status:**
- 🔴 **Crítico**: < 7 dias restantes
- 🟡 **Atenção**: 7-30 dias restantes
- 🟢 **Normal**: > 30 dias restantes

### 4. Aba "Consumo"
Análise de consumo de matérias-primas:
- **Gráfico de barras duplo**:
  - Total consumido
  - Média por produção
- **Tabela com métricas**:
  - Quantidade consumida total
  - Número de produções
  - Média por produção

### 5. Aba "Movimentações"
Histórico completo de entradas e saídas:
- Data e hora da movimentação
- Tipo (Entrada ⬇️ / Saída ⬆️ / Ajuste)
- Produto
- Quantidade
- Responsável
- Observações

**Filtros disponíveis:**
- Tipo de movimentação
- Data início
- Data fim

## 🔧 Operações

### Registrar Nova Movimentação
1. Clique em **"Nova Movimentação"**
2. Selecione o tipo:
   - **Entrada** ⬇️: Adicionar estoque (compras, devoluções)
   - **Saída** ⬆️: Remover estoque (consumo, vendas)
3. Escolha a matéria-prima
4. Informe a quantidade
5. Preencha responsável e observações (opcional)
6. Confirme

### Gerar Dados de Exemplo
Para testar o sistema com dados simulados:

```bash
cd back-end
node test-estoque-api.js
```

Ou via API:
```bash
curl -X POST http://localhost:3000/api/estoque/gerar-dados-exemplo
```

## 📡 API Endpoints

### Consulta
- `GET /api/estoque` - Lista estoque
- `GET /api/estoque/:id` - Busca item específico
- `GET /api/estoque/estatisticas` - Dashboard stats
- `GET /api/estoque/projecao?dias=30` - Projeções
- `GET /api/estoque/consumo?dataInicio=&dataFim=` - Consumo
- `GET /api/estoque/movimentacoes?tipo=&dataInicio=&dataFim=` - Histórico

### Operações
- `POST /api/estoque/inicializar` - Inicializar estoque
- `POST /api/estoque/entrada` - Registrar entrada
- `POST /api/estoque/saida` - Registrar saída
- `PUT /api/estoque/limites` - Atualizar limites

### Utilidades
- `POST /api/estoque/gerar-dados-exemplo` - Gerar dados de teste

## 🎯 Exemplos de Uso

### 1. Consultar Itens Críticos
```javascript
const response = await fetch('http://localhost:3000/api/estoque?abaixo_minimo=true');
const itensCriticos = await response.json();
```

### 2. Registrar Entrada de Estoque
```javascript
const response = await fetch('http://localhost:3000/api/estoque/entrada', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    materiaPrimaId: 'MP001',
    quantidade: 500,
    responsavel: 'João Silva',
    observacoes: 'Compra semanal'
  })
});
```

### 3. Ver Projeção de Estoque
```javascript
const response = await fetch('http://localhost:3000/api/estoque/projecao?dias=30');
const projecoes = await response.json();

projecoes.forEach(p => {
  console.log(`${p.nomeProduto}: ${p.diasRestantes} dias restantes`);
});
```

## 🔍 Detecção de Problemas

### Indicadores Visuais
- **Badge Vermelho (Crítico)**: Estoque abaixo do mínimo - AÇÃO URGENTE
- **Badge Amarelo (Atenção)**: Estoque acabará em breve
- **Badge Verde (Normal)**: Estoque saudável

### Alertas Automáticos
O sistema calcula automaticamente:
- Itens que precisam de reposição urgente
- Previsão de quando cada item acabará
- Taxa de consumo atual vs histórico

## 📈 Fluxo de Trabalho Recomendado

1. **Diariamente**: Verifique o dashboard para itens críticos
2. **Semanalmente**: Analise as projeções para planejar compras
3. **Mensalmente**: Revise o consumo para ajustar limites
4. **Sempre que receber mercadoria**: Registre entrada
5. **Ao consumir**: Registre saída (ou será feito automaticamente pela produção)

## 🛠️ Troubleshooting

### Backend não responde
```bash
# Verifique se está rodando na porta 3000
cd back-end
npm run dev
```

### Estoque vazio
```bash
# Gere dados de exemplo
node back-end/test-estoque-api.js
```

### Projeções não aparecem
- Certifique-se de ter dados de produção (batidas) no sistema
- As projeções são calculadas baseadas no histórico de consumo
- Se não houver histórico, as projeções não serão geradas

## 🎨 Customização

Para ajustar os limites de status nas projeções, edite `estoqueService.ts`:

```typescript
// Linha ~350
if (diasRestantes < 7) {
  status = "critico";    // < 7 dias
} else if (diasRestantes < 30) {
  status = "atencao";    // 7-30 dias
} else {
  status = "normal";     // > 30 dias
}
```

## 📝 Notas Importantes

- As projeções são baseadas nos últimos 30 dias de consumo por padrão
- O sistema calcula consumo através das batidas de produção
- Todas as datas seguem o formato ISO (YYYY-MM-DD)
- Movimentações são registradas com timestamp automático
- O estoque nunca pode ficar negativo (validação no backend)
