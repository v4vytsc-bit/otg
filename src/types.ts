export type AppTheme = 'dark' | 'light' | 'oled' | 'amber';

export interface VideoItem {
  id: string;
  name: string;
  filePath: string;
  parentFolder: string;
  sizeBytes: number;
  durationMs: number;
  thumbnailUrl: string;
  videoUrl: string;
  format: string; // "mkv", "mp4", "avi", "mov", "webm"
  codec: string; // "H.264", "HEVC 10-bit", "VP9", "AV1"
  resolution: string; // "4K 2160p", "1080p FHD", "720p HD"
  audioTracks: { id: string; label: string; language: string }[];
  subtitles: { id: string; label: string; language: string; url?: string; content?: string }[];
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentPath: string;
  itemCount: number;
}

export interface OtgDrive {
  id: string; // Unique drive serial or UUID (e.g. "SANDISK_ULTRA_8C3F")
  label: string; // "SanDisk Ultra (64 GB)"
  fileSystem: 'FAT32' | 'exFAT' | 'NTFS' | 'SAF_NATIVE';
  capacityBytes: number;
  usedBytes: number;
  isRealDrive?: boolean;
  folders: FolderItem[];
  videos: VideoItem[];
}

export interface WatchHistoryRecord {
  id: string; // composite: `${driveId}:${filePath}`
  driveId: string;
  filePath: string;
  fileName: string;
  lastPositionMs: number;
  totalDurationMs: number;
  updatedAt: number;
  isCompleted: boolean;
}

export type AndroidVersion = '6.0' | '9.0' | '11.0' | '14.0';
export type DeviceBrand = 'Realme_ColorOS' | 'Xiaomi_MIUI' | 'Samsung_OneUI' | 'Google_Pixel_AOSP';

export interface DeviceConfig {
  androidVersion: AndroidVersion;
  apiLevel: number;
  brand: DeviceBrand;
  otgPowerEnabled: boolean; // For ColorOS/Realme OTG 10-minute auto-off
  lowRamDevice: boolean;
  softwareCodecFallback: boolean;
  storageAccessLayer: 'SAF' | 'libaums_USB_Host';
}

export interface PlayerGestureState {
  isDragging: boolean;
  type: 'none' | 'brightness' | 'volume' | 'seek';
  deltaValue: number;
  currentValue: number;
  seekTargetMs: number;
  seekDeltaMs: number;
}

export type AspectRatioMode = 'FIT' | 'FILL' | '16_9' | '4_3' | 'ORIGINAL';

export type AudioOutputType = 'speaker' | 'bluetooth' | 'usb_dac' | 'wired_headset' | 'hdmi' | 'system_default';

export interface AudioOutputDevice {
  id: string;
  name: string;
  type: AudioOutputType;
  isAvailable: boolean;
  isBluetooth?: boolean;
  batteryPercent?: number;
  sampleRate?: string;
  rawSinkId?: string; // For browser setSinkId API
}

export type AudioRoutingPolicy = 'auto_android' | 'manual';

export interface AudioRoutingState {
  policy: AudioRoutingPolicy;
  activeDeviceId: string;
  availableDevices: AudioOutputDevice[];
  autoSelectedDevice: AudioOutputDevice;
}

export interface SubtitleCue {
  startTime: number;
  endTime: number;
  text: string;
}
