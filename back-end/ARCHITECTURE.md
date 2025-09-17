 # Visão da Arquitetura

 Este documento descreve as decisões arquiteturais principais após a refatoração e como os componentes se relacionam.

 ## Objetivos

 - Centralizar o parsing e o processamento de arquivos CSV no `parserService`.
 - Manter camadas claras: domínio, aplicação e infraestrutura.
 - Tornar os serviços extensíveis por meio de interfaces e prontos para injeção de dependência.

 ## Camadas

 - domain/: Entidades e estruturas de dados puras (por exemplo, `Relatorio`, `Batch`, `Row`).
 - application/: Casos de uso e orquestrações (por exemplo, processamento de arquivos).
 - infrastructure/: Implementações concretas (controllers Express, integração FTP, adaptadores de banco).

 ## Serviços principais

 - `IHMService`: comunicação com o FTP remoto para listar e baixar arquivos. Quando suportado, tenta obter o hash remoto antes do download; caso contrário, faz fallback para download e comparação local.
 - `BackupService`: armazena cópias dos arquivos baixados em `backups/` e oferece listagem/metadados.
 - `ParserService`: parser canônico de CSVs. Detecta delimitador, identifica cabeçalho (quando presente) e normaliza linhas para a forma `ParserRow`. Gera um JSON processado em `downloads/processed`.
 - `FileProcessorService`: converte `ParserRow` para o formato da entidade `Relatorio` e persiste via `DBService` (TypeORM).
 - `DBService`: camada de persistência usando TypeORM; suporta SQLite ou MySQL via variáveis de ambiente.

 ## Fluxo de dados (visão geral)

 1. O `collector` consulta o `IHMService` em busca de arquivos CSV remotos.
 2. Para cada arquivo, o `collector` tenta obter o hash remoto (quando disponível). Se o hash for diferente do último backup, o arquivo é baixado.
 3. O arquivo baixado é persistido pelo `BackupService`.
 4. O `ParserService` processa o CSV e gera um JSON com as linhas normalizadas.
 5. O `FileProcessorService` lê as linhas processadas e insere os registros novos na tabela `Relatorio` via `DBService`.

 ## Diagrama (mermaid)

 ```mermaid
 flowchart LR
   subgraph infra[Infraestrutura]
     IHM[IHMService (FTP)] --> Collector[Collector]
     Collector --> Backup[BackupService]
     Collector --> Parser[ParserService]
     Parser --> Processor[FileProcessorService]
     Processor --> DB[DBService]
     API[Express API] --> DB
   end
 ```

 ## SOLID & Padrões aplicados

 - SRP: cada serviço possui uma responsabilidade pequena e bem definida.
 - OCP/DIP: módulos de alto nível dependem de abstrações (interfaces em `src/types`) para permitir extensões sem alterações nos consumidores.
 - Strategy: o parser adota estratégias para detectar delimitadores e presença de cabeçalho.
 - Template Method: o `Collector` define o esqueleto do fluxo (descobrir -> baixar -> backup -> processar -> persistir) permitindo variações nas etapas específicas.

 ## Observações e próximos passos

 - Aplicar de forma mais rigorosa as interfaces em `src/types/services.ts` para habilitar injeção de dependência e facilitar testes.
 - Melhorar a detecção de hashes remotos para cobrir respostas específicas de diferentes servidores FTP.
 - Considerar documentação adicional (diagramas detalhados, exemplos de payloads da API e fluxo de deploy).

 ## Resumo (versão curta em Português)

 Este backend coleta arquivos CSV de um equipamento IHM via FTP, processa os dados, guarda backups dos arquivos brutos e persiste registros em um banco de dados (SQLite ou MySQL, configurável). O `parserService` é a fonte única de verdade para interpretar CSVs, e o sistema tenta evitar downloads desnecessários consultando hashes remotos quando possível.

 ### Padrões e decisões principais

 - Camadas: domínio, aplicação e infraestrutura, separadas para manter código testável e modular.
 - Observers: `fileProcessorService` notifica `BackupObserver` e `CleanupObserver` para ações pós-processamento.
 - Extensibilidade: é simples adicionar novos parsers, adaptadores de banco ou fontes (ex.: SFTP) seguindo as interfaces existentes.
