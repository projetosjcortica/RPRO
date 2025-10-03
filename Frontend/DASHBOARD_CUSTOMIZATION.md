# Sistema de Personalização do Dashboard

## 📊 Visão Geral

O dashboard agora possui um sistema completo de personalização que permite aos usuários configurar quais elementos desejam visualizar e customizar a aparência.

## 🎨 Funcionalidades Implementadas

### 1. **Tooltip Melhorado**
- ✅ **Informações Detalhadas**: Mostra nome do item, valor em kg e porcentagem do total
- ✅ **Design Profissional**: Card branco com sombra, bordas e espaçamento adequado
- ✅ **Total Consolidado**: Quando há múltiplos itens, exibe o total geral
- ✅ **Formatação BR**: Valores formatados em pt-BR com 2 casas decimais

**Exemplo de Tooltip:**
```
┌─────────────────────────────┐
│ Produto 1                   │
├─────────────────────────────┤
│ ● Produção                  │
│   1,234.56 kg               │
│   23.4% do total            │
│                             │
│ Total: 5,280.00 kg          │
└─────────────────────────────┘
```

### 2. **Total Geral de Dados**
- ✅ **Card Atualizado**: Mostra "Total Geral" em vez de apenas "Total"
- ✅ **Cálculo Global**: Soma TODOS os registros (não apenas fórmulas)
- ✅ **Contador de Registros**: Exibe quantidade total de entries
- ✅ **Informação Adicional**: Card de "Fórmulas Únicas" mostra quantidade de fórmulas e batidas

**Estrutura dos Cards:**
```
┌─────────────────┬─────────────────┐
│ Total Geral     │ Fórmulas Únicas │
│ 12,345.67 kg    │ 8               │
│ 150 registros   │ 42 batidas      │
└─────────────────┴─────────────────┘
```

### 3. **Sistema de Personalização**

#### Acesso
Clique no botão **"⚙️ Personalizar Dashboard"** no canto superior direito.

#### Opções Disponíveis

##### **Gráfico Donut** 🍩
- **Descrição**: Análise de dados em pizza
- **Toggle**: On/Off
- **Localização**: Coluna esquerda (topo)
- **Tipos disponíveis**: Fórmulas, Produtos, Horários, Dias da Semana

##### **Gráfico Semanal** 📅
- **Descrição**: Produção por semana
- **Toggle**: On/Off
- **Localização**: Coluna esquerda (baixo)
- **Funcionalidades**: Navegação entre semanas (◄ ►)

##### **Painel Principal** 📈
- **Descrição**: Análise detalhada customizável
- **Toggle**: On/Off
- **Localização**: Coluna central
- **Tipos**: Fórmulas, Produtos, Horários, Dias da Semana
- **Gráfico**: Barras com tooltip detalhado

##### **Cards de Estatísticas** 📊
- **Descrição**: Total geral e fórmulas únicas
- **Toggle**: On/Off
- **Localização**: Topo da coluna central
- **Informações**: Total kg, registros, fórmulas, batidas

##### **Esquema de Cores** 🎨
- **Padrão (Vermelho)**: Cores originais (#ff2626ff)
- **Escuro**: Tema escuro (em desenvolvimento)
- **Claro**: Tema claro (em desenvolvimento)

## 💾 Persistência de Dados

### LocalStorage
Todas as configurações são salvas automaticamente no `localStorage` do navegador:

```typescript
localStorage.setItem("dashboardConfig", JSON.stringify({
  showDonutChart: true,
  showWeeklyChart: true,
  showMainPanel: true,
  showStats: true,
  colorScheme: "default"
}));
```

### Carregamento Automático
Ao recarregar a página, as configurações são restauradas automaticamente.

## 🔧 Layout Responsivo

O grid se adapta automaticamente baseado nos elementos visíveis:

### Todos os elementos ativos:
```
┌──────────┬─────────────┬─────────┐
│ Donut    │ Stats       │ Filtros │
│ (4 cols) │ (5 cols)    │ (3 cols)│
│          │             │         │
│ Weekly   │ Main Panel  │         │
└──────────┴─────────────┴─────────┘
```

### Sem coluna esquerda:
```
┌───────────────────┬─────────┐
│ Stats             │ Filtros │
│ (8 cols)          │ (4 cols)│
│                   │         │
│ Main Panel        │         │
└───────────────────┴─────────┘
```

### Sem coluna esquerda ou stats:
```
┌─────────────────────┬─────────┐
│ Main Panel          │ Filtros │
│ (8 cols)            │ (4 cols)│
│                     │         │
│                     │         │
└─────────────────────┴─────────┘
```

## 🎯 Casos de Uso

### Usuário quer apenas análise detalhada:
1. Desabilitar Gráfico Donut
2. Desabilitar Gráfico Semanal
3. Manter Painel Principal e Filtros
4. Resultado: Tela focada em análise customizável

### Usuário quer visão geral rápida:
1. Manter Gráfico Donut
2. Manter Cards de Stats
3. Desabilitar Painel Principal
4. Desabilitar Gráfico Semanal
5. Resultado: Dashboard minimalista

### Usuário quer análise temporal:
1. Manter Gráfico Semanal
2. Manter Painel Principal (tipo: Dias da Semana)
3. Manter Cards de Stats
4. Resultado: Foco em análise temporal

## 📝 Exemplos de Código

### Acessar configuração:
```typescript
const config = JSON.parse(localStorage.getItem("dashboardConfig"));
console.log(config.showDonutChart); // true/false
```

### Atualizar configuração:
```typescript
updateConfig({ showDonutChart: false });
```

### Resetar para padrão:
```typescript
localStorage.removeItem("dashboardConfig");
// Recarregar página
```

## 🚀 Próximas Melhorias Sugeridas

- [ ] Implementar esquemas de cores (dark/light)
- [ ] Adicionar mais tipos de gráficos (linha, área, scatter)
- [ ] Permitir reordenar elementos (drag & drop)
- [ ] Exportar/importar configurações
- [ ] Salvar múltiplos layouts (perfis)
- [ ] Adicionar temas customizados por usuário
- [ ] Dashboard fullscreen mode
- [ ] Widget de comparação de períodos

## 🐛 Troubleshooting

### Configurações não salvam:
- Verificar se localStorage está habilitado no navegador
- Limpar cache e cookies
- Verificar console para erros

### Layout quebrado:
- Resetar configurações: `localStorage.removeItem("dashboardConfig")`
- Recarregar página com Ctrl+F5

### Gráficos não aparecem:
- Verificar se os toggles estão ON
- Verificar se há dados disponíveis
- Verificar filtros aplicados

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar esta documentação
2. Limpar localStorage e testar novamente
3. Reportar issue com screenshot e configuração usada
