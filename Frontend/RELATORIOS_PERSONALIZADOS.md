# Sistema de Relatórios Personalizados

## Visão Geral

O sistema de relatórios personalizados permite criar PDFs totalmente customizados com logos, gráficos e informações detalhadas. Este sistema substitui a funcionalidade básica de PDF anterior, oferecendo muito mais flexibilidade e recursos.

## Como Funciona

### 1. Redirecionamento Automático
- Quando você clica em qualquer botão de "PDF" ou "Relatório" no sistema, será automaticamente redirecionado para a página de Relatórios Personalizados
- Seus dados são preservados e carregados automaticamente na nova página
- Funciona nas páginas:
  - **Relatórios** (`/report`) - Botão "Relatório Personalizado"
  - **Dashboard** (`/home`) - Botão "Criar Relatório Personalizado"

### 2. Funcionalidades Disponíveis

#### 📊 **Configuração de Elementos**
- **Logo da Empresa**: Upload via drag-and-drop ou seleção de arquivo
- **Informações dos Produtos**: Tabela com nomes, quantidades e unidades
- **Total de Produção**: Resumo com produção total do período
- **Gráficos**: Múltiplos gráficos configuráveis

#### 📈 **Tipos de Gráficos Suportados**
- **Pizza** (Pie Chart) - Para distribuição de produtos
- **Barras** (Bar Chart) - Para comparação de valores
- **Linha** (Line Chart) - Para tendências temporais
- **Área** (Area Chart) - Para volumes ao longo do tempo

#### ⚙️ **Configurações Avançadas**
- **Períodos**: hoje, ontem, semana, mês
- **Títulos personalizados** para cada gráfico
- **Descrição** do relatório
- **Preview em tempo real** na lateral direita

### 3. Interface

```
┌─────────────────────┬─────────────────────┐
│                     │                     │
│   CONFIGURAÇÃO      │      PREVIEW        │
│                     │                     │
│  • Logo             │  [Visualização do   │
│  • Elementos        │   relatório em      │
│  • Gráficos         │   tempo real]       │
│  • Períodos         │                     │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

## Fluxo de Uso

1. **Acesso via Redirecionamento**:
   ```
   Página Relatórios → Clique "Relatório Personalizado" → Redirecionamento automático
   Dashboard → Clique "Criar Relatório Personalizado" → Redirecionamento automático
   ```

2. **Configuração Manual**:
   ```
   Menu → Relatórios Personalizados → Configurar manualmente
   ```

3. **Processo de Criação**:
   ```
   1. Configurar elementos (logo, produtos, gráficos)
   2. Visualizar preview em tempo real
   3. Ajustar configurações conforme necessário
   4. Gerar PDF final
   ```

## Componentes Técnicos

### Principais Arquivos
- `CustomReports.tsx` - Página principal
- `ReportConfig.tsx` - Painel de configuração
- `ReportPreview.tsx` - Preview em tempo real  
- `CustomPdf.tsx` - Geração do PDF customizado
- `usePDFRedirect.tsx` - Hook para redirecionamentos
- `PDFMigrationNotice.tsx` - Aviso de transição

### Integração com Sistema Existente
- **Dados preservados**: Filtros, resumos, informações de produtos
- **Contexto mantido**: Dashboard vs. Relatórios
- **Toast notifications**: Feedback visual das transições
- **LocalStorage**: Transferência segura de dados entre páginas

## Benefícios

### 🎯 **Para o Usuário**
- Interface intuitiva com preview em tempo real
- Controle total sobre o conteúdo do relatório
- Múltiplos gráficos e períodos configuráveis
- Logo personalizada da empresa

### 🔧 **Para o Sistema**
- Redirecionamento transparente - usuário não perde dados
- Código modular e extensível
- Compatibilidade com sistema existente
- Fácil manutenção e adição de novos recursos

## Exemplo de Uso

1. **No Dashboard**, usuário vê gráficos interessantes dos últimos 7 dias
2. Clica em **"Criar Relatório Personalizado"**
3. É redirecionado para `/custom-reports` com **dados já carregados**
4. Sistema mostra **aviso azul** explicando a nova funcionalidade
5. Usuário adiciona **logo da empresa**
6. Configura **2 gráficos**: um de pizza (hoje) e um de barras (semana)
7. Vê o **preview em tempo real** na lateral direita
8. Clica **"Gerar PDF"** e recebe arquivo personalizado

## Migração do Sistema Antigo

O sistema anterior gerava PDFs básicos com dados fixos. O novo sistema mantém **100% de compatibilidade** mas oferece:
- ✅ Redirecionamento automático (sem perda de dados)
- ✅ Notificação visual da transição  
- ✅ Dados pré-carregados na nova interface
- ✅ Fallback para criação manual se necessário

## Futuras Expansões

- **Novos tipos de gráficos** (radar, scatter, etc.)
- **Templates de relatório** salvos
- **Agendamento automático** de relatórios
- **Exportação para múltiplos formatos** (Excel, Word)
- **Compartilhamento direto** via email