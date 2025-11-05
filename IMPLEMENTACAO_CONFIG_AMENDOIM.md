# Implementação: Configuração de IHM e Mapeamento de Balanças - Amendoim

## Resumo das Alterações

Sistema de configuração específico para o perfil de amendoim, permitindo:
1. Configuração de uma ou duas IHMs separadas
2. Escolha de qual CSV coletar (mensal ou geral) por entrada/saída
3. Mapeamento de balanças para entrada e saída
4. Coluna de balança adicionada nos registros e gráficos

## Alterações no Backend

### 1. Entidade Amendoim (`back-end/src/entities/Amendoim.ts`)
- ✅ Adicionada coluna `balanca` (opcional)
- Tipo: `varchar(10)`, nullable
- Armazena identificador da balança (ex: "1", "2", "9")

### 2. Serviço AmendoimService (`back-end/src/services/AmendoimService.ts`)
- ✅ Processamento atualizado para extrair coluna 9 (balança) do CSV
- Formato do CSV:
  ```
  Coluna 0: Data e Hora (DD-MM-YY HH:MM:SS)
  Coluna 1: Vazio
  Coluna 2: Código Produto
  Coluna 3: Código Caixa
  Coluna 4: Nome Produto
  Coluna 5-6: Vazios
  Coluna 7: Peso
  Coluna 8: Vazio
  Coluna 9: Balança ← NOVA
  ```
- Registro salvo com campo `balanca` populado

## Alterações no Frontend

### 3. Interface de Configuração (`Frontend/src/components/AmendoimConfig.tsx`)

#### Nova Interface de Configuração:
```typescript
interface AmendoimConfig {
  duasIHMs: boolean;
  entrada: {
    tipoRelatorio: "mensal" | "geral";
    mesAno?: string;
    nomeArquivo?: string;
  };
  saida: {
    tipoRelatorio: "mensal" | "geral";
    mesAno?: string;
    nomeArquivo?: string;
  };
  caminhoRemoto: string;
  ihm2?: {
    ip: string;
    user: string;
    password: string;
    caminhoRemoto: string;
    usadaPara: "entrada" | "saida";
  };
  mapeamentoBalancas?: {
    entrada: string[]; // Ex: ["1", "2", "3"]
    saida: string[]; // Ex: ["9", "10"]
  };
}
```

#### Seções da Interface:

1. **Sistema de IHMs**
   - Seleção: Uma IHM (mesma fonte) ou Duas IHMs (fontes separadas)
   - Se duas IHMs: configurar IP, usuário, senha e qual é usada (entrada/saída)

2. **Arquivo de ENTRADA** (fundo verde)
   - Tipo: Mensal ou Geral
   - Se mensal: seletor de mês/ano
   - Nome customizado opcional
   - Preview do arquivo que será coletado

3. **Arquivo de SAÍDA** (fundo azul)
   - Tipo: Mensal ou Geral
   - Se mensal: seletor de mês/ano
   - Nome customizado opcional
   - Preview do arquivo que será coletado

4. **Mapeamento de Balanças** (apenas quando Uma IHM) ← NOVO
   - **Balanças de Entrada** (fundo verde): campo de texto com IDs separados por vírgula
   - **Balanças de Saída** (fundo azul): campo de texto com IDs separados por vírgula
   - Nota explicativa sobre uso futuro em análises comparativas

5. **Resumo da Configuração**
   - Lista todos os parâmetros configurados
   - Exibe balanças mapeadas quando aplicável

#### Características do Design:
- ✅ Cores discretas e profissionais
- ✅ Ícones apenas quando relevantes
- ✅ Informações importantes destacadas sem exagero
- ✅ Layout limpo e organizado
- ✅ Aparência de sistema finalizado, não prototype

### 4. Tabela de Registros (`Frontend/src/amendoim.tsx`)

#### Nova Coluna "Balança":
- Posição: entre "Cód. Caixa" e "Nome do Produto"
- Largura: 80px
- Estilo: badge cinza com valor centralizado
- Exibe "-" quando não houver valor

#### Ordem das Colunas:
1. Dia (90px)
2. Hora (70px)
3. Cód. Produto (120px)
4. Cód. Caixa (120px)
5. **Balança (80px)** ← NOVA
6. Nome do Produto (250px)
7. Peso (kg) (120px)
8. Tipo (100px)

## Casos de Uso

### Caso 1: Uma IHM com CSV único
- Usuário configura tipo de relatório (mensal/geral) para entrada e saída
- Define quais balanças são entrada (ex: 1, 2, 3) e quais são saída (ex: 9, 10)
- Sistema coleta um CSV e separa dados por tipo baseado no arquivo configurado
- Futuramente: análises comparativas "entrada balanças 1,2,3 vs saída balanças 9,10"

### Caso 2: Duas IHMs separadas
- Usuário configura IHM principal e IHM secundária
- Define qual IHM é usada para entrada e qual para saída
- Sistema coleta dois CSVs diferentes
- Cada IHM tem seu próprio arquivo configurado

### Caso 3: Análises Futuras (preparado mas não implementado ainda)
- Sistema já armazena coluna `balanca` no banco
- Mapeamento salvo na configuração
- Pronto para filtros como:
  - "Rendimento de balanças de entrada [1,2,3] vs balanças de saída [9,10]"
  - "Eficiência por balança individual"
  - "Comparação entre balanças do mesmo tipo"

## Fluxo de Dados

```
CSV → Parse (coluna 9) → Entidade (campo balanca) → Banco de Dados
                                                            ↓
Frontend ← API ← Query com mapeamento de balanças ← Configuração
```

## Próximos Passos (Não Implementados)

1. **Filtros por Balança**
   - Adicionar filtro de balança na barra de filtros
   - Permitir seleção múltipla de balanças

2. **Análises Comparativas**
   - Endpoint `/api/amendoim/analise/balancas`
   - Aceitar parâmetros: `balancasEntrada` e `balancasSaida`
   - Retornar métricas comparativas

3. **Gráficos por Balança**
   - Gráfico de rendimento por balança individual
   - Gráfico comparativo entrada vs saída por conjunto de balanças
   - Timeline de atividade por balança

4. **Validação de Mapeamento**
   - Backend validar se balanças mapeadas existem nos dados
   - Alertar sobre balanças não encontradas
   - Sugestão automática baseada em dados reais

## Estrutura de Arquivos Modificados

```
back-end/
  src/
    entities/
      Amendoim.ts ← Adicionada coluna balanca
    services/
      AmendoimService.ts ← Processamento da coluna 9

Frontend/
  src/
    components/
      AmendoimConfig.tsx ← Nova seção de mapeamento + imports
    amendoim.tsx ← Nova coluna na tabela
```

## Compatibilidade

- ✅ Backward compatible: campo `balanca` é opcional
- ✅ Dados antigos continuam funcionando (balanca = null/undefined)
- ✅ Configurações antigas carregam com mapeamento vazio
- ✅ CSVs sem coluna 9 não geram erro

## Considerações de Design

A interface foi desenvolvida seguindo os princípios:
- **Minimalismo Profissional**: cores apenas onde necessário
- **Hierarquia Visual Clara**: seções bem definidas sem poluição
- **Feedback Imediato**: preview de arquivos gerados
- **Robustez**: tratamento de casos extremos
- **Escalabilidade**: preparado para análises futuras

---

**Status**: ✅ Implementado e pronto para testes
**Data**: 05/11/2025
**Perfil**: Amendoim
