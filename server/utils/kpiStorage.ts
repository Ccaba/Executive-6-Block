import fs from 'node:fs';
import path from 'node:path';
import type { BoardData, KPIItem } from '../../types/kpi.ts';
import { DEFAULT_BOARD_DATA, DEFAULT_KPIS } from '../../types/kpi.ts';

export { DEFAULT_BOARD_DATA, DEFAULT_KPIS };

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.resolve(DATA_DIR, 'kpi_store.json');

let inMemoryBoardData: BoardData = JSON.parse(JSON.stringify(DEFAULT_BOARD_DATA));

export function getStoredBoardData(): BoardData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.kpis) && data.kpis.length === 6) {
        inMemoryBoardData = data;
        return inMemoryBoardData;
      }
    }
  } catch (err) {
    console.error('Error reading KPI store file:', err);
  }
  return inMemoryBoardData;
}

export function saveStoredBoardData(data: Partial<BoardData>): BoardData {
  try {
    const current = getStoredBoardData();
    const updated: BoardData = {
      title: data.title ?? current.title,
      subtitle: data.subtitle ?? current.subtitle,
      lastSync: new Date().toISOString(),
      kpis: data.kpis ? [...data.kpis] : current.kpis
    };

    inMemoryBoardData = updated;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error saving KPI store file:', err);
    return inMemoryBoardData;
  }
}

export function updateSingleKpi(id: string, updates: Partial<KPIItem>): BoardData {
  const current = getStoredBoardData();
  const kpis = current.kpis.map((kpi) => {
    if (kpi.id === id) {
      return {
        ...kpi,
        ...updates,
        lastUpdated: updates.lastUpdated || new Date().toISOString().split('T')[0]
      };
    }
    return kpi;
  });

  return saveStoredBoardData({ kpis });
}

export function resetBoardData(): BoardData {
  return saveStoredBoardData(DEFAULT_BOARD_DATA);
}
