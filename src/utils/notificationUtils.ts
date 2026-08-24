// Browser Notification & MediaSession Controller for Android OTG VLC Player

export interface MediaNotificationPayload {
  title: string;
  artist?: string;
  album?: string;
  thumbnailUrl: string;
  isPlaying: boolean;
  playbackSpeed: number;
  currentTimeMs: number;
  durationMs: number;
}

// 1. Setup Web MediaSession API (Native Android / Windows / macOS OS Notification Controls)
export function updateSystemMediaSession(
  payload: MediaNotificationPayload,
  handlers: {
    onPlay: () => void;
    onPause: () => void;
    onSeekForward: () => void;
    onSeekBackward: () => void;
    onSeekTo?: (timeSec: number) => void;
  }
) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: payload.title,
      artist: payload.artist || 'OTG Media Explorer',
      album: payload.album || 'USB OTG Pendrive',
      artwork: [
        { src: payload.thumbnailUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: payload.thumbnailUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: payload.thumbnailUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: payload.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.playbackState = payload.isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('seekforward', handlers.onSeekForward);
    navigator.mediaSession.setActionHandler('seekbackward', handlers.onSeekBackward);

    if (handlers.onSeekTo && 'setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && handlers.onSeekTo) {
          handlers.onSeekTo(details.seekTime);
        }
      });
    }

    if ('setPositionState' in navigator.mediaSession && payload.durationMs > 0) {
      navigator.mediaSession.setPositionState({
        duration: payload.durationMs / 1000,
        playbackRate: payload.playbackSpeed || 1.0,
        position: Math.min(payload.durationMs / 1000, payload.currentTimeMs / 1000),
      });
    }
  } catch (err) {
    console.debug('MediaSession error:', err);
  }
}

// 2. Browser Native Notification API Trigger
let activeBrowserNotification: Notification | null = null;

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function showBrowserMediaNotification(
  title: string,
  body: string,
  iconUrl?: string,
  tag = 'otg-vlc-playback'
) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    if (activeBrowserNotification) {
      activeBrowserNotification.close();
    }

    activeBrowserNotification = new Notification(title, {
      body,
      icon: iconUrl || '/icon.png',
      tag,
      silent: true,
      requireInteraction: false,
    });

    setTimeout(() => {
      if (activeBrowserNotification) {
        activeBrowserNotification.close();
        activeBrowserNotification = null;
      }
    }, 4000);
  } catch (err) {
    console.debug('Notification API failed:', err);
  }
}
