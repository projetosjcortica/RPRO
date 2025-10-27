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

# no terminal 2 (frontend)
cd Frontend; npm run dev

