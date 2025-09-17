 # Documentação do Projeto (inicial)

 Resumo curto

 Este backend automatiza a coleta de arquivos CSV de um IHM via FTP, processa os dados, realiza backups locais e persiste registros na tabela `Relatorio` usando TypeORM. Também fornece uma API Express para consultas e upload manual de arquivos.

 Como executar localmente

 1. Copie `.env.example` para `.env` e preencha as variáveis necessárias (conexão com DB, credenciais do IHM, porta, etc.).
 2. Instale dependências:

	 ```bash
	 npm install
	 ```

 3. Build (opcional):

	 ```bash
	 npm run build
	 ```

 4. Inicie o servidor:

	 ```bash
	 npm start
	 ```

 5. Em desenvolvimento, execute:

	 ```bash
	 npm run dev
	 ```

 Testes

 - Testes unitários: `npm test`
 - Testes de integração com IHM só serão executados quando `RUN_IHM_INTEGRATION=true`.

Banco de backup local (opcional)

Este repositório suporta armazenar um backup local em SQLite (`local_backup.sqlite`) que pode ser usado para popular o banco principal posteriormente. As opções relevantes:

- `LOCAL_BACKUP_DB_PATH`: caminho para o arquivo SQLite local (padrão `./local_backup.sqlite`).
- `BACKUP_WRITE_FILES`: se `false`, o serviço de backup evita criar cópias de trabalho locais e tenta manter apenas metadados; padrão `true` (escreve arquivos em `backups/`).

Comportamento esperado desejado pelo pedido:

- Ao baixar arquivos do IHM, o sistema só fará o download se os critérios forem atendidos (hash/diferença). Não mantenha cópias locais adicionais além do backup necessário.
- Se `BACKUP_WRITE_FILES=false`, o serviço evitará criar workdir locais e só gravará o backup final quando possível; se o filesystem não permitir, gravará apenas metadados.


 Principais arquivos

 - `src/services/parserService.ts` — parser canônico de CSVs
 - `src/services/IHMService.ts` — integração FTP
 - `src/services/backupService.ts` — armazenamento de backups
 - `src/services/fileProcessorService.ts` — mapeamento para `Relatorio` e persistência

 Próximos passos recomendados

 - Extrair e aplicar as interfaces de serviços definidas em `src/types/services.ts` para permitir injeção de dependência completa.
 - Documentar os endpoints do Express com exemplos (ou gerar OpenAPI/Swagger).
 - Adicionar um pipeline de CI que execute build e testes automáticos.

---

# Paginação e Filtros — API

Este documento descreve o comportamento do paginador/endpoint de listagem `relatorio` e os parâmetros de filtro implementados.

Endpoints

- `GET /api/relatorio` — listagem paginada de registros.
- `GET /data` — endpoint legado, comportamento equivalente ao `listRelatorio`.

Parâmetros de query suportados

- `page` (int, opcional): número da página (padrão: `1`).
- `pageSize` ou `qtdPag` (int, opcional): quantidade de itens por página (padrão: `50` para `/api/relatorio`, `300` no endpoint legado).
- `formula` (string, opcional): filtro por `Nome` (partial match). Pesquisa por `Nome LIKE %formula%`.
- `dateStart` (string, opcional): filtro de data inicial (formato `YYYY-MM-DD`). Aplica `Dia >= dateStart`.
- `dateEnd` (string, opcional): filtro de data final (formato `YYYY-MM-DD`). Aplica `Dia <= dateEnd`.
- `sortBy` (string, opcional): coluna para ordenar. Colunas permitidas: `Dia`, `Hora`, `Nome`, `Form1`, `Form2`, `processedFile`. Padrão: `Dia`.
- `sortDir` (string, opcional): direção da ordenação: `ASC` ou `DESC`. Padrão: `DESC`.

Comportamento

- Os filtros são aplicados diretamente no banco (QueryBuilder TypeORM), resultando em consultas eficientes mesmo com grandes volumes de dados.
- O filtro `formula` pesquisa exclusivamente na coluna `Nome` (LIKE, case dependent no DB; considere usar collation/ilike conforme DB se necessário).
- `dateStart` e `dateEnd` são aplicados sobre a coluna `Dia` (string no formato `YYYY-MM-DD`).
- Ordenação é validada contra uma whitelist de colunas para evitar injection.

Exemplos

- Buscar pela `Nome` contendo "Motor" nas primeiras 2 páginas, 50 itens por página:

```bash
curl 'http://localhost:3000/api/relatorio?page=1&pageSize=50&formula=Motor'
```

- Buscar entre datas, ordenando por `Form1` ascendente:

```bash
curl 'http://localhost:3000/api/relatorio?page=1&pageSize=100&dateStart=2025-01-01&dateEnd=2025-08-31&sortBy=Form1&sortDir=ASC'
```

Notas operacionais

- O endpoint retorna `{ page, pageSize, rows, total }`.
- `rows` tem o formato:
  ```json
  {
    "Dia": "2025-09-11",
    "Hora": "12:00:00",
    "Nome": "Linha X",
    "Form1": 123,
    "Form2": 456,
    "values": [ ... ],
    "processedFile": "Relatorio_2025_08.csv"
  }
  ```

Melhorias futuras

- Adicionar suporte a pesquisa por múltiplos critérios combinados (ex.: `formula` AND `Form1` numeric equality).
- Permitir filtro por intervalo de `Form1`/`Form2` (min/max) e por valores de `Prod_N`.
- Expor metadados de performance (tamanho da query, planning) para tuning.
