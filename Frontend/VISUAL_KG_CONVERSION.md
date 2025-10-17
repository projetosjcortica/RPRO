# Atualização - Conversão Visual de Gramas para Quilos

## Alteração Solicitada

Converter valores em **gramas para quilos APENAS para exibição**, sempre mostrando em kg independente da configuração do produto.

## Comportamento Anterior

- Produtos em gramas: exibiam valor em gramas com unidade "g"
- Produtos em kg: exibiam valor em kg com unidade "kg"
- Exemplo: `321.022,000 g` e `358.266,000 kg`

## Comportamento Novo

- **TODOS os produtos** exibem em **kg**
- Produtos configurados em gramas: **divide por 1000** antes de exibir
- Exemplo: `321.022 g` → `0.321 kg` (exibido como `0,321 kg`)

## Implementação

### 1. Side Info - Tabela de Produtos (`report.tsx`)

**Localização:** Linha ~1371

**Antes:**
```typescript
{Number(produto.qtd).toLocaleString("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})}{" "}
{produto.unidade || "kg"}
```

**Depois:**
```typescript
{(() => {
  const unidade = produto.unidade ||
    (produto.colKey && produtosInfo[produto.colKey]?.unidade) ||
    "kg";
  // Se for gramas, dividir por 1000 para exibir em kg
  const valorExibicao = unidade === "g" 
    ? produto.qtd / 1000 
    : produto.qtd;
  
  return (
    <>
      {Number(valorExibicao).toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })}{" "}
      kg
    </>
  );
})()}
```

### 2. ProductsTable Component (`components/ProductsTable.tsx`)

**Localização:** Linha ~107

**Antes:**
```typescript
{Number(converterValor(Number(produto.qtd), produto.colKey)).toLocaleString("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})} {(produto.colKey && produtosInfo[produto.colKey]?.unidade) || "kg"}
```

**Depois:**
```typescript
{Number(produto.qtd).toLocaleString("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})} kg
```

**Nota:** Removida função `converterValor` e estado `produtosInfo` não utilizados, pois `/api/chartdata/produtos` já retorna tudo em kg.

## Lógica de Conversão

```typescript
// Backend retorna:
// - /api/resumo: valores originais (g se medida=0, kg se medida=1)
// - /api/chartdata/produtos: sempre em kg

// Frontend exibe:
if (unidade === "g") {
  valorExibicao = valorOriginal / 1000; // converter g → kg
} else {
  valorExibicao = valorOriginal; // já em kg
}

// Sempre mostra: "{valorExibicao} kg"
```

## Exemplos de Conversão

| Produto | Config | Valor Backend | Cálculo | Exibição |
|---------|--------|---------------|---------|----------|
| Prod1 | g | 321.022,000 g | 321022 ÷ 1000 | 321,022 kg |
| Prod2 | kg | 358,266 kg | 358.266 | 358,266 kg |
| Prod3 | g | 234.387,000 g | 234387 ÷ 1000 | 234,387 kg |

## Arquivos Modificados

### `Frontend/src/report.tsx`

1. **Linha ~1371** - Side Info Produtos:
   - Adicionada lógica IIFE para calcular valorExibicao
   - Divide por 1000 se unidade === "g"
   - Sempre exibe "kg" ao final

### `Frontend/src/components/ProductsTable.tsx`

1. **Removido (linhas 9-26)**:
   - Estado `produtosInfo` não utilizado
   - useEffect de fetch de produtos não utilizado
   - Função `converterValor` não utilizada

2. **Simplificado (linha ~47)**:
   - Comentário adicionado: "Backend /api/chartdata/produtos já retorna tudo em kg"

3. **Linha ~107**:
   - Removida chamada a `converterValor`
   - Sempre exibe "kg" fixo

## Benefícios

✅ **Padronização**: Todos os valores sempre em kg  
✅ **Simplicidade**: Usuário não precisa converter mentalmente  
✅ **Consistência**: Gráficos e tabelas usam mesma unidade  
✅ **Clareza**: Facilita comparação entre produtos  

## Observações

- **Total Geral** já estava em kg (correto)
- **Gráficos** já estavam em kg (correto)
- **Fórmulas** sempre em kg (correto)
- **PDF** continua mostrando em kg nos gráficos (correto)

## Teste Recomendado

1. Configurar produto com unidade **gramas**
2. Ver no Side Info se valor é dividido por 1000
3. Confirmar que mostra "kg" ao lado
4. Verificar que valor faz sentido (ex: 300.000 g → 300 kg)

## Resultado Final

```
Antes:
Prod2xcvbnm.AZSXDFGHJ    321.022,000 g
Produto 2                358.266,000 kg

Agora:
Prod2xcvbnm.AZSXDFGHJ    321,022 kg
Produto 2                358,266 kg
```

Todos os produtos sempre exibidos em **kg**, facilitando leitura e comparação.
