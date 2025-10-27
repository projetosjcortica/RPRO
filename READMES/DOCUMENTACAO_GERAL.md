# RPRO — Documentação Geral de Funcionalidades (Versão Atual)

Este documento descreve, de forma formal e detalhada, todas as funcionalidades implementadas no sistema RPRO na versão atual, abrangendo arquitetura, fluxos, APIs, telas e operações administrativas. Serve de base para geração de um PDF técnico de produto.


## 1. Visão Geral

- Plataforma: Desktop (Electron) com frontend em React + Vite e backend em Node.js (Express + TypeORM).
- Banco de dados: SQLite por padrão; alterna para MySQL quando variáveis de ambiente MySQL são fornecidas.
- Domínio do produto: Ingestão de dados de produção (CSV/FTP), processamento em relatórios, estoque e matérias-primas, com exportação (PDF/Excel) e recursos administrativos.


## 2. Arquitetura

- Frontend
  - Framework: React + TypeScript + Vite, empacotado com Electron.
  - Roteamento: SPA via HashRouter.
  - Comunicação com backend: wrappers HTTP em `Processador`.
  - UI: componentes shadcn/Radix, ícones Lucide.

- Backend
  - Framework: Express (rotas definidas em `back-end/src/index.ts`).
  - ORM: TypeORM (entidades em `back-end/src/entities`).
  - Serviços principais: coletor (FTP/IHM), parser CSV, persistência, cache, exportadores (Excel/SQL), conversores de dump.

- Electron
  - Arquivos principais em `Frontend/dist-electron` e `Frontend/electron`.
  - Preload com `electronAPI` para ponte renderer ↔ main.


## 3. Dados e Modelagem

Entidades principais (TypeORM):
- `Relatorio` e `Row`: base de relatórios de produção (linhas detalhadas).
- `MateriaPrima`: catálogo de matérias-primas/produtos (colunas dinâmicas “Form1…n”).
- `Batch`: vinculação de lotes.
- `Estoque` e `MovimentacaoEstoque`: controle de estoque e movimentações.
- `User`: usuários e perfis.
- `Setting`: configurações persistentes (runtime configs).
- `CacheFile`: metadados de cache para ingestão/backup.

Convenções:
- Datas ISO (YYYY-MM-DD) entre backend/DB; conversores no frontend para exibição.
- Colunas dinâmicas de produto/fórmula mapeadas pelo backend como arrays e projetadas no frontend como `col{index}`.


## 4. Funcionalidades do Frontend

### 4.1. Tela de Relatórios
- Paginação via hook `useReportData` (consome `/api/relatorio/paginate`).
- Exibição tabular com colunas dinâmicas.
- Ações de exportação (PDF/Excel) via dropdown.

### 4.2. Exportação de Relatórios
- Excel: endpoint `/api/relatorio/exportExcel` com filtros opcionais (`dataInicio`, `dataFim`, `formula`).
- PDF:
  - Pré-visualização com `PDFViewer` (renderização com `@react-pdf/renderer`).
  - Opções de exibição (mostrar/ocultar comentários e gráficos).
  - Inclusão de gráficos de resumo (melhoria de legibilidade em donut e paleta de cores otimizadas).

### 4.3. Perfil e Identidade Visual
- Upload de foto do usuário com botão estilizado.
- Definição automática da imagem como logo padrão dos relatórios.

### 4.4. Configurações (Config)
- Seções:
  - Perfil (Geral): nome da empresa, avatar/logo.
  - IHM: IP, usuário, senha, configuração de envio/ingestão CSV; método CSV (Único/Mensal) e “Habilitar CSV”.
  - Banco de Dados: servidor, database, usuário e senha (quando aplicável a MySQL).
  - Administrativo:
    - Seletores de arquivos: local de SQL/DUMP/BATCH.
    - Importar Dump SQL (modal com duas opções: “Adicionar aos existentes” ou “Limpar e importar”).
    - Exportar Dump SQL (download automático com cabeçalhos adequados).
    - Resetar Sistema (modal de confirmação; preserva usuários e configurações, limpa dados de produção e cache).


## 5. Funcionalidades do Backend

