import path from 'path';
import fs from 'fs';
import { IHMService } from '../services/IHMService';
import { dbService } from '../services/dbService';

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
const rawServer =
  process.env.INGEST_URL || process.env.SERVER_URL || 'http://192.168.5.200';
const SERVER_URL = /^(?:https?:)\/\//i.test(rawServer)
  ? rawServer
  : `http://${rawServer}`;
const INGEST_TOKEN = process.env.INGEST_TOKEN;

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

let STOP = false;

export function stopCollector() {
  STOP = true;
}

const ihmService = new IHMService(
  process.env.IHM_IP || '192.168.5.254',
  process.env.IHM_USER || 'anonymous',
  process.env.IHM_PASSWORD || ''
);

async function fetchAndProcessData() {
  try {
    const newFiles = await ihmService.findAndDownloadNewFiles(TMP_DIR);
    for (const file of newFiles) {
      console.log(`Processing file: ${file.name}`);
      // Process the file and insert data into the database
      const result = await dbService.insertRelatorioRows([], file.localPath);
      console.log(`Inserted ${result} rows from ${file.name}`);
    }
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
}

export async function startCollector() {
  while (!STOP) {
    console.log('Collector running...');
    await fetchAndProcessData();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}