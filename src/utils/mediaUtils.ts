import { SubtitleCue, WatchHistoryRecord } from '../types';

export function formatTime(ms: number): string {
  if (isNaN(ms) || ms < 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function parseSrt(srtContent: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 2) {
      let timeIndex = 0;
      if (/^\d+$/.test(lines[0].trim())) {
        timeIndex = 1;
      }
      const timeLine = lines[timeIndex];
      if (!timeLine) continue;

      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
      if (timeMatch) {
        const startTime = parseTimestampToMs(timeMatch[1]);
        const endTime = parseTimestampToMs(timeMatch[2]);
        const text = lines.slice(timeIndex + 1).join('\n');
        cues.push({ startTime, endTime, text });
      }
    }
  }

  return cues;
}

function parseTimestampToMs(timeStr: string): number {
  const [hms, msPart] = timeStr.split(/[,\.]/);
  const [h, m, s] = hms.split(':').map(Number);
  const ms = Number(msPart || 0);
  return (h * 3600 + m * 60 + s) * 1000 + ms;
}

const STORAGE_KEY = 'otg_vlc_watch_history_v1';

export function loadAllHistory(): Record<string, WatchHistoryRecord> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return {};
  }
}

export function saveHistoryRecord(record: WatchHistoryRecord): void {
  try {
    const all = loadAllHistory();
    all[record.id] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save watch history record', e);
  }
}

export function getHistoryForFile(driveId: string, filePath: string): WatchHistoryRecord | null {
  const all = loadAllHistory();
  const key = `${driveId}:${filePath}`;
  return all[key] || null;
}

export function getLastUnfinishedVideo(driveId: string): WatchHistoryRecord | null {
  const all = loadAllHistory();
  const records = Object.values(all).filter(
    (r) => r.driveId === driveId && !r.isCompleted && r.lastPositionMs > 10000 && r.lastPositionMs < r.totalDurationMs * 0.9
  );
  if (records.length === 0) return null;
  // Sort by latest updated
  records.sort((a, b) => b.updatedAt - a.updatedAt);
  return records[0];
}

export function clearHistoryForDrive(driveId: string): void {
  try {
    const all = loadAllHistory();
    const updated: Record<string, WatchHistoryRecord> = {};
    for (const [k, v] of Object.entries(all)) {
      if (v.driveId !== driveId) {
        updated[k] = v;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to clear drive history', e);
  }
}
