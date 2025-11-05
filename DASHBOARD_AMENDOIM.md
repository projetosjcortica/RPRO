# Dashboard Amendoim - Inicialização Rápida

## ⚡ Setup Rápido

### 1. Iniciar Backend e Frontend
```powershell
# Terminal 1 - Backend
cd back-end
npm run dev

# Terminal 2 - Frontend  
cd Frontend
npm run dev
```

### 2. Popular Dados de Teste

**Via POST Request:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/amendoim/seed" -Method POST
```

Isso cria automaticamente dados dos últimos 7 dias.

### 3. Acessar Dashboard

- Login com usuário tipo `amendoim`
- Dashboard aparecerá automaticamente com 3 gráficos

---

## 🔧 Backend Robusto

O backend agora:
- ✅ Sempre retorna estrutura válida (mesmo sem dados)
- ✅ Trata erros graciosamente
- ✅ Retorna arrays vazios mas válidos quando não há dados
- ✅ Não quebra o frontend em caso de falha

### Estrutura Retornada (sempre)
```json
{
  "entradaSaidaPorHorario": [...],  // 24 horas
  "fluxoSemanal": [...],            // 7 dias
  "eficienciaPorTurno": [...],      // 4 turnos
  "rendimentoPorDia": [...],        // dias do período
  "perdaAcumulada": [...]           // dias do período
}
```

---

## 🎨 Interface

**Layout:**
- Altura fixa (como home de ração)
- Scroll interno apenas
- Grid 2 colunas para primeiros 2 gráficos
- Gráfico de turno em largura total

**Sem debug:**
- Removidos logs excessivos
- Removida caixa amarela de debug
- Interface limpa e profissional

**Filtros:**
- Horário de Produção: range de datas (padrão: ontem)
- Produção Semanal: navegação semanal (padrão: semana atual)
- Eficiência por Turno: range de datas (padrão: ontem)

---

## 📊 Gráficos

1. **Horário de Produção**
   - Bar chart: entrada vs saída por hora (0-23h)
   - Mostra padrão de produção ao longo do dia

2. **Produção Semanal**
   - Bar chart: entrada vs saída por dia da semana
   - Domingo sempre à esquerda

3. **Eficiência por Turno**
   - Composed chart: bars (entrada/saída) + line (rendimento %)
   - 4 turnos: Madrugada, Manhã, Tarde, Noite

---

## 🚀 Pronto para Produção

Backend preparado para:
- Dados reais via FTP collector
- Múltiplos períodos de consulta
- Cache futuro
- Integração com outros módulos

Frontend pronto para:
- Responsividade
- Temas personalizados
- Exportação de dados
- Mais gráficos conforme necessário
