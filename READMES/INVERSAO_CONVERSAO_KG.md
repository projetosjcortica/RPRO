# Inversão da Conversão g/kg - Resumo das Alterações

**Data**: 21 de outubro de 2025  
**Alteração**: Inversão completa da lógica de conversão entre gramas e quilos

---

## 📋 Resumo

Todas as operações de conversão entre gramas (g) e quilos (kg) foram **invertidas** no sistema:

### Antes (Lógica Original)
- **g → kg**: `valor / 1000` (dividir por 1000)
- **kg → g**: `valor * 1000` (multiplicar por 1000)

### Depois (Nova Lógica)
- **g → kg**: `valor * 1000` (multiplicar por 1000)
- **kg → g**: `valor / 1000` (dividir por 1000)

---

## 🔧 Arquivos Modificados

### Backend (10 alterações)

#### 1. `/back-end/src/index.ts`
- **Linha ~1173**: Paginação de relatórios
  ```typescript
  // ANTES: if (materia && Number(materia.medida) === 0 && v) v = v / 1000;
  // DEPOIS: if (materia && Number(materia.medida) === 0 && v) v = v * 1000;
  ```

- **Linha ~1454**: Exportação para Excel
  ```typescript
  // ANTES: if (mp && Number(mp.medida) === 0 && v) v = v / 1000;
  // DEPOIS: if (mp && Number(mp.medida) === 0 && v) v = v * 1000;
  ```

- **Linha ~1801**: Paginação POST
  ```typescript
  // ANTES: v = v / 1000;
  // DEPOIS: v = v * 1000;
  ```

- **Linha ~2823**: Chart de produtos
  ```typescript
  // ANTES: rowTotalKg += raw / 1000;
  // DEPOIS: rowTotalKg += raw * 1000;
  ```

- **Linha ~2935**: Agregação de produtos
  ```typescript
  // ANTES: const valueKg = unit === "g" ? value / 1000 : value;
  // DEPOIS: const valueKg = unit === "g" ? value * 1000 : value;
  ```

- **Linha ~3029**: Chart de horários
  ```typescript
  // ANTES: rowTotalKg += raw / 1000;
  // DEPOIS: rowTotalKg += raw * 1000;
  ```

- **Linha ~3168**: Chart de semana
  ```typescript
  // ANTES: rowTotalKg += raw / 1000;
  // DEPOIS: rowTotalKg += raw * 1000;
  ```

- **Linha ~3275**: Resumo geral
  ```typescript
  // ANTES: rowTotalKg += raw / 1000;
  // DEPOIS: rowTotalKg += raw * 1000;
  ```

- **Linha ~3407**: Chart de formulas por dia
  ```typescript
  // ANTES: rowTotalKg += raw / 1000;
  // DEPOIS: rowTotalKg += raw * 1000;
  ```

- **Linha ~3542**: Chart de semana paginado
  ```typescript
  // ANTES: rowTotalKg += raw / 1000;
  // DEPOIS: rowTotalKg += raw * 1000;
  ```

#### 2. `/back-end/src/services/unidadesService.ts`
- **Método `converterUnidades`**:
  ```typescript
  // ANTES:
  // g → kg: return valor / 1000;
  // kg → g: return valor * 1000;
  
  // DEPOIS:
  // g → kg: return valor * 1000;
  // kg → g: return valor / 1000;
  ```

- **Método `normalizarParaKg`**:
  ```typescript
  // ANTES: if (unidade === 0) resultado[coluna] = valor / 1000;
  // DEPOIS: if (unidade === 0) resultado[coluna] = valor * 1000;
  ```

### Frontend (5 alterações)

#### 3. `/Frontend/src/hooks/useUnidades.tsx`
- **Função `converterUnidade`**:
  ```typescript
  // ANTES:
  // g → kg: return valor / 1000;
  // kg → g: return valor * 1000;
  
  // DEPOIS:
  // g → kg: return valor * 1000;
  // kg → g: return valor / 1000;
  ```

- **Função `normalizarParaKg`**:
  ```typescript
  // ANTES: if (unidade === 0) resultado[coluna] = valor / 1000;
  // DEPOIS: if (unidade === 0) resultado[coluna] = valor * 1000;
  ```

#### 4. `/Frontend/src/report.tsx`
- **Linha ~877**: Gráfico de produtos
  ```typescript
  // ANTES: if (unidade === "g") v = v / 1000;
  // DEPOIS: if (unidade === "g") v = v * 1000;
  ```

- **Linha ~1645**: Exibição de produtos no drawer
  ```typescript
  // ANTES: const valorExibicao = unidade === "g" ? produto.qtd / 1000 : produto.qtd;
  // DEPOIS: const valorExibicao = unidade === "g" ? produto.qtd * 1000 : produto.qtd;
  ```

#### 5. `/Frontend/src/TableComponent.tsx`
- **Linha ~284**: Conversão para exibição
  ```typescript
  // ANTES: if (unidade === "g") return n * 1000;
  // DEPOIS: if (unidade === "g") return n / 1000;
  ```

