# Comandos Rápidos - Teste do Sistema Cortez

## 🚀 Iniciar Sistema

### Backend
```bash
cd back-end
npm install  # Se primeira vez
npm run dev
```

### Frontend
```bash
cd Frontend
npm install  # Se primeira vez
npm run dev
```

---

## 🧪 Testes Rápidos

### 1. Testar Logs (30 segundos)
```bash
# Terminal 1: Ver logs em tempo real
tail -f back-end/logs/stats_$(date +%Y-%m-%d).jsonl

# Terminal 2: Fazer requisições
curl http://localhost:3000/api/ping
curl http://localhost:3000/api/relatorio/paginate
curl http://localhost:3000/api/stats/metrics | jq
```

### 2. Testar Ordenação (30 segundos)
```
1. Abrir http://localhost:5173
2. Login (se necessário)
3. Ir para Relatórios
4. Clicar 3x na coluna "Nome"
   - Clique 1: Ordena Z→A (DESC)
   - Clique 2: Ordena A→Z (ASC)
   - Clique 3: Volta ao padrão
5. Verificar que responde instantaneamente
```

### 3. Testar Toasts (30 segundos)
```
1. Iniciar e parar coleta várias vezes
2. Fazer múltiplas ações rápidas
3. Verificar que nunca aparecem mais de 3 toasts
4. Tentar ação duplicada (não deve criar toast duplicado)
```

### 4. Testar Conversão g/kg (2 minutos)
```bash
# Configurar produtos
curl -X POST http://localhost:3000/api/db/setupMateriaPrima \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"num": 1, "produto": "Farinha", "medida": 0},
      {"num": 2, "produto": "Açúcar", "medida": 1}
    ]
  }'

# Criar CSV de teste
cat > test.csv << 'EOF'
Dia,Hora,Nome,Form1,Form2,Prod_1,Prod_2
2025-01-21,10:00,Teste,100,1,5000,3
EOF

# Upload
curl -X POST http://localhost:3000/api/file/upload -F "file=@test.csv"

# Verificar conversão (5000g + 3kg = 5 + 3 = 8kg)
curl "http://localhost:3000/api/resumo" | jq '.totalPesos'
# Deve retornar: 8.0

# Limpar teste
rm test.csv
```

### 5. Testar Charts de Horários (1 minuto)
```bash
# Verificar endpoint
curl "http://localhost:3000/api/chartdata/horarios" | jq

# No navegador:
# 1. Ir para Relatórios
# 2. Clicar no botão ◀ (abrir drawer de gráficos)
# 3. Rolar até "Horários de Produção"
# 4. Verificar que mostra gráfico de barras com horas
```

---

## 📊 Verificações de Estatísticas

### Métricas Gerais
```bash
curl http://localhost:3000/api/stats/metrics | jq
```

### Estatísticas de Hoje
```bash
curl "http://localhost:3000/api/stats?startDate=$(date -I)" | jq
```

### Top 5 Endpoints Mais Usados
```bash
curl http://localhost:3000/api/stats/metrics | jq '.requestsByEndpoint | to_entries | sort_by(.value) | reverse | .[0:5]'
```

### Taxa de Cache
```bash
curl http://localhost:3000/api/stats/metrics | jq '.cacheHitRate'
```

### Duração Média
```bash
curl http://localhost:3000/api/stats/metrics | jq '.avgDuration'
```

---

## 🗑️ Limpeza e Reset

### Limpar Cache
```bash
curl -X POST http://localhost:3000/api/cache/paginate/clear
```

### Limpar Dados de Produção
```bash
curl -X POST http://localhost:3000/api/clear/production
```

### Limpar Logs Antigos (>30 dias)
```bash
curl -X POST http://localhost:3000/api/stats/cleanup \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep":30}'
```

### Limpar Tudo
```bash
curl -X POST http://localhost:3000/api/clear/all
```

---

## 🔍 Diagnóstico

### Verificar Conexão Backend
```bash
curl http://localhost:3000/api/ping
# Deve retornar: {"pong":true,"ts":"..."}
```

### Verificar Banco de Dados
```bash
curl http://localhost:3000/api/db/status | jq
# Deve retornar: {"status":"connected","isInitialized":true,...}
```

### Verificar Cache
```bash
curl http://localhost:3000/api/cache/paginate/status | jq
```

### Verificar Produtos Configurados
```bash
curl http://localhost:3000/api/materiaprima/labels | jq
```

### Verificar Logs Existentes
```bash
ls -lh back-end/logs/stats_*.jsonl
```

---

## 🐛 Troubleshooting Rápido