### 5.1. Ingestão de CSV (Pipeline)
- Coletor: `collector/startCollector` aciona `IHMService.findAndDownloadNewFiles()` em loop.
- Cada arquivo: backup (`BackupService`) → parser (`parserService`) → persistência (`fileProcessorService` → entidades TypeORM).
- Metadados/estado: `cacheService` (tocar ao alterar semântica de ingestão).
- Controle do coletor via endpoints `/api/collector/{start,stop,status}`.

### 5.2. Configurações em Tempo de Execução
- Endpoints `/api/config`:
  - `GET /api/config/:key` (carrega por chave; ex.: `ihm-config`, `db-config`, `admin-config`, `profile-config`).
  - `POST /api/config/split` (persistência granular por chave/payload).
- Persistência em `Setting` (via `setRuntimeConfigs`/`getRuntimeConfig`).

### 5.3. Exportação Excel
- Geração via endpoint `/api/relatorio/exportExcel` com filtros.
- Arquivo `.xlsx` retornado como binário para download.

### 5.4. Exportação de SQL Dump
- Rota: `GET /api/db/export-sql`.
- Implementação: `dbService.exportSqlDump()` gera INSERTs por tabela com dados.
- Características:
  - Inclui cabeçalhos, desabilita/reabilita foreign keys quando necessário.
  - Escapa strings; converte `Date` para `YYYY-MM-DD`.
  - Gera arquivo em diretório configurado (`dumpDir` via config/env) e o envia como download.

### 5.5. Importação de SQL Dump
- Rota: `POST /api/db/import-legacy` (upload `multipart/form-data` campo `dump`, limite 50MB).
- Recursos:
  - Detecção e conversão automática de datas legadas (DD/MM/YY → YYYY-MM-DD) apenas quando necessário.
  - Sanitização robusta para compatibilidade MySQL/SQLite:
    - Remove `DROP TABLE`, simplifica/ignora constraints potencialmente conflituosas.
    - Ajusta `CREATE TABLE` (com `IF NOT EXISTS`, quando aplicável).
    - Remove sintaxe específica de engine/charset.
  - Opções por query string:
    - `clearBefore=true|false` (limpar dados antes de importar).
    - `skipCreateTable=true|false` (pular `CREATE TABLE` e usar schema existente).
  - Execução resiliente: continua mesmo com falhas de alguns statements (a menos que `failOnError=true`).
- Resposta inclui estatísticas: `statementsExecuted`, `statementsFailed`, `warnings`, flags de conversão/sanitização.

### 5.6. Limpeza de Dados (Reset)
- Operação de limpeza abrangente de dados de produção/estoque/movimentações e cache, preservando usuários e configurações.
- Em MySQL: uso de `SET FOREIGN_KEY_CHECKS=0/1`; em SQLite: `PRAGMA foreign_keys = OFF/ON` para permitir truncamento/limpeza segura (
  ver `dbService.clearAll()`).


## 6. UI/UX e Componentes-Chave

- `ExportDropdown`: menu de exportação com modais para PDF/Excel.
- Modal de Importação de Dump: duas ações principais (“Adicionar” e “Limpar e importar”), descrição clara e fluxo visual consistente com modal de reset.
- `Profile`: upload de imagem refinado e definição imediata como logo padrão.
- `report.tsx`: tela central de relatórios integrando paginação, filtros e exportações.


## 7. Endpoints Principais (Resumo)

- Coletor
  - `GET /api/collector/status`
  - `POST /api/collector/start`
  - `POST /api/collector/stop`

- Config
  - `GET /api/config/:key?inputs=true`
  - `POST /api/config/split`

- Relatórios
  - `GET /api/relatorio/paginate` (consumido pelo frontend)
  - `GET /api/relatorio/exportExcel` (gera `.xlsx`)

- Dumps
  - `POST /api/db/import-legacy?clearBefore={bool}&skipCreateTable={bool}` (upload `dump`)
  - `GET /api/db/export-sql` (download `.sql`)

- Limpeza/Reset (dependendo da configuração atual do projeto)
  - `POST /api/clear/production` (reset de produção, preservando usuários/configs)
  - Outras rotas auxiliares podem existir para limpeza de cache/DB interno.