#### 6. `/Frontend/src/Pdf.tsx`
- **Linha ~609**: Geração de PDF
  ```typescript
  // ANTES: (p.unidade === "kg" ? p.qtd : p.qtd / 1000)
  // DEPOIS: (p.unidade === "kg" ? p.qtd : p.qtd * 1000)
  ```

---

## 🎯 Impacto Funcional

### Endpoints Afetados (Backend)
1. `GET /api/relatorio/paginate` - Paginação de relatórios
2. `POST /api/relatorio/paginate` - Paginação com filtros
3. `GET /api/relatorio/exportExcel` - Exportação Excel
4. `GET /api/chartdata/produtos` - Gráfico de produtos
5. `GET /api/chartdata/horarios` - Gráfico de horários
6. `GET /api/chartdata/semana` - Gráfico semanal
7. `GET /api/resumo` - Resumo geral
8. `GET /api/chartdata/formulas` - Gráfico de fórmulas
9. `POST /api/chartdata/semana` - Gráfico semanal paginado

### Componentes Afetados (Frontend)
1. **report.tsx**: Exibição de tabelas e gráficos
2. **TableComponent.tsx**: Formatação de valores na tabela
3. **Pdf.tsx**: Geração de relatórios PDF
4. **useUnidades.tsx**: Hook de conversão de unidades

---

## ⚠️ Considerações Importantes

### 1. Dados Existentes
- **Atenção**: Se houver dados já cadastrados no banco, eles serão interpretados de forma diferente
- **Exemplo**: Um valor `5000` que antes era interpretado como 5000g (5kg), agora será 5000kg (5000000g)

### 2. Configuração de Produtos
- A flag `medida` continua com o mesmo significado:
  - `medida = 0`: Produto em gramas
  - `medida = 1`: Produto em quilos

### 3. Migração de Dados
- **Recomendação**: Considere criar um script de migração se houver dados em produção
- **Script sugerido**:
  ```sql
  -- Para produtos com medida = 0 (gramas), dividir valores por 1000000
  UPDATE Row SET Prod_1 = Prod_1 / 1000000 WHERE EXISTS (
    SELECT 1 FROM MateriaPrima WHERE num = 1 AND medida = 0
  );
  
  -- Repetir para todas as colunas Prod_*
  ```

### 4. Testes Necessários
- [ ] Testar inserção de novos dados
- [ ] Verificar cálculos de totais
- [ ] Validar exportação Excel
- [ ] Conferir geração de PDFs
- [ ] Testar todos os gráficos:
  - [ ] Produtos
  - [ ] Horários
  - [ ] Semana
  - [ ] Fórmulas
- [ ] Verificar exibição na tabela principal

---

## 🔍 Como Validar

### Teste 1: Inserção de Dados
```bash
# Configurar produtos
curl -X POST http://localhost:3000/api/db/setupMateriaPrima \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"num": 1, "produto": "Farinha (g)", "medida": 0},
      {"num": 2, "produto": "Açúcar (kg)", "medida": 1}
    ]
  }'

# Criar CSV de teste
echo "Dia,Hora,Nome,Form1,Form2,Prod_1,Prod_2
2025-10-21,10:00,Teste,100,1,5,3" > test.csv

# Upload
curl -X POST http://localhost:3000/api/file/upload -F "file=@test.csv"

# Verificar resumo
curl "http://localhost:3000/api/resumo" | jq '.totalPesos'
# ANTES (lógica antiga): 5/1000 + 3 = 8.005 kg
# DEPOIS (lógica nova): 5*1000 + 3 = 5003 kg
```

### Teste 2: Exibição na Interface
1. Abrir sistema
2. Ir para Relatórios
3. Verificar valores na tabela
4. Abrir drawer lateral (gráficos)
5. Conferir valores nos gráficos

### Teste 3: Exportação
1. Exportar relatório para Excel
2. Abrir arquivo
3. Verificar valores das colunas de produtos

---

## 📊 Exemplo de Mudança

### Cenário: Produto "Farinha" com medida = 0 (gramas)

#### Valor armazenado no banco: `5000`

**Lógica Antiga (/ 1000)**:
- Banco: `5000`
- Após conversão: `5000 / 1000 = 5 kg`
- Exibição: "5.000 kg"

**Lógica Nova (* 1000)**:
- Banco: `5000`
- Após conversão: `5000 * 1000 = 5000000 kg`
- Exibição: "5000000.000 kg"

---

## 🚨 Ações Recomendadas

1. **Backup imediato** de todo o banco de dados
2. **Testar em ambiente de desenvolvimento** antes de produção
3. **Validar** com dados reais do cliente
4. **Documentar** a mudança para equipe
5. **Treinar** usuários sobre possíveis diferenças
6. Considerar **reverter** se houver problemas

---

## 🔄 Como Reverter

Se necessário reverter, executar:

```bash
cd /home/isqne/Downloads/RPRO
git diff HEAD > inversao_conversao.patch
git checkout -- .
```

Ou manualmente, trocar todas as operações de volta:
- `* 1000` → `/ 1000`
- `/ 1000` → `* 1000`

---

**Status**: ✅ Implementado  
**Testado**: ⚠️ Pendente de testes com dados reais  
**Aprovado**: ⏳ Aguardando validação
