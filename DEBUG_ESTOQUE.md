# 🔍 Debug Guide - Sistema de Estoque

## ✅ Status Atual
- Backend: ✅ Rodando na porta 3000
- Dados: ✅ 40 itens carregados no banco
- API: ✅ Testada e funcional
- Frontend: ⏳ Aguardando teste

## 🚀 Checklist Rápido

### 1. Backend está rodando?
```powershell
# Teste o ping
Invoke-WebRequest -Uri "http://localhost:3000/api/ping"
```
**Resposta esperada**: `{"pong":true,"ts":"..."}`

### 2. Dados estão no banco?
```powershell
# Verificar quantidade de itens
$resp = Invoke-WebRequest -Uri "http://localhost:3000/api/estoque"
$data = $resp.Content | ConvertFrom-Json
Write-Host "Itens no estoque: $($data.Length)"
```
**Resposta esperada**: `Itens no estoque: 40`

### 3. Frontend compilando?
```powershell
cd Frontend
npm run dev
```
**Erro comum**: "Port 5173 is already in use"
**Solução**: Feche outros processos ou use porta alternativa

### 4. Navegador mostrando dados?

#### Abra o Console (F12)
Procure por erros no console do navegador.

**Erros comuns:**

❌ **`Failed to fetch`**
- Causa: Backend não está rodando
- Solução: `cd back-end && npm run dev`

❌ **`CORS error`**
- Causa: CORS não configurado
- Solução: Já configurado no index.ts, reinicie o backend

❌ **`Cannot read property 'map' of undefined`**
- Causa: Dados não chegaram do backend
- Solução: Verifique se API retorna array

#### Teste direto no navegador
Abra: http://localhost:3000/api/estoque

**Deve mostrar**: JSON com 40 itens

### 5. Componente carregando?

Adicione logs temporários no `estoque-management.tsx`:

```typescript
useEffect(() => {
  console.log('🔄 Carregando dados do estoque...');
  carregarDados();
}, [filtroAtivos, filtroAbaixoMinimo]);

const carregarDados = async () => {
  try {
    console.log('📡 Chamando API...');
    setLoading(true);
    
    const params: any = {};
    if (filtroAtivos) params.ativos = "true";
    if (filtroAbaixoMinimo) params.abaixo_minimo = "true";
    
    const estoqueData = await Processador.sendGet("estoque", params);
    console.log('✅ Dados recebidos:', estoqueData.length, 'itens');
    
    setEstoques(estoqueData);
    // ... resto do código
  } catch (error) {
    console.error('❌ Erro ao carregar:', error);
  }
};
```

### 6. Testar APIs Individualmente

#### Estoque
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/estoque" | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -First 3
```

#### Estatísticas
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/estoque/estatisticas" | Select-Object -ExpandProperty Content
```

#### Projeções
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/estoque/projecao" | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -First 3
```

#### Consumo
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/estoque/consumo" | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -First 3
```

### 7. Verificar Erros no Backend

Veja o terminal onde rodou `npm run dev`:

**Procure por:**
- ❌ `Error` ou `TypeError`
- ⚠️ `Warning`
- ✅ `[Server] API server running on port 3000`

### 8. Testar Rota Específica

```powershell
# Ver primeiro item do estoque
$resp = Invoke-WebRequest -Uri "http://localhost:3000/api/estoque"
$data = $resp.Content | ConvertFrom-Json
$data[0] | ConvertTo-Json -Depth 3
```

**Deve retornar algo como:**
```json
{
  "id": "uuid-here",
  "materia_prima_id": "uuid-here",
  "quantidade": 468000,
  "quantidade_minima": 54600,
  "quantidade_maxima": 702000,
  "unidade": "kg",
  "ativo": true,
  "materia_prima": {
    "id": "uuid",
    "produto": "MP1",
    "num": 1
  }
}
```

## 🐛 Problemas Conhecidos

### 1. "Cannot find module Processador"
**Causa**: Import incorreto
**Solução**: Use `import { getProcessador } from "./Processador"`

### 2. Gráficos não aparecem
**Causa**: Recharts não instalado ou dados vazios
**Solução**: 
```powershell
cd Frontend
npm install recharts
```

