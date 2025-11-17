Dev helper

Esse repositório contém duas aplicações: backend (pasta `back-end`) e frontend (pasta `Frontend`).

Scripts

- dev.sh — script que inicia backend e frontend em paralelo (Bash).

Pré-requisitos

- Node.js >= 18 e npm/yarn
- Se não tiver MySQL, o backend tentará criar um banco SQLite local automaticamente.

Como usar (fish shell)

# Torne o script executável (se ainda não estiver)
chmod +x ./dev.sh

# Execute
./dev.sh

Observações

- Logs dos dois serviços aparecem no terminal. Para interromper, pressione Ctrl+C — o script enviará SIGTERM para ambos.
- Se preferir executar manualmente em terminais separados:

# no terminal 1 (backend)
cd back-end; npm run dev

Windows (PowerShell)

Se você está em Windows e não usa o script Bash, há um helper PowerShell que inicia os dois dev servers e salva logs em `back-end/logs`:

1. Abra PowerShell
2. Execute:

	cd .\scripts
	.\start-dev-windows.ps1

3. Para ver logs (em tempo real):

	Get-Content -Wait ..\back-end\logs\backend-dev.log | Select-Object -Last 200

Observações: o script detecta portas ocupadas (3000 para backend; 5173 para frontend) e mostra qual processo está usando a porta.

# no terminal 2 (frontend)
cd Frontend; npm run dev

