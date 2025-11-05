# Guia de Teste - Dashboard Amendoim

## 🔧 Preparação do Backend

### 1. Iniciar o backend
```powershell
cd back-end
npm run dev
```

O backend deve iniciar em `http://localhost:3000`

### 2. Verificar se há dados no banco

Abra o navegador e acesse:
```
http://localhost:3000/api/amendoim/count
```

Você verá algo como:
```json
{
  "total": 0,
  "entrada": 0,
  "saida": 0
}
```

### 3. Popular dados de teste (se total = 0)

#### Opção A: Via API direta
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/amendoim/seed" -Method POST
```

#### Opção B: Via script
```powershell
cd back-end
npx ts-node src/scripts/seedAmendoim.ts
```

#### Opção C: Via interface (mais fácil)
Veremos na próxima seção.

### 4. Verificar dados criados
```
http://localhost:3000/api/amendoim/analise
```

Deve retornar JSON com:
- `entradaSaidaPorHorario`: array com 24 horas
- `fluxoSemanal`: array com 7 dias da semana
- `eficienciaPorTurno`: array com 4 turnos
- `rendimentoPorDia`: array com dias do período
- `perdaAcumulada`: array com perdas por dia

---

## 🎨 Preparação do Frontend

### 1. Iniciar o frontend
```powershell
cd Frontend
npm run dev
```

O frontend deve iniciar (geralmente em `http://localhost:5173`)

### 2. Login como usuário amendoim

Use um usuário com `userType: 'amendoim'` ou crie um novo.

### 3. Dashboard Debug Mode

Ao acessar o Home, você verá uma caixa amarela no topo com:

**Botões disponíveis:**
- **Verificar DB**: Mostra quantos registros existem no banco
- **Popular Dados Teste**: Cria automaticamente dados dos últimos 7 dias

**Contadores em tempo real:**
- Mostra quantos dados cada gráfico recebeu

---

## 🐛 Troubleshooting

### Problema: Gráficos mostram "Sem dados para o período selecionado"

**Causa:** Não há dados no banco para o período selecionado (filtros de data)

**Solução:**
1. Clique em "Popular Dados Teste" para criar dados dos últimos 7 dias
2. Ajuste os filtros de data para incluir o período atual:
   - **Horário de Produção**: Selecione "Ontem" ou o período desejado
   - **Produção Semanal**: Use as setas para navegar até a semana atual
   - **Eficiência por Turno**: Selecione "Ontem" ou período desejado

### Problema: Backend retorna erro 500

**Verificar logs do backend** no terminal onde executou `npm run dev`

**Causas comuns:**
- Banco de dados não inicializado
- SQL incompatível (MySQL vs SQLite)
- Dados corrompidos

### Problema: Frontend não conecta ao backend

**Verificar:**
1. Backend está rodando em `http://localhost:3000`
2. Não há erros de CORS no console do navegador (F12)
3. URL do fetch está correta em `home.tsx`

### Problema: Dados não aparecem mesmo após popular

**Debug:**
1. Abra o Console do navegador (F12)
2. Procure por logs `[Amendoim]`, `[Horarios]`, `[Semanal]`, `[Turnos]`
3. Verifique se há erros na resposta da API
4. Clique em "Verificar DB" para confirmar que há dados

---

## 📊 Estrutura dos Dados

### Formato de data esperado pelo backend

- **Dia**: `DD-MM-YY` (ex: `05-11-25`)
- **Hora**: `HH:MM:SS` (ex: `14:30:00`)
- **API aceita**: `YYYY-MM-DD` (ex: `2025-11-05`)

### Filtros de data

Todos os gráficos enviam:
- `dataInicio`: data inicial no formato `YYYY-MM-DD`
- `dataFim`: data final no formato `YYYY-MM-DD`

---

## ✅ Checklist de Funcionalidade

- [ ] Backend inicia sem erros
- [ ] Endpoint `/api/amendoim/count` responde
- [ ] Dados de teste foram populados
- [ ] Endpoint `/api/amendoim/analise` retorna dados
- [ ] Frontend inicia sem erros
- [ ] Login com usuário amendoim funciona
- [ ] Dashboard amendoim é exibido
- [ ] Botão "Verificar DB" funciona
- [ ] Botão "Popular Dados Teste" funciona
- [ ] Gráfico "Horário de Produção" renderiza
- [ ] Gráfico "Produção Semanal" renderiza
- [ ] Gráfico "Eficiência por Turno" renderiza
- [ ] Filtros de data funcionam
- [ ] Console não mostra erros
- [ ] Logs `[Amendoim]` aparecem no console

---

## 🚀 Próximos Passos

Após validar que o dashboard amendoim está funcionando:

1. **Remover Debug Mode**: Comentar ou remover a caixa amarela de debug
2. **Ajustar estilos**: Refinar cores, espaçamentos, responsividade
3. **Otimizar queries**: Cache, paginação, índices no banco
4. **Coletor automático**: Configurar coleta FTP para amendoim
5. **Sistema de relatórios**: Iniciar desenvolvimento do módulo de relatórios

---

## 📝 Notas de Desenvolvimento

### Arquivos principais

**Backend:**
- `back-end/src/services/AmendoimService.ts` - Lógica de negócio
- `back-end/src/index.ts` - Endpoints da API (linhas 3778+)
- `back-end/src/entities/Amendoim.ts` - Modelo de dados

**Frontend:**
- `Frontend/src/home.tsx` - Dashboard principal
- `Frontend/src/components/AmendoimCharts.tsx` - Componentes de gráficos

### Logs importantes

**Backend:**
```
[api/amendoim/analise] Request params: { dataInicio, dataFim }
[api/amendoim/analise] Response summary: { ... }
```

**Frontend:**
```
[Amendoim] Fetching: url
[Amendoim] Response: data
[Horarios] Fetching com filtros: { ... }
[Horarios] Dados recebidos: X registros
```
