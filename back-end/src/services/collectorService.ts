import "reflect-metadata";
import fs from "fs";
import path from "path";
import { getRuntimeConfig } from "../core/runtimeConfig";

const POLL_INTERVAL = Number(
  getRuntimeConfig("poll_interval_ms") ??
    process.env.POLL_INTERVAL_MS ??
    "60000"
);
const TMP_DIR = path.resolve(
  process.cwd(),
  String(
    getRuntimeConfig("collector_tmp") ?? process.env.COLLECTOR_TMP ?? "tmp"
  )
);
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

type CollectorStatus = {
  running: boolean;
  stopRequested: boolean;
  startedAt: string | null;
  lastCycleAt: string | null;
  lastFinishedAt: string | null;
  lastError: string | null;
  cycles: number;
  pollIntervalMs: number;
};

const collectorState: CollectorStatus = {
  running: false,
  stopRequested: false,
  startedAt: null,
  lastCycleAt: null,
  lastFinishedAt: null,
  lastError: null,
  cycles: 0,
  pollIntervalMs: POLL_INTERVAL,
};

let stopFlag = false;
let loopPromise: Promise<void> | null = null;

export function getCollectorStatus(): CollectorStatus {
  return { ...collectorState };
}

export async function startCollector(overrideConfig?: {
  ip?: string;
  user?: string;
  password?: string;
}): Promise<{
  started: boolean;
  message?: string;
  status: CollectorStatus;
}> {
  if (collectorState.running || collectorState.stopRequested) {
    return {
      started: false,
      message: "Collector já está em execução.",
      status: getCollectorStatus(),
    };
  }

  const runtimeIhm = getRuntimeConfig("ihm-config") || {};

  const finalIp = overrideConfig?.ip ?? runtimeIhm.ip ?? getRuntimeConfig("ip");
  const finalUser = overrideConfig?.user ?? runtimeIhm.user ?? getRuntimeConfig("user");
  const finalPassword = overrideConfig?.password ?? runtimeIhm.password ?? getRuntimeConfig("password");

  if (!finalIp || !finalUser || !finalPassword) {
    return {
      started: false,
      message: "Missing required FTP configuration (ip, user, password).",
      status: getCollectorStatus(),
    };
  }

  const { runner } = await import("../collector/runner");

  stopFlag = false;
  collectorState.running = true;
  collectorState.stopRequested = false;
  collectorState.startedAt = new Date().toISOString();
  collectorState.lastError = null;

  const runCycle = () =>
    runner({
      ip: finalIp,
      user: finalUser,
      password: finalPassword,
      tmpDir: TMP_DIR,
    });

  const loop = async () => {
    try {
      while (!stopFlag) {
        try {
          console.log(`[collector] iniciando ciclo #${collectorState.cycles + 1}`);
          await runCycle();
          collectorState.cycles += 1;
          collectorState.lastCycleAt = new Date().toISOString();
          collectorState.lastError = null;
        } catch (err) {
          collectorState.lastError = err instanceof Error ? err.message : String(err);
          console.error("[collector cycle error]", err);
        }

        if (stopFlag) break;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    } finally {
      collectorState.running = false;
      collectorState.stopRequested = false;
      collectorState.lastFinishedAt = new Date().toISOString();
      stopFlag = false;
      loopPromise = null;
    }
  };

  loopPromise = loop();

  return {
    started: true,
    status: getCollectorStatus(),
  };
}

export async function stopCollector(): Promise<{
  stopped: boolean;
  message?: string;
  status: CollectorStatus;
}> {
  if (!collectorState.running && !collectorState.stopRequested) {
    return {
      stopped: false,
      message: "Collector já está parado.",
      status: getCollectorStatus(),
    };
  }

  stopFlag = true;
  collectorState.stopRequested = true;

  const pendingLoop = loopPromise;
  if (pendingLoop) {
    try {
      await pendingLoop;
    } catch (err) {
      collectorState.lastError = err instanceof Error ? err.message : String(err);
      console.error("[collector stop] erro aguardando encerramento", err);
    }
  } else {
    collectorState.running = false;
    collectorState.stopRequested = false;
    collectorState.lastFinishedAt = new Date().toISOString();
    stopFlag = false;
  }

  return {
    stopped: true,
    status: getCollectorStatus(),
  };
}
