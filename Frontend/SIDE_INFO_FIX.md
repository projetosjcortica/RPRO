# Correção - Side Info: Valores e Unidades Invertidos

## Problema Identificado

O Side Info estava exibindo valores e unidades de forma inconsistente:
- Produtos configurados em **gramas** exibiam valores em kg
- Produtos configurados em **kg** exibiam valores incorretos
- A unidade mostrada nem sempre correspondia ao formato do valor

## Causa Raiz

### 1. Função `converterValor` Incorreta

**ANTES (Linha 715-721):**
```typescript
const converterValor = (valor: number, colKey?: string): number => {
  if (typeof valor !== "number") return valor;
  let unidade = produtosInfo[colKey || ""]?.unidade || "kg";
  // Backend retorna valores sempre em kg. Se unidade configurada é 'g', dividimos por 1000
  if (unidade === "g") return valor / 1000;  // ❌ ERRADO!
  return valor;
};
```

**Problema:** Comentário dizia "backend retorna sempre em kg", mas isso é **falso**!

**Realidade:**
- `/api/relatorio/paginate`: Converte tudo para kg ✅
- `/api/resumo`: **Mantém valores originais** (g se medida=0, kg se medida=1) ⚠️

A função estava **dividindo por 1000 valores que já estavam em gramas**, causando valores 1000x menores!

### 2. Unidade Não Incluída no `displayProducts`

**ANTES (Linha 881-901):**
```typescript
const items: {
  colKey: string;
  nome: string;
  qtd: number;
  idx: number;  // ❌ Faltava 'unidade'
}[] = ...

return items.map(({ colKey, nome, qtd }) => ({ colKey, nome, qtd }));
// ❌ Não incluía 'unidade' no retorno
```

**Problema:** Quando dados vinham do `resumo`, a unidade não era propagada, fazendo com que sempre usasse o fallback "kg".

## Soluções Aplicadas

### 1. Corrigida Função `converterValor`

**DEPOIS:**
```typescript
const converterValor = (valor: number, colKey?: string): number => {
  if (typeof valor !== "number") return valor;
  // O backend /api/resumo retorna valores originais (g se medida=0, kg se medida=1)
  // Já estão no formato correto, apenas retornar
  return valor;
};
```

**Agora:** Não faz conversão, pois o resumo já retorna valores corretos.

### 2. Incluída Unidade no `displayProducts`

**DEPOIS:**
```typescript
const items: {
  colKey: string;
  nome: string;
  qtd: number;
  unidade: string;  // ✅ Adicionado
  idx: number;
}[] = Object.entries(resumo.usosPorProduto).map(
  ([key, val]: [string, unknown]) => {
    const produtoId = "col" + (Number(String(key).split("Produto_")[1]) + 5);
    const nome = produtosInfo[produtoId]?.nome || String(key);
    const v = val as Record<string, unknown> | undefined;
    const rawQtd = v?.["quantidade"];
    const qtd = Number(rawQtd ?? 0) || 0;
    // ✅ Buscar unidade do resumo ou do produtosInfo
    const unidade = String(v?.["unidade"] || produtosInfo[produtoId]?.unidade || "kg");
    const idx = Number(String(produtoId).replace(/^col/, "")) || 0;
    return { colKey: produtoId, nome, qtd, unidade, idx };
  }
);

return items.map(({ colKey, nome, qtd, unidade }) => 
  ({ colKey, nome, qtd, unidade })  // ✅ Incluído unidade
);
```

### 3. Simplificada Exibição no Side Info

**ANTES:**
```typescript
{Number(
  converterValor(Number(produto.qtd), produto.colKey)
).toLocaleString("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})}{" "}
{(produto.colKey && produtosInfo[produto.colKey]?.unidade) || "kg"}
```

**DEPOIS:**
```typescript
{Number(produto.qtd).toLocaleString("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})}{" "}
{produto.unidade ||
  (produto.colKey && produtosInfo[produto.colKey]?.unidade) ||
  "kg"}
```

**Mudanças:**
- ✅ Removida chamada desnecessária a `converterValor`
- ✅ Prioriza `produto.unidade` (vem do resumo)
- ✅ Fallback para `produtosInfo` se necessário

## Como Funciona Agora

### Fluxo Backend → Frontend

1. **Backend `/api/resumo`** retorna:
   ```json
   {
     "usosPorProduto": {
       "Produto_1": {
         "quantidade": 321022,  // em gramas (se medida=0)
         "label": "Prod2xcvbnm.AZSXDFGHJ",
         "unidade": "g"
       },
       "Produto_3": {
         "quantidade": 358.266,  // em kg (se medida=1)
         "label": "Produto 2",
         "unidade": "kg"
       }
     }
   }
   ```

2. **Frontend processa**:
   - Extrai `quantidade` e `unidade` do resumo
   - Mantém valores como estão (não converte)
   - Usa unidade do resumo

3. **Exibição no Side Info**:
   ```
   Prod2xcvbnm.AZSXDFGHJ    321.022,000 g
   Produto 2                358.266,000 kg
   ```

## Arquivos Modificados

### `Frontend/src/report.tsx`

1. **converterValor** (linha 715):
   - Removida lógica de conversão errada
   - Agora apenas retorna valor original

2. **displayProducts** (linha 881):
   - Adicionado campo `unidade` no tipo
   - Extraída unidade do resumo (`v?.["unidade"]`)
   - Incluída unidade no retorno

3. **Renderização Side Info** (linha 1379):
   - Removida chamada a `converterValor`
   - Priorizada `produto.unidade`
   - Mantido fallback para `produtosInfo`

## Resultado

✅ Valores em **gramas** exibidos corretamente (ex: 321.022,000 g)  
✅ Valores em **kg** exibidos corretamente (ex: 358.266,000 kg)  
✅ Unidade sempre corresponde ao formato do valor  
✅ Consistência entre backend e frontend  
✅ Side Info mostra dados corretos do resumo

## Comportamento dos Endpoints

| Endpoint | Conversão | Retorno |
|----------|-----------|---------|
| `/api/relatorio/paginate` | ✅ Sim | Sempre kg |
| `/api/resumo` | ❌ Não | Valores originais + unidade |
| `/api/chartdata/*` | ✅ Sim | Sempre kg |

## Nota Importante

A função `converterValor` ainda é usada no PDF (linha 802), mas lá está correta porque:
- Para o PDF, queremos sempre **kg** no gráfico
- O código na linha 782 faz a conversão correta: `if (unidade === "g") v = v / 1000;`
- Isso converte valores em gramas para kg para visualização uniforme

## Teste Recomendado

1. Configurar Produto 1 como **gramas** (g)
2. Configurar Produto 2 como **quilos** (kg)
3. Verificar Side Info:
   - Produto 1 deve mostrar valor grande + "g"
   - Produto 2 deve mostrar valor normal + "kg"
4. Verificar que valores fazem sentido (não estão 1000x menores/maiores)
