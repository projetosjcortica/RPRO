# Correções de Conversão de Gramas para Quilos - Gráficos

## Problema Identificado

Os gráficos não estavam calculando os valores corretamente a partir das gramas. Alguns endpoints estavam usando valores brutos sem converter de gramas para quilos, causando discrepâncias nos gráficos.

## Endpoints Corrigidos

### ✅ 1. `/api/chartdata/semana` (GET)
**Antes:** Usava `r.Form1` (código da fórmula) ao invés de somar produtos  
**Depois:** Calcula soma de todos os produtos (Prod_1 a Prod_40) convertendo gramas→kg

```typescript
// Agora calcula corretamente por linha:
for (let i = 1; i <= 40; i++) {
  const raw = r[`Prod_${i}`];
  const mp = materiasByNum[i];
  if (mp && Number(mp.medida) === 0) {
    rowTotalKg += raw / 1000; // g → kg
  } else {
    rowTotalKg += raw; // já em kg
  }
}
```

### ✅ 2. `/api/chartdata/semana/bulk` (POST)
**Antes:** Usava `r.Form1` (código da fórmula) ao invés de somar produtos  
**Depois:** Mesma lógica de conversão aplicada ao endpoint GET

### ✅ 3. `/api/chartdata/stats` (GET)
**Antes:** Usava `r.Form1` (código) sem normalização  
**Depois:** Calcula total geral normalizando produtos de gramas→kg

```typescript
// Estatísticas agora refletem peso real:
totalGeralKg += rowTotalKg; // soma normalizada em kg
average: totalGeralKg / rows.length // média em kg
```

## Endpoints Já Corretos (Sem Alteração)

### ✅ `/api/relatorio/paginate` (GET)
- Conversão implementada corretamente desde o início
- Normaliza valores no mapeamento de rows

### ✅ `/api/chartdata` (GET)
- Apenas retorna valores brutos com unidades
- Frontend é responsável pela conversão

### ✅ `/api/chartdata/formulas` (GET)
- Já calculava corretamente com conversão g→kg

### ✅ `/api/chartdata/produtos` (GET)
- Já convertia: `valueKg = unit === "g" ? value / 1000 : value`

### ✅ `/api/chartdata/horarios` (GET)
- Já calculava totais por hora com conversão g→kg

### ✅ `/api/chartdata/diasSemana` (GET)
- Já calculava totais por dia da semana com conversão g→kg

## Serviço de Resumo

### ⚠️ `resumoService.ts`
**Status:** Parcialmente correto

**Correto:**
- `totalPesos`: Soma normalizada em kg ✅
- Lógica de conversão por produto implementada ✅

**Observação:**
- `usosPorProduto`: Mantém valores originais (g ou kg) com unidade especificada
- Isso é intencional para exibição, mas pode ser ajustado se necessário

## Regra de Conversão Aplicada

```typescript
// Para cada produto (Prod_1 a Prod_40):
const materia = materiasByNum[i];

if (materia && Number(materia.medida) === 0) {
  // medida === 0 significa GRAMAS no banco
  valueKg = valueOriginal / 1000;
} else {
  // medida === 1 ou outro significa KG
  valueKg = valueOriginal;
}
```

## Resultado Esperado

### Antes:
- Gráfico de semana mostrava códigos de fórmula (ex: 1, 2, 3)
- Estatísticas não refletiam peso real
- Valores inconsistentes entre diferentes gráficos

### Depois:
- Gráfico de semana mostra peso total em kg corretamente
- Estatísticas calculam soma real de produtos
- Todos os gráficos normalizados para kg
- Consistência entre todos os endpoints

## Teste Recomendado

1. **Gráfico de Semana:**
   - Verificar se mostra valores em kg (não códigos)
   - Comparar com soma manual dos produtos

2. **Estatísticas Gerais:**
   - Verificar se totalGeral corresponde à soma de produtos
   - Verificar se average faz sentido

3. **Gráficos de Produtos:**
   - Todos devem mostrar valores em kg
   - Comparar valores entre diferentes visualizações

## Arquivos Modificados

1. `back-end/src/index.ts`
   - `/api/chartdata/semana` (linha ~3086)
   - `/api/chartdata/stats` (linha ~2969)
   - `/api/chartdata/semana/bulk` (linha ~3266)

## Impacto

- ✅ Correção de bug crítico nos gráficos
- ✅ Valores consistentes em toda aplicação
- ✅ Normalização correta de unidades
- ✅ Sem breaking changes (frontend não precisa alteração)
- ✅ Performance mantida (cache continua funcionando)

## Notas Técnicas

- A conversão só acontece quando `materia.medida === 0` (gramas)
- Produtos sem configuração de matéria-prima são tratados como kg
- Cache invalida automaticamente após 10 minutos
- Valores retornados sempre em kg para gráficos