## 8. Fluxos Operacionais

### 8.1. Exportar Relatório
1. Usuário abre tela de relatório.
2. Seleciona filtros (opcional).
3. Abre dropdown → PDF ou Excel.
4. Para PDF: visualiza preview, ajusta opções (comentários/gráficos) e exporta.
5. Para Excel: realiza download direto.

### 8.2. Importar Dump SQL
1. Admin acessa Configurações → Administrativas.
2. Clica em “Importar”.
3. No modal, escolhe:
   - Adicionar aos existentes (não limpa dados), ou
   - Limpar e importar (recomendado para dump completo).
4. Seleciona arquivo `.sql/.dump`.
5. Sistema converte datas legadas (se houver), sanitiza SQL e executa.
6. Exibe estatísticas e warnings.

### 8.3. Exportar Dump SQL
1. Admin acessa Configurações → Administrativas.
2. Clica em “Exportar”.
3. Sistema gera dump e inicia download com nome padronizado (timestamp).

### 8.4. Resetar Sistema
1. Admin aciona o modal “Resetar Sistema”.
2. Confirma a operação.
3. Backend limpa dados de produção, reconfigura matérias-primas padrão, limpa caches e preserva usuários/configurações.


## 9. Segurança e Robustez

- Uploads com limite de 50MB e extensão controlada (`.sql`, `.dump`).
- Sanitização de SQL de importação para proteção e compatibilidade.
- Desabilitação temporária de constraints para operações de limpeza controladas (com reabilitação ao final).
- Tratamento de erros com logging detalhado no backend; mensagens objetivas no frontend (toast).


## 10. Build, Execução e Distribuição

- Desenvolvimento
  - Frontend: `npm run dev` em `Frontend/` (HMR).
  - Backend: `npm run dev` em `back-end/`.
  - Script combinado opcional (`dev.sh`) quando disponível.

- Build
  - Frontend: `npm run build`.
  - Backend: `npm run build` (TypeScript → JS).

- Distribuição (Electron)
  - Empacotamento: `npm run dist` em `Frontend/`.
  - Artefatos em `Frontend/release/` (inclui instalador `.exe`).


## 11. Testes

- Backend: Jest (testes existentes principalmente para conversão de dump e datas legadas).
- Recomenda-se validar:
  - Conversão de datas (limiar 49/50).
  - Importação de dumps parciais/completos e reimportação de dump exportado.
  - Exportações PDF/Excel em filtros distintos.


## 12. Troubleshooting (Resumo)

- 404 ao exportar dump: reinicie o backend após alterações; confirme rota `/api/db/export-sql` ativa.
- 500 ao importar com “limpar”: verificado e corrigido com desabilitação temporária de FKs durante `clearAll()`.
- Dumps muito grandes: validar em ambiente local; considerar dividir por tabela.
- Duplicatas na importação: preferir “Limpar e importar” para dumps completos.


## 13. Roadmap Sugerido

- Enriquecimento de testes automatizados (e2e para import/export e collector).
- Tela de auditoria de importação (exibir statements falhos e warnings detalhados).
- Melhorias no schema exportado (opcionalmente gerar `CREATE TABLE`).
- Parâmetros avançados no export Excel (colunas dinâmicas selecionáveis).


## 14. Referências

- Backend
  - `back-end/src/index.ts` (rotas)
  - `back-end/src/services/dbService.ts` (execução SQL, exportação, limpeza)
  - `back-end/src/services/dumpConverterService.ts` (conversão de datas e sanitização)
  - `back-end/src/entities/*` (modelos TypeORM)

- Frontend
  - `Frontend/src/report.tsx` (relatórios)
  - `Frontend/src/components/ExportDropdown.tsx` (exportações)
  - `Frontend/src/config.tsx` (configurações e modais)
  - `Frontend/dist-electron/preload.mjs` (ponte Electron)

- Documentos auxiliares
  - `DUMP_SYSTEM_V2.md` (detalhes do sistema de dump)
  - `back-end/ARCHITECTURE.md`, `back-end/DOCS.md` (quando aplicável)


---

Versão do documento: 1.0  
Baseado na branch: `dev`  
Data: 2025-10-09
