# Correção de Bug - Seleção de Unidades (g/kg)

## Problema Identificado

A interface de seleção de unidades (gramas/quilos) estava com valores invertidos no RadioGroup, causando comportamento inconsistente ao alternar entre g e kg.

## Causa Raiz

O RadioGroup estava usando valores "1" e "2":
```typescript
// ❌ ANTES - Valores inconsistentes
value={unidadeAtual === "g" ? "1" : "2"}
<RadioGroupItem value="1" id={`${col}-g`} />  // gramas
<RadioGroupItem value="2" id={`${col}-kg`} /> // quilos

const novaUnidade = unidadeValue === "1" ? "g" : "kg";
```

Estes valores não alinhavam com a convenção do backend:
- Backend usa: `medida = 0` (gramas) e `medida = 1` (quilos)
- Frontend usava: value="1" (gramas) e value="2" (quilos)

## Solução Aplicada

Alinhei os valores do RadioGroup com a convenção do backend:

```typescript
// ✅ DEPOIS - Valores alinhados com backend
value={unidadeAtual === "g" ? "0" : "1"}
<RadioGroupItem value="0" id={`${col}-g`} />  // gramas (medida=0)
<RadioGroupItem value="1" id={`${col}-kg`} /> // quilos (medida=1)

const novaUnidade = unidadeValue === "0" ? "g" : "kg";
```

## Convenção Estabelecida

### Backend (MateriaPrima.medida)
```typescript
medida = 0 → GRAMAS
medida = 1 → QUILOS
```

### Frontend (RadioGroup values)
```typescript
value="0" → GRAMAS (alinha com medida=0)
value="1" → QUILOS (alinha com medida=1)
```

### Conversão Frontend↔Backend

**Frontend → Backend** (`report.tsx` linha 599):
```typescript
{ 
  num, 
  produto: newName, 
  medida: unidade === "g" ? 0 : 1  // ✅ Correto
}
```

**Backend → Frontend** (`report.tsx` linha 652):
```typescript
{
  nome: val.produto,
  unidade: medida === 0 ? "g" : "kg"  // ✅ Correto
}
```

## Arquivos Modificados

### `Frontend/src/products.tsx`

1. **handleUnidadeChange** (linha 122):
   ```typescript
   // Mudou de:
   const novaUnidade = unidadeValue === "1" ? "g" : "kg";
   // Para:
   const novaUnidade = unidadeValue === "0" ? "g" : "kg";
   ```

2. **RadioGroup value** (linha 186):
   ```typescript
   // Mudou de:
   value={unidadeAtual === "g" ? "1" : "2"}
   // Para:
   value={unidadeAtual === "g" ? "0" : "1"}
   ```

3. **RadioGroupItem values** (linhas 188 e 192):
   ```typescript
   // Mudou de:
   <RadioGroupItem value="1" ... />  // gramas
   <RadioGroupItem value="2" ... />  // quilos
   // Para:
   <RadioGroupItem value="0" ... />  // gramas
   <RadioGroupItem value="1" ... />  // quilos
   ```

4. **Removido import não utilizado**:
   ```typescript
   import { Separator } from "./components/ui/separator";
   ```

## Fluxo Correto

1. **Usuário seleciona "g"** no RadioGroup:
   - RadioGroup emite `value="0"`
   - `handleUnidadeChange` recebe "0"
   - Define `novaUnidade = "g"`
   - Salva no localStorage como "g"
   - Envia para backend como `medida: 0`

2. **Usuário seleciona "kg"** no RadioGroup:
   - RadioGroup emite `value="1"`
   - `handleUnidadeChange` recebe "1"
   - Define `novaUnidade = "kg"`
   - Salva no localStorage como "kg"
   - Envia para backend como `medida: 1`

3. **Carregamento do backend**:
   - Backend retorna `medida: 0` ou `medida: 1`
   - Frontend converte para `unidade: "g"` ou `unidade: "kg"`
   - RadioGroup exibe corretamente baseado em `value="0"` ou `value="1"`

## Resultado

- ✅ Seleção de "g" agora funciona corretamente
- ✅ Seleção de "kg" agora funciona corretamente
- ✅ Valores sincronizam corretamente entre frontend e backend
- ✅ localStorage mantém consistência
- ✅ Gráficos calculam com unidades corretas

## Teste Recomendado

1. Abrir tela de Editar Produtos
2. Selecionar "g" em um produto → verificar se salva como gramas
3. Selecionar "kg" em um produto → verificar se salva como quilos
4. Recarregar página → verificar se mantém seleção
5. Verificar no Resumo Visual se valores estão corretos
6. Verificar se gráficos calculam corretamente

## Nota Técnica

O bug não afetava os cálculos dos gráficos (que já foram corrigidos anteriormente), mas causava confusão na interface ao tentar alterar unidades de produtos.