### 3. Componentes UI faltando
**Causa**: shadcn/ui não configurado
**Solução**: Já configurado, mas verifique:
```powershell
ls Frontend/src/components/ui/
```

### 4. Dados não atualizam
**Causa**: Cache ou useEffect não disparando
**Solução**: Hard refresh (Ctrl+Shift+R)

### 5. Loading infinito
**Causa**: API não respondendo ou erro silencioso
**Solução**: Veja console do navegador (F12)

## 📊 Exemplo de Resposta Esperada

### GET /api/estoque
```json
[
  {
    "id": "cb8ab938-78c1-4a4c-8538-87fdd390e68e",
    "materia_prima_id": "cb8ab938-78c1-4a4c-8538-87fdd390e68e",
    "quantidade": 468000,
    "quantidade_minima": 54600,
    "quantidade_maxima": 702000,
    "unidade": "kg",
    "ativo": true,
    "materia_prima": {
      "id": "cb8ab938-78c1-4a4c-8538-87fdd390e68e",
      "num": 1,
      "produto": "MP1",
      "medida": 1
    }
  }
]
```

### GET /api/estoque/estatisticas
```json
{
  "totalItens": 40,
  "itensAbaixoMinimo": 0,
  "itensAcimaMaximo": 0,
  "valorTotalEstoque": 0,
  "taxaRotacao": 0.25
}
```

## ✅ Checklist Final

- [ ] Backend rodando na porta 3000
- [ ] Teste API: http://localhost:3000/api/estoque retorna 40 itens
- [ ] Frontend compilando sem erros
- [ ] Navegador acessa: http://localhost:5173
- [ ] Rota /estoque-management existe no menu
- [ ] Console do navegador sem erros
- [ ] Dados aparecem na interface

## 🆘 Ainda com problema?

1. **Reinicie tudo**:
   ```powershell
   # Terminal 1
   cd back-end
   npm run dev
   
   # Terminal 2
   cd Frontend
   npm run dev
   ```

2. **Limpe cache**:
   ```powershell
   # Backend
   cd back-end
   Remove-Item cache.sqlite -Force
   
   # Frontend
   cd Frontend
   Remove-Item -Recurse -Force dist, node_modules/.vite
   ```

3. **Regenere dados**:
   ```powershell
   cd back-end
   node init-estoque-real.js
   ```

4. **Verifique portas**:
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :5173
   ```

## 📝 Log de Ações

Execute e compartilhe este log se continuar com problemas:

```powershell
Write-Host "=== DIAGNÓSTICO DO SISTEMA DE ESTOQUE ===" -ForegroundColor Cyan

Write-Host "`n1. Testando Backend..." -ForegroundColor Yellow
try {
    $ping = Invoke-WebRequest -Uri "http://localhost:3000/api/ping" -ErrorAction Stop
    Write-Host "✅ Backend respondendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não responde: $_" -ForegroundColor Red
}

Write-Host "`n2. Verificando Estoque..." -ForegroundColor Yellow
try {
    $estoque = Invoke-WebRequest -Uri "http://localhost:3000/api/estoque" -ErrorAction Stop
    $data = $estoque.Content | ConvertFrom-Json
    Write-Host "✅ Estoque: $($data.Length) itens" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao buscar estoque: $_" -ForegroundColor Red
}

Write-Host "`n3. Verificando Estatísticas..." -ForegroundColor Yellow
try {
    $stats = Invoke-WebRequest -Uri "http://localhost:3000/api/estoque/estatisticas" -ErrorAction Stop
    Write-Host "✅ Estatísticas disponíveis" -ForegroundColor Green
    Write-Host $stats.Content
} catch {
    Write-Host "❌ Erro nas estatísticas: $_" -ForegroundColor Red
}

Write-Host "`n4. Verificando Frontend..." -ForegroundColor Yellow
if (Test-Path "Frontend/src/estoque-management.tsx") {
    Write-Host "✅ Componente existe" -ForegroundColor Green
} else {
    Write-Host "❌ Componente não encontrado" -ForegroundColor Red
}

Write-Host "`n=== FIM DO DIAGNÓSTICO ===" -ForegroundColor Cyan
```

Salve a saída e compartilhe se precisar de ajuda adicional.
