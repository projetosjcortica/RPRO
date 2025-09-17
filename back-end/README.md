# Coletor IHM CSV (Backend)

 Este projeto coleta arquivos CSV de um equipamento IHM via FTP, processa-os para uma forma JSON normalizada, armazena os arquivos originais em backup e persiste registros na tabela `Relatorio` utilizando TypeORM. Além disso, expõe uma API Express para consultar dados e permitir upload manual de arquivos.

## TODO

 - [x] Renomear os Filtros
 - [x] Ajustar o `MateriaPrima.ts` para ficar igual ao DB
 - [ ] Processar as informações do FrontEnd pro BackEnd via `childProcess.on(...)`
 
 ## Início rápido

 1. Instale dependências:

	 ```bash
	 npm install
	 ```

 2. Copie as variáveis de ambiente de exemplo e ajuste os valores:

	 ```bash
	 cp .env.example .env
	 ```

 3. Execute os testes:

	 ```bash
	 npm test
	 ```

 4. Inicie o servidor (modo desenvolvimento):

	 ```bash
	 npm run dev
	 ```

 5. Execute o coletor (processo separado):

	 ```bash
	 npm run collector
	 ```

 Observação: testes de integração que dependem de um servidor IHM/FTP real só serão executados quando a variável `RUN_IHM_INTEGRATION=true` estiver definida.

 ## Variáveis de ambiente principais

 - `DATABASE_URL` ou `DATABASE_PATH`: string de conexão do TypeORM (ex.: sqlite:/absolute/path ou configuração MySQL)
 - `IHM_HOST`, `IHM_USER`, `IHM_PASS`: credenciais FTP do equipamento IHM
 - `PORT`: porta do servidor HTTP
 - `RUN_IHM_INTEGRATION`: defina `true` para habilitar testes de integração com IHM

 ## Endpoints da API (visão geral)

 - `GET /relatorios` - lista registros persistidos
 - `GET /files` - lista arquivos processados/baixados
 - `POST /upload` - faz upload manual de um CSV (será processado)

 Consulte `src/controllers` para detalhes sobre parâmetros e formato das respostas.

 ## Resumo não técnico

 Este serviço automatiza a coleta de registros de produção (CSV) de máquinas, mantém cópias seguras dos arquivos originais, extrai registros estruturados e grava em banco de dados para que relatórios e dashboards possam consumir facilmente. Para economizar banda, tenta comparar hashes remotos e evita baixar arquivos já processados.

 ## Contribuição

 - Siga o estilo do repositório (TypeScript com tipagem forte).
 - Prefira alterações pequenas e reversíveis e adicione testes unitários para novos comportamentos.

## Gerar documentação com TypeDoc

Este projeto contém código TypeScript. Para gerar documentação que respeite tipagem e comentários TSDoc, use o `TypeDoc`.

Instale (se necessário) e gere a documentação:

```powershell
npm install --save-dev typedoc
npm run docs
```

A documentação será gerada em `docs/typedoc`.

Observações avançadas sobre geração de docs:
- Para incluir símbolos privados/protected na documentação, o `typedoc.json` agora tem `excludePrivate: false` e `excludeProtected: false`.
- Se quiser gerar apenas APIs públicas, ajuste `typedoc.json` para `excludePrivate: true`.

Comando alternativo (para depuração):

```powershell
npx typedoc --entryPointStrategy expand --entryPoints src --out docs/typedoc
```

Se quiser, eu rodo a geração de docs aqui e te mostro um resumo dos arquivos criados. Deseja que eu execute agora?
