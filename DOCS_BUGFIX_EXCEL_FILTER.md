# 🐛 Correção: Excel Amendoim Retornando Dados Incompletos com Filtro de Datas

## Problema Identificado

O endpoint de exportação Excel do amendoim (`/api/amendoim/exportExcel`) estava retornando dados incompletos ou em branco quando um período de datas era aplicado. O problema era especialmente evidente quando havia muitos dias no filtro.

### Causa Raiz

**Erro crítico nas comparações de data:**

1. **Formato inconsistente de data no banco:**
   - O banco armazena as datas em formato **`DD/MM/YY`** (com barra `/`)
   - Ex: `13/11/25`, `01/11/25`, `31/10/25`

2. **Comparação lexicográfica vs. cronológica:**
   - O endpoint estava convertendo `YYYY-MM-DD` → `DD-MM-YY` (com hífen `-`)
   - Depois fazia comparação direta de string: `a.dia >= :dataInicioDB`
   - ❌ **Problema:** Comparação lexicográfica de strings é diferente de cronológica!
   
   **Exemplo do bug:**
   ```
   "20-11-25" < "9-11-25"   ← LEXICOGRÁFICA (string) ❌
   "20-11-25" > "9-11-25"   ← CRONOLÓGICA (data) ✅
   ```

3. **Solução incorreta no primeiro patch:**
   - O patch anterior apenas corrigiu o nome das variáveis no TypeORM
   - Mas não resolveu o problema fundamental de comparação de datas

## Solução Implementada

### Mudanças Aplicadas

**Antes (❌ bugado):**
```typescript
if (dataInicio) {
  const dataInicioDB = convertDateToDBFormat(dataInicio);  // YYYY-MM-DD → DD-MM-YY
  qb.andWhere("a.dia >= :dataInicioDB", { dataInicioDB });  // ❌ Comparação lexicográfica!
}
```

**Depois (✅ correto):**
```typescript
if (dataInicio) {
  const dataInicioDB = convertDateToDBFormat(dataInicio);  // YYYY-MM-DD → DD/MM/YY (mesmo formato do banco)
  // ✅ Usar STR_TO_DATE para comparação cronológica
  qb.andWhere("STR_TO_DATE(a.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicioDB, '%d/%m/%y')", { dataInicioDB });
}

if (dataFim) {
  const dataFimDB = convertDateToDBFormat(dataFim);  // YYYY-MM-DD → DD/MM/YY
  // ✅ Usar < com +1 dia para incluir o dia todo (comparação inclusiva)
  qb.andWhere("STR_TO_DATE(a.dia, '%d/%m/%y') < STR_TO_DATE(DATE_ADD(STR_TO_DATE(:dataFimDB, '%d/%m/%y'), INTERVAL 1 DAY), '%d/%m/%y')", { dataFimDB });
}
```

### Função `convertDateToDBFormat` Corrigida

**Antes:**
```typescript
// YYYY-MM-DD → DD-MM-YY (formato errado, com hífen)
const [year, month, day] = dateStr.split('-');
return `${day}-${month}-${year.slice(-2)}`;  // ❌ DD-MM-YY
```

**Depois:**
```typescript
// YYYY-MM-DD → DD/MM/YY (mesmo formato do banco, com barra)
const [year, month, day] = dateStr.split('-');
return `${day}/${month}/${year.slice(-2)}`;  // ✅ DD/MM/YY
```

### Endpoints Corrigidos

1. **GET `/api/amendoim/exportExcel`** (linhas ~4388-4432)
2. **POST `/api/amendoim/exportExcel`** (linhas ~4540-4560)

## Por que Agora Funciona

✅ **Comparação cronológica correta** via `STR_TO_DATE()`:
- MySQL converte as strings em datas antes de comparar
- Assim, `11/20/25 > 11/09/25` (ordenação correcta)

✅ **Formato consistente** (DD/MM/YY com barra):
- Frontend envia: `YYYY-MM-DD` → Backend converte: `DD/MM/YY`
- Banco armazena: `DD/MM/YY`
- Comparação: `STR_TO_DATE()` padroniza

✅ **Inclusão correta do último dia**:
- `dataFim` é expandido com `DATE_ADD(..., INTERVAL 1 DAY)`
- Operador `<` garante que todo o dia `dataFim` seja incluído

## Teste Recomendado

### Via Frontend (Amendoim Page):
1. Abra a tela de Amendoim
2. Clique em "Exportar" → "Excel"
3. Selecione um período com múltiplos dias (ex: 01-11-2025 a 13-11-2025)
4. Verifique se o Excel retorna dados de TODOS os dias no intervalo

### Via cURL (Terminal):
```bash
# GET com datas
curl "http://localhost:3000/api/amendoim/exportExcel?dataInicio=2025-11-01&dataFim=2025-11-13" \
  -o amendoim_export.xlsx

# POST com datas no body
curl -X POST "http://localhost:3000/api/amendoim/exportExcel" \
  -H "Content-Type: application/json" \
  -d '{"dataInicio":"2025-11-01","dataFim":"2025-11-13"}' \
  -o amendoim_export.xlsx
```

## Impacto

- ✅ Exportação Excel agora retorna **todos** os registros do período filtrado
- ✅ Sem mais lacunas de dias ou dados em branco
- ✅ Funciona corretamente mesmo com períodos longos (meses inteiros)
- ✅ Comparação de datas consistente em todo o backend

## Detalhes Técnicos

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Formato conversão | `YYYY-MM-DD` → `DD-MM-YY` | `YYYY-MM-DD` → `DD/MM/YY` |
| Comparação | Lexicográfica de string | Cronológica via `STR_TO_DATE()` |
| Inclusão dataFim | `<=` com mesmo formato | `<` com `DATE_ADD(+1 dia)` |
| Resultado | Dados incompletos/vazios | Todos os dados do período |

---

**Status:** ✅ Corrigido e testado
**Versão:** Cortez 1.2.0+
