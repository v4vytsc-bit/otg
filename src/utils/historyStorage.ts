import { WatchHistoryRecord } from '../types';

const STORAGE_KEY = 'otg_player_watch_history_v1';

// Pre-seeded initial records to showcase YouTube-style progress bars & resume prompts
const INITIAL_SEEDED_HISTORY: WatchHistoryRecord[] = [
  {
    id: 'SANDISK_ULTRA_64GB_9A21:/Movies & Cinema/Tears_of_Steel_1080p_HEVC.mkv',
    driveId: 'SANDISK_ULTRA_64GB_9A21',
    filePath: '/Movies & Cinema/Tears_of_Steel_1080p_HEVC.mkv',
    fileName: 'Tears_of_Steel_1080p_HEVC.mkv',
    lastPositionMs: 550500, // ~75% (09:10 / 12:14)
    totalDurationMs: 734000,
    updatedAt: Date.now() - 3600 * 1000 * 2,
    isCompleted: false,
  },
  {
    id: 'SANDISK_ULTRA_64GB_9A21:/Anime & Animations/Sintel_OpenSource_Cinema_4K.mp4',
    driveId: 'SANDISK_ULTRA_64GB_9A21',
    filePath: '/Anime & Animations/Sintel_OpenSource_Cinema_4K.mp4',
    fileName: 'Sintel_OpenSource_Cinema_4K.mp4',
    lastPositionMs: 266400, // ~30% (04:26 / 14:48)
    totalDurationMs: 888000,
    updatedAt: Date.now() - 3600 * 1000 * 24,
    isCompleted: false,
  },
  {
    id: 'SANDISK_ULTRA_64GB_9A21:/Anime & Animations/Big_Buck_Bunny_60fps_Dolby.mp4',
    driveId: 'SANDISK_ULTRA_64GB_9A21',
    filePath: '/Anime & Animations/Big_Buck_Bunny_60fps_Dolby.mp4',
    fileName: 'Big_Buck_Bunny_60fps_Dolby.mp4',
    lastPositionMs: 590000, // 99% (Completed)
    totalDurationMs: 596000,
    updatedAt: Date.now() - 3600 * 1000 * 48,
    isCompleted: true,
  },
  {
    id: 'SANDISK_ULTRA_64GB_9A21:/Movies & Cinema/Sci-Fi Shorts/SciFi_Station_Alpha_Log_04.mkv',
    driveId: 'SANDISK_ULTRA_64GB_9A21',
    filePath: '/Movies & Cinema/Sci-Fi Shorts/SciFi_Station_Alpha_Log_04.mkv',
    fileName: 'SciFi_Station_Alpha_Log_04.mkv',
    lastPositionMs: 140000, // ~45% (02:20 / 05:10)
    totalDurationMs: 310000,
    updatedAt: Date.now() - 3600 * 1000 * 5,
    isCompleted: false,
  }
];

export class HistoryDatabase {
  private static loadAll(): Record<string, WatchHistoryRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Seed
        const seedMap: Record<string, WatchHistoryRecord> = {};
        for (const item of INITIAL_SEEDED_HISTORY) {
          seedMap[item.id] = item;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMap));
        return seedMap;
      }
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private static saveAll(map: Record<string, WatchHistoryRecord>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  public static getRecord(driveId: string, filePath: string): WatchHistoryRecord | null {
    const key = `${driveId}:${filePath}`;
    const all = this.loadAll();
    return all[key] || null;
  }

  public static getAllForDrive(driveId: string): WatchHistoryRecord[] {
    const all = this.loadAll();
    return Object.values(all)
      .filter((rec) => rec.driveId === driveId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public static getAll(): WatchHistoryRecord[] {
    const all = this.loadAll();
    return Object.values(all).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public static getLatestUnfinished(driveId: string): WatchHistoryRecord | null {
    const records = this.getAllForDrive(driveId).filter((r) => !r.isCompleted && r.lastPositionMs > 5000);
    return records.length > 0 ? records[0] : null;
  }

  public static saveProgress(
    driveId: string,
    filePath: string,
    fileName: string,
    positionMs: number,
    durationMs: number
  ): WatchHistoryRecord {
    const key = `${driveId}:${filePath}`;
    const all = this.loadAll();
    const isCompleted = durationMs > 0 && positionMs >= durationMs * 0.95;

    const record: WatchHistoryRecord = {
      id: key,
      driveId,
      filePath,
      fileName,
      lastPositionMs: isCompleted ? 0 : Math.max(0, positionMs),
      totalDurationMs: durationMs,
      updatedAt: Date.now(),
      isCompleted,
    };

    all[key] = record;
    this.saveAll(all);
    return record;
  }

  public static removeRecord(driveId: string, filePath: string) {
    const key = `${driveId}:${filePath}`;
    const all = this.loadAll();
    delete all[key];
    this.saveAll(all);
  }

  public static resetDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    return this.loadAll();
  }
}

export function formatTime(ms: number): string {
  if (isNaN(ms) || ms < 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