### Problema: Backend não inicia
```bash
cd back-end
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problema: Frontend não inicia
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problema: Ordenação não funciona
```bash
# Limpar cache do navegador
# Chrome: Ctrl+Shift+Del → Limpar cache

# Ou via DevTools
# F12 → Application → Clear storage → Clear site data
```

### Problema: Toasts duplicados
```
Verificar se está usando toastManager e não toast direto:
✅ import toastManager from './lib/toastManager';
❌ import { toast } from 'react-toastify';
```

### Problema: Conversão errada
```bash
# Verificar configuração de produtos
curl http://localhost:3000/api/materiaprima/labels | jq

# Se medida errada, reconfigurar
curl -X POST http://localhost:3000/api/db/setupMateriaPrima \
  -H "Content-Type: application/json" \
  -d '{"items":[{"num":1,"produto":"Produto","medida":0}]}'
```

### Problema: Charts vazios
```bash
# Verificar se há dados
curl "http://localhost:3000/api/resumo" | jq

# Limpar cache e tentar novamente
curl -X POST http://localhost:3000/api/cache/paginate/clear
```

---

## 📈 Testes de Performance

### Testar Ordenação (deve ser <10ms)
```
1. Abrir DevTools (F12)
2. Ir para Performance
3. Clicar em Record
4. Clicar em coluna para ordenar
5. Parar gravação
6. Verificar tempo < 10ms
```

### Testar Paginação (deve ser <200ms)
```bash
time curl "http://localhost:3000/api/relatorio/paginate?page=1&pageSize=100"
# Deve retornar em < 0.2s
```

### Testar Resumo (deve ser <500ms)
```bash
time curl "http://localhost:3000/api/resumo"
# Deve retornar em < 0.5s
```

### Testar Charts (deve ser <1s)
```bash
time curl "http://localhost:3000/api/chartdata/horarios"
# Deve retornar em < 1.0s
```

---

## 🎯 Teste Completo em 5 Minutos

```bash
#!/bin/bash
# Script de teste completo

echo "=== 1. Verificando Backend ==="
curl -s http://localhost:3000/api/ping | jq
sleep 1

echo "=== 2. Configurando Produtos ==="
curl -s -X POST http://localhost:3000/api/db/setupMateriaPrima \
  -H "Content-Type: application/json" \
  -d '{"items":[{"num":1,"produto":"Teste","medida":0}]}' | jq
sleep 1

echo "=== 3. Testando Logs ==="
curl -s http://localhost:3000/api/stats/metrics | jq '.totalRequests'
sleep 1

echo "=== 4. Testando Cache ==="
curl -s http://localhost:3000/api/cache/paginate/status | jq '.cacheSize'
sleep 1

echo "=== 5. Testando Charts ==="
curl -s "http://localhost:3000/api/chartdata/horarios" | jq '.chartData | length'

echo ""
echo "✅ Testes concluídos!"
echo "Agora teste no navegador:"
echo "1. Abrir http://localhost:5173"
echo "2. Testar ordenação (clicar em colunas)"
echo "3. Testar toasts (iniciar/parar coleta)"
```

---

## 📚 Documentação

### Ler Documentação Completa
```bash
# Documentação técnica
cat DOCUMENTACAO_FEATURES.md | less

# Implementações realizadas
cat IMPLEMENTACOES_REALIZADAS.md | less

# Guia de verificação
cat GUIA_VERIFICACAO.md | less

# Resumo executivo
cat RESUMO_EXECUTIVO.md | less
```

### Buscar na Documentação
```bash
# Buscar por "toast"
grep -n "toast" *.md

# Buscar por "conversão"
grep -n "conversão\|conversao" *.md

# Buscar por "ordenação"
grep -n "ordenação\|ordenacao" *.md
```

---

## 💡 Dicas Úteis

### Monitorar Logs em Tempo Real
```bash
tail -f back-end/logs/stats_$(date +%Y-%m-%d).jsonl | jq
```

### Contar Requisições do Dia
```bash
wc -l back-end/logs/stats_$(date +%Y-%m-%d).jsonl
```

### Ver Últimas 10 Requisições
```bash
tail -10 back-end/logs/stats_$(date +%Y-%m-%d).jsonl | jq -s
```

### Exportar Logs do Dia para JSON
```bash
cat back-end/logs/stats_$(date +%Y-%m-%d).jsonl | jq -s > logs_$(date +%Y-%m-%d).json
```

---

**Sistema**: Cortez v2.0  
**Status**: ✅ Pronto para uso  
**Suporte**: suporte@jcortica.com.br
