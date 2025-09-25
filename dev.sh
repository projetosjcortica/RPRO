#!/usr/bin/env bash
# dev.sh - inicia frontend e backend em modo dev
# Uso: bash ./dev.sh
# Este script inicia os dois processos em background, encaminha logs e mata ambos quando receber SIGINT/SIGTERM.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/back-end"
FRONTEND_DIR="$ROOT_DIR/Frontend"

# Comandos (ajuste se necessário)
BACKEND_CMD=(npm run dev)
FRONTEND_CMD=(npm run dev)

echo "[dev.sh] Root: $ROOT_DIR"

# Start backend
echo "[dev.sh] Starting backend in: $BACKEND_DIR"
( cd "$BACKEND_DIR" && "${BACKEND_CMD[@]}" ) &
PID_BACK=$!

# Short delay to improve log ordering
sleep 0.5

# Start frontend
echo "[dev.sh] Starting frontend in: $FRONTEND_DIR"
( cd "$FRONTEND_DIR" && "${FRONTEND_CMD[@]}" ) &
PID_FRONT=$!

echo "[dev.sh] Backend PID: $PID_BACK | Frontend PID: $PID_FRONT"

# On exit or signal, kill both children
_cleanup() {
  echo "[dev.sh] Stopping processes..."
  kill -TERM "$PID_BACK" 2>/dev/null || true
  kill -TERM "$PID_FRONT" 2>/dev/null || true
  wait "$PID_BACK" 2>/dev/null || true
  wait "$PID_FRONT" 2>/dev/null || true
  echo "[dev.sh] All stopped."
}

trap _cleanup INT TERM EXIT

# Wait for both
wait "$PID_BACK" "$PID_FRONT" || true

# cleanup will run via trap
exit 0
