# RPRO Backend - Documentação da API

Sistema de coleta, processamento e análise de dados de produção através de APIs REST. O backend é construído em Node.js + TypeScript + Express + TypeORM.

## 🏗️ Arquitetura

### Stack Tecnológica
- **Framework**: Express.js
- **ORM**: TypeORM 
- **Database**: MySQL (com fallback para SQLite)
- **Linguagem**: TypeScript
- **Upload**: Multer
- **FTP**: basic-ftp

### Estrutura de Dados
- **Relatório**: Dados principais de produção (40 produtos por registro)
- **MateriaPrima**: Configuração de produtos e unidades de medida
- **Cache**: Controle de arquivos já processados
- **User**: Sistema básico de autenticação
- **Configurações**: Parâmetros do sistema

## 🚀 Inicialização

```bash
cd back-end
npm install
npm run dev
```

O servidor roda na porta 3000 por padrão. Aceita configuração via `PORT` ou `http_port` no runtime config.

## 📊 Endpoints da API

### 🔌 Status e Conectividade

#### `GET /api/ping`
Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "pong": true,
  "ts": "2025-01-03T10:30:00.000Z"
}
```

---

#### `GET /api/db/status`
Status da conexão com banco de dados.

**Resposta:**
```json
{
  "status": "connected",
  "isInitialized": true,
  "relatorioCount": 1254,
  "ts": "2025-01-03T10:30:00.000Z"
}
```

---

### 📋 Dados de Relatório

#### `GET /api/relatorio/paginate`
Busca dados de relatório com paginação e filtros.

**Parâmetros:**
- `page` (número): Página (padrão: 1)
- `pageSize` (número): Itens por página (padrão: 100)
- `all` (boolean): Retorna todos os registros se `true`
- `codigo` (número): Filtro por Form1 (código IHM)
- `numero` (número): Filtro por Form2 (número usuário)
- `formula` (string/número): Filtro por nome ou código da fórmula
- `dataInicio` (string): Data inicial (YYYY-MM-DD ou DD-MM-YYYY)
- `dataFim` (string): Data final (YYYY-MM-DD ou DD-MM-YYYY)
- `sortBy` (string): Campo para ordenação (Dia, Hora, Nome, Form1, Form2)
- `sortDir` (string): Direção (ASC/DESC, padrão: DESC)

**Exemplo de uso:**
```bash
GET /api/relatorio/paginate?page=1&pageSize=50&dataInicio=2025-01-01&dataFim=2025-01-31&formula=Receita%20A
```

**Resposta:**
```json
{
  "rows": [
    {
      "Dia": "2025-01-03",
      "Hora": "14:30",
      "Nome": "Receita A",
      "Codigo": 1001,
      "Numero": 5,
      "values": [150.5, 200.0, 0, 75.2, ...]
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "totalPages": 3
}
```

---

#### `POST /api/relatorio/paginate`
Mesma funcionalidade do GET, mas aceita parâmetros no body para consultas mais complexas.

**Body:**
```json
{
  "page": 1,
  "pageSize": 100,
  "codigo": 1001,
  "dataInicio": "2025-01-01",
  "dataFim": "2025-01-31",
  "all": false
}
```

---

### 📂 Processamento de Arquivos

#### `POST /api/file/upload`
Upload e processamento de arquivo CSV.

**Multipart form-data:**
- `file`: Arquivo CSV

**Resposta:**
```json
{
  "ok": true,
  "meta": {
    "backupPath": "/path/to/backup/file.csv",
    "timestamp": "2025-01-03T10:30:00.000Z"
  },
  "processed": {
    "rowsCount": 45,
    "processedPath": "/tmp/processed/file.csv"
  }
}
```

---

#### `GET /api/file/process`
Processa um arquivo específico do sistema.

**Parâmetros:**
- `filePath` (string): Caminho completo do arquivo

**Exemplo:**
```bash
GET /api/file/process?filePath=/tmp/relatorio.csv
```

**Resposta:**
```json
{
  "meta": {
    "originalPath": "/tmp/relatorio.csv",
    "processedAt": "2025-01-03T10:30:00.000Z"
  },
  "rowsCount": 32
}
```

---

### ⚙️ Coletor Automático (IHM)

O sistema possui um coletor que monitora servidores FTP para baixar novos arquivos CSV automaticamente.

#### `GET /api/collector/start`
#### `POST /api/collector/start`
Inicia o coletor automático com configuração IHM opcional.

**Parâmetros GET (query string):**
- `ip` (string): IP do servidor IHM (opcional)
- `user` (string): Usuário FTP (opcional)
- `password` (string): Senha FTP (opcional)

**Parâmetros POST (body JSON):**
```json
{
  "ip": "192.168.1.100",
  "user": "admin",
  "password": "123456"
}
```

**Exemplo GET:**
```bash
GET /api/collector/start?ip=192.168.1.100&user=admin&password=123456
```

**Exemplo POST:**
```bash
POST /api/collector/start
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "user": "admin", 
  "password": "123456"
}
```

**Resposta:**
```json
{
  "started": true,
  "status": {
    "running": true,
    "startedAt": "2025-01-03T10:30:00.000Z",
    "cycles": 0,
    "pollIntervalMs": 60000,
    "lastError": null
  }
}
```

**Comportamento:**
- Se parâmetros IHM forem fornecidos, atualiza a configuração runtime e usa esses valores
- Se não fornecidos, usa configuração salva anteriormente
- Configuração atualizada fica persistente para próximas execuções

---

#### `GET /api/collector/stop`
Para o coletor automático.

**Resposta:**
```json
{
  "stopped": true,
  "status": {
    "running": false,
    "lastFinishedAt": "2025-01-03T10:35:00.000Z",
    "cycles": 3
  }
}
```

---

#### `GET /api/collector/status`
Status atual do coletor.

**Resposta:**
```json
{
  "running": false,
  "stopRequested": false,
  "startedAt": null,
  "lastCycleAt": "2025-01-03T10:34:30.000Z",
  "lastFinishedAt": "2025-01-03T10:35:00.000Z",
  "lastError": null,
  "cycles": 3,
  "pollIntervalMs": 60000
}
```

---

#### `GET /api/ihm/fetchLatest`
Busca manualmente arquivos no servidor IHM/FTP.

**Parâmetros:**
- `ip` (string): IP do servidor FTP
- `user` (string): Usuário FTP (padrão: "anonymous")
- `password` (string): Senha FTP

**Exemplo:**
```bash
GET /api/ihm/fetchLatest?ip=192.168.1.100&user=admin&password=123456
```

---

### 🏭 Matéria Prima

#### `GET /api/materiaprima/labels`
Retorna mapeamento de produtos para o frontend.

**Resposta:**
```json
{
  "col6": {
    "produto": "Farinha",
    "medida": 1
  },
  "col7": {
    "produto": "Açúcar", 
    "medida": 0
  }
}
```

---

#### `POST /api/db/setupMateriaPrima`
Configura produtos e suas unidades de medida.

**Body:**
```json
{
  "items": [
    {
      "num": 1,
      "produto": "Farinha de Trigo",
      "medida": 1
    },
    {
      "num": 2,
      "produto": "Açúcar Cristal",
      "medida": 0
    }
  ]
}
```

**Medidas:**
- `0`: Gramas (será convertido para KG no frontend)
- `1`: Quilogramas

---

#### `GET /api/db/getMateriaPrima`
Lista todos os produtos cadastrados.

**Resposta:**
```json
[
  {
    "num": 1,
    "produto": "Farinha de Trigo", 
    "medida": 1
  },
  {
    "num": 2,
    "produto": "Açúcar Cristal",
    "medida": 0
  }
]
```

---

### 📈 Relatórios e Resumos

#### `GET /api/resumo`
Dados agregados para relatórios executivos.

**Parâmetros:**
- `areaId` (string): ID da área
- `formula` (número): Código da fórmula
- `nomeFormula` (string): Nome da fórmula
- `codigo` (número): Form1
- `numero` (número): Form2
- `dataInicio` (string): Data inicial
- `dataFim` (string): Data final

**Resposta:**
```json
{
  "totalRegistros": 500,
  "formulasUtilizadas": {
    "1001": {
      "nome": "Receita A",
      "numero": 1001,
      "quantidade": 150
    }
  },
  "consumoPorProduto": {
    "Farinha": 1250.5,
    "Açúcar": 800.2
  },
  "periodoAnalise": {
    "inicio": "2025-01-01",
    "fim": "2025-01-31"
  }
}
```

---

#### `GET /api/filtrosAvaliable`
Filtros disponíveis com base nos dados existentes.

**Parâmetros:**
- `dateStart` (string): Data inicial para escopo
- `dateEnd` (string): Data final para escopo

**Resposta:**
```json
{
  "formulas": [
    {
      "nome": "Receita A",
      "codigo": 1001
    }
  ],
  "codigos": [1001, 1002, 1003],
  "numeros": [1, 2, 3, 5, 8]
}
```

---

### 📊 Dados para Gráficos

#### `GET /api/chartdata`
Dados formatados para dashboards e gráficos.

**Parâmetros:**
- `limit` (número): Limita número de registros
- `dateStart` (string): Data inicial
- `dateEnd` (string): Data final

**Resposta:**
```json
{
  "rows": [
    {
      "Nome": "Receita A",
      "values": [150.5, 200.0, 0, 75.2],
      "Dia": "2025-01-03",
      "Hora": "14:30",
      "Form1": 1001,
      "Form2": 5,
      "Unidade_1": "kg",
      "Unidade_2": "g"
    }
  ],
  "total": 150,
  "ts": "2025-01-03T10:30:00.000Z"
}
```

---

#### `GET /api/chartdata/formulas`
Agregação por fórmulas.

**Resposta:**
```json
{
  "chartData": [
    {
      "name": "Receita A",
      "value": 1250.5,
      "count": 45
    }
  ],
  "total": 1250.5,
  "totalRecords": 45
}
```

---

#### `GET /api/chartdata/produtos`
Agregação por produtos.

**Resposta:**
```json
{
  "chartData": [
    {
      "name": "Farinha de Trigo",
      "value": 850.2,
      "unit": "kg"
    }
  ],
  "total": 2150.8,
  "totalRecords": 150
}
```

---

#### `GET /api/chartdata/horarios`
Agregação por horário de produção.

**Resposta:**
```json
{
  "chartData": [
    {
      "name": "14h",
      "value": 250.5,
      "count": 12,
      "average": 20.875
    }
  ],
  "peakHour": "14h"
}
```

---

#### `GET /api/chartdata/diasSemana`
Agregação por dia da semana.

**Resposta:**
```json
{
  "chartData": [
    {
      "name": "Segunda",
      "value": 1250.5,
      "count": 45,
      "average": 27.8
    }
  ],
  "peakDay": "Segunda"
}
```

---

### ⚙️ Configuração do Sistema

#### `GET /api/config/`
Retorna toda a configuração do sistema.

**Resposta:**
```json
{
  "ihm-config": {
    "ip": "192.168.1.100",
    "user": "admin",
    "password": "123456",
    "nomeCliente": "Empresa XYZ"
  },
  "db-config": {
    "serverDB": "localhost",
    "database": "producao",
    "userDB": "root",
    "passwordDB": "senha123"
  },
  "general-config": {
    "localCSV": "/data/csv",
    "habilitarCSV": true
  }
}
```

---

#### `GET /api/config/:key`
Retorna configuração específica.

**Exemplo:**
```bash
GET /api/config/ihm-config
```

**Resposta:**
```json
{
  "key": "ihm-config",
  "value": {
    "ip": "192.168.1.100",
    "user": "admin",
    "password": "123456"
  }
}
```

---

#### `POST /api/config`
Salva configurações do sistema.

**Body:**
```json
{
  "ihm-config": {
    "ip": "192.168.1.100",
    "user": "admin", 
    "password": "123456"
  },
  "db-config": {
    "serverDB": "localhost",
    "database": "producao"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "saved": ["ihm-config", "db-config"]
}
```

---

### 🔐 Autenticação

#### `POST /api/auth/register`
Registra novo usuário.

**Body:**
```json
{
  "username": "admin",
  "password": "senha123",
  "displayName": "Administrador"
}
```

**Resposta:**
```json
{
  "id": "uuid-here",
  "username": "admin",
  "displayName": "Administrador",
  "isAdmin": true
}
```

---

#### `POST /api/auth/login`
Login de usuário.

**Body:**
```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "id": "uuid-here",
  "username": "admin",
  "displayName": "Administrador",
  "isAdmin": true,
  "photoPath": "/user_photos/admin_123456.jpg"
}
```

---

#### `POST /api/auth/photo`
Upload de foto de perfil (multipart).

**Form data:**
- `photo`: Arquivo de imagem
- `username`: Nome do usuário

---

#### `POST /api/auth/photoBase64`
Upload de foto como base64.

**Body:**
```json
{
  "username": "admin",
  "photoBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

---

### 🗄️ Gerenciamento de Banco

#### `POST /api/db/clear`
Limpa todas as tabelas do banco de dados.

**Resposta:**
```json
{
  "ok": true
}
```

---

#### `GET /api/db/dump`
Exporta dump do banco em JSON.

**Resposta:**
```json
{
  "ok": true,
  "savedPath": "/backups/dump_20250103_103000.json",
  "meta": {
    "timestamp": "2025-01-03T10:30:00.000Z",
    "tables": ["relatorio", "materiaprima", "batch"]
  }
}
```

---

#### `POST /api/db/import`
Importa dump do banco.

**Body:** Objeto JSON do dump completo

---

#### `POST /api/cache/clear`
Limpa cache de arquivos processados.

---

#### `POST /api/clear/all`
Limpa banco + cache + backups.

---

#### `POST /api/clear/production`
Limpa apenas dados de produção, preservando usuários e resetando matéria prima.

**Descrição:**
Remove todos os dados de produção (relatórios, estoque, movimentações) mas preserva:
- Usuários cadastrados
- Configurações do sistema

Reseta matéria prima para produtos padrão (Produto 1-40 em kg).

**Limpezas realizadas:**
- Tabelas: Relatorio, Batch, Row, Estoque, MovimentacaoEstoque
- Cache SQLite (arquivo físico deletado)
- Backups
- Matéria prima (resetada para padrões)

**Resposta:**
```json
{
  "ok": true,
  "message": "Production data cleared successfully. Users preserved, MateriaPrima reset to defaults, cache SQLite cleared."
}
```

---

### 🔧 Utilitários

#### `GET /api/unidades/converter`
Converte entre unidades de medida.

**Parâmetros:**
- `valor` (número): Valor a converter
- `de` (número): Unidade origem (0=gramas, 1=kg)
- `para` (número): Unidade destino (0=gramas, 1=kg)

**Exemplo:**
```bash
GET /api/unidades/converter?valor=1000&de=0&para=1
```

**Resposta:**
```json
{
  "original": 1000,
  "convertido": 1,
  "de": 0,
  "para": 1
}
```

---

#### `POST /api/unidades/normalizarParaKg`
Normaliza array de valores para KG.

**Body:**
```json
{
  "valores": [1000, 2000, 500],
  "unidades": [0, 0, 1]
}
```

**Resposta:**
```json
{
  "valoresOriginais": [1000, 2000, 500],
  "valoresNormalizados": [1, 2, 500],
  "unidades": [0, 0, 1]
}
```

---

#### `GET /api/backup/list`
Lista backups disponíveis.

**Resposta:**
```json
{
  "backups": [
    {
      "name": "backup_20250103.csv",
      "path": "/backups/backup_20250103.csv",
      "size": 15420,
      "created": "2025-01-03T10:30:00.000Z"
    }
  ]
}
```

---

## 📝 Notas Importantes

### Formato de Datas
O sistema aceita datas em múltiplos formatos:
- `YYYY-MM-DD` (ISO, preferido)
- `DD-MM-YYYY` (convertido automaticamente)
- `DD/MM/YYYY` (convertido automaticamente)

### Unidades de Medida
- **Gramas (0)**: Valores são divididos por 1000 no frontend para exibição em KG
- **Quilogramas (1)**: Valores mantidos como estão

### CORS
Todas as rotas possuem CORS habilitado para `*` durante desenvolvimento.

### Coletor Automático
- Monitora servidor FTP a cada 60 segundos (configurável)
- Filtra apenas arquivos `.csv`
- Ignora arquivos `*_2.csv` e `*_sys*`
- Mantém cache para evitar reprocessamento

### Database
- **Produção**: MySQL/MariaDB
- **Desenvolvimento**: SQLite (fallback automático)
- Migrations automáticas via TypeORM

---

## 🚨 Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{
  "error": "Descrição do erro",
  "details": "Detalhes técnicos (quando disponível)"
}
```

**Códigos HTTP comuns:**
- `200`: Sucesso
- `400`: Parâmetros inválidos
- `401`: Não autorizado
- `404`: Recurso não encontrado
- `409`: Conflito (ex: usuário já existe)
- `500`: Erro interno do servidor

---

## 📞 Suporte

Para questões técnicas ou problemas com a API, consulte os logs do servidor ou entre em contato com a equipe de desenvolvimento.