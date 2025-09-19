---
applyTo: '**'
---
 
New HTTP endpoints in index.ts (mirroring wsbridge handlers):
GET /api/ping
GET /api/backup/list
GET /api/file/process?filePath=...
GET /api/ihm/fetchLatest?ip=...&user=...
GET /api/relatorio/paginate?... (supports same query params as relatorio.paginate, including includeProducts=true)
GET /api/db/listBatches
POST /api/db/setupMateriaPrima (body: { items: [...] })
GET /api/db/getMateriaPrima
GET /api/db/syncLocalToMain?limit=...
GET /api/resumo?areaId=...&formula=...&dateStart=...&dateEnd=...
GET /api/mock/status and POST /api/mock/toggle
GET /api/mock/relatorios and GET /api/mock/materias
GET /api/unidades/converter?valor=...&de=...&para=...
POST /api/unidades/normalizarParaKg (body: { valores, unidades })
POST /api/db/populate (body: { tipo, quantidade, config })
GET /api/collector/start and GET /api/collector/stop

