import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Sun, 
  Maximize, 
  Minimize, 
  PictureInPicture2, 
  Headphones, 
  Lock, 
  Unlock, 
  Subtitles, 
  Languages, 
  Crop, 
  Settings, 
  X, 
  ChevronLeft,
  FastForward,
  Rewind,
  Info,
  Check,
  Gauge,
  EyeOff,
  Bell,
  Speaker,
  Bluetooth,
  HardDrive
} from 'lucide-react';
import { AspectRatioMode, SubtitleCue, VideoItem, WatchHistoryRecord, AudioRoutingState } from '../types';
import { formatTime, parseSrt } from '../utils/mediaUtils';
import { updateSystemMediaSession, showBrowserMediaNotification } from '../utils/notificationUtils';
import { applyAudioSinkToElement } from '../utils/audioRoutingUtils';

interface VlcPlayerProps {
  video: VideoItem;
  driveId: string;
  initialPositionMs?: number;
  onClose: () => void;
  onSaveProgress: (positionMs: number, durationMs: number, isCompleted: boolean) => void;
  onEnterBackgroundPlay: () => void;
  onEnterPip: () => void;
  softwareCodecFallbackEnabled?: boolean;
  onSpeedChange?: (speed: number) => void;
  onNotify?: (title: string, message: string) => void;
  audioRoutingState?: AudioRoutingState;
  onOpenAudioRoutingModal?: () => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

export const VlcPlayer: React.FC<VlcPlayerProps> = ({
  video,
  driveId,
  initialPositionMs = 0,
  onClose,
  onSaveProgress,
  onEnterBackgroundPlay,
  onEnterPip,
  softwareCodecFallbackEnabled = true,
  onSpeedChange,
  onNotify,
  audioRoutingState,
  onOpenAudioRoutingModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(initialPositionMs);
  const [durationMs, setDurationMs] = useState(video.durationMs || 1000);
  const [volume, setVolume] = useState(0.8); // 0.0 - 1.0
  const [brightness, setBrightness] = useState(100); // 10 - 100%
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isTouchLocked, setIsTouchLocked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('FIT');
  
  // Track Selectors
  const [selectedAudioTrack, setSelectedAudioTrack] = useState(video.audioTracks[0]?.id || 'default');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string | null>(null);

  // Menus
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAspectRatioMenu, setShowAspectRatioMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Gesture State & HUDs
  const [activeGesture, setActiveGesture] = useState<'none' | 'brightness' | 'volume' | 'seek' | 'speed'>('none');
  const [gestureDeltaMs, setGestureDeltaMs] = useState(0);
  const [doubleTapRipple, setDoubleTapRipple] = useState<'left' | 'right' | null>(null);
  const [speedNotificationText, setSpeedNotificationText] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; startVol: number; startBright: number; startPos: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  // Apply speed to video element
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    if (onSpeedChange) onSpeedChange(speed);
    
    setSpeedNotificationText(`${speed}x Speed`);
    setTimeout(() => setSpeedNotificationText(null), 1500);

    if (onNotify) {
      onNotify('Playback Speed Changed', `Playing at ${speed}x speed`);
    }
    showBrowserMediaNotification(`Speed: ${speed}x`, video.name, video.thumbnailUrl);
  };

  // Keyboard shortcuts (e.g. Space to play/pause, [ and ] for speed, M for mute, F for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        handleSeek(Math.min(durationMs / 1000, currentTimeMs / 1000 + 10));
      } else if (e.key === 'ArrowLeft') {
        handleSeek(Math.max(0, currentTimeMs / 1000 - 10));
      } else if (e.key === ']' || e.key === '>') {
        const nextIdx = SPEED_OPTIONS.findIndex(s => s > playbackSpeed);
        if (nextIdx !== -1) handleSetSpeed(SPEED_OPTIONS[nextIdx]);
      } else if (e.key === '[' || e.key === '<') {
        const prevOptions = SPEED_OPTIONS.filter(s => s < playbackSpeed);
        if (prevOptions.length > 0) handleSetSpeed(prevOptions[prevOptions.length - 1]);
      } else if (e.key === '\\') {
        handleSetSpeed(1.0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackSpeed, currentTimeMs, durationMs]);

  // Update MediaSession
  useEffect(() => {
    updateSystemMediaSession(
      {
        title: video.name,
        artist: `${video.codec} • ${video.resolution}`,
        album: 'OTG Pendrive VLC Player',
        thumbnailUrl: video.thumbnailUrl,
        isPlaying,
        playbackSpeed,
        currentTimeMs,
        durationMs,
      },
      {
        onPlay: () => {
          if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
          }
        },
        onPause: () => {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        },
        onSeekForward: () => handleSeek(Math.min(durationMs / 1000, currentTimeMs / 1000 + 10)),
        onSeekBackward: () => handleSeek(Math.max(0, currentTimeMs / 1000 - 10)),
        onSeekTo: (sec) => handleSeek(sec),
      }
    );
  }, [video, isPlaying, playbackSpeed, currentTimeMs, durationMs]);

  // Apply Audio Sink routing (e.g. Bluetooth TWS, USB-C DAC, Speaker)
  useEffect(() => {
    if (audioRoutingState && videoRef.current) {
      const activeDev = audioRoutingState.availableDevices.find(
        (d) => d.id === audioRoutingState.activeDeviceId
      ) || audioRoutingState.autoSelectedDevice;
      if (activeDev) {
        applyAudioSinkToElement(videoRef.current, activeDev);
      }
    }
  }, [audioRoutingState]);

  // 1. Initial Seek on Load
  useEffect(() => {
    if (videoRef.current && initialPositionMs > 0) {
      videoRef.current.currentTime = initialPositionMs / 1000;
    }
  }, [initialPositionMs]);

  // 2. Parse Subtitles if changed
  useEffect(() => {
    if (selectedSubtitle === 'off') {
      setSubtitleCues([]);
      setCurrentSubtitleText(null);
      return;
    }
    const sub = video.subtitles.find(s => s.id === selectedSubtitle);
    if (sub && sub.content) {
      const parsed = parseSrt(sub.content);
      setSubtitleCues(parsed);
    }
  }, [selectedSubtitle, video.subtitles]);

  // 3. Periodic Auto-Save Progress (Every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const curMs = videoRef.current.currentTime * 1000;
        const durMs = (videoRef.current.duration || video.durationMs / 1000) * 1000;
        const isComp = curMs >= durMs * 0.9;
        onSaveProgress(curMs, durMs, isComp);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [onSaveProgress, video.durationMs]);

  // Hide Controls on Inactivity
  const resetControlsTimeout = () => {
    if (isTouchLocked) return;
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
        setShowAudioMenu(false);
        setShowSubtitleMenu(false);
        setShowAspectRatioMenu(false);
      }
    }, 4000);
  };

  // Video Time Update & Subtitle Sync
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curMs = videoRef.current.currentTime * 1000;
    setCurrentTimeMs(curMs);

    // Sync Subtitle Cue
    if (subtitleCues.length > 0) {
      const activeCue = subtitleCues.find(c => curMs >= c.startTime && curMs <= c.endTime);
      setCurrentSubtitleText(activeCue ? activeCue.text : null);
    } else {
      setCurrentSubtitleText(null);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  const handleSeek = (timeSec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timeSec;
    setCurrentTimeMs(timeSec * 1000);
    resetControlsTimeout();
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTouchLocked) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !videoRef.current) return;

    const clientX = 'clientX' in e ? e.clientX : (e as React.TouchEvent).touches[0]?.clientX || 0;
    const isRightSide = clientX > rect.left + rect.width / 2;

    if (isRightSide) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
      setDoubleTapRipple('right');
    } else {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      setDoubleTapRipple('left');
    }

    setTimeout(() => setDoubleTapRipple(null), 600);
  };

  // GESTURE CONTROLLER (Mouse / Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTouchLocked) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      handleDoubleTap(e);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !videoRef.current) return;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startVol: volume,
      startBright: brightness,
      startPos: videoRef.current.currentTime * 1000,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isTouchLocked || !dragStartRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (activeGesture === 'none') {
      if (absX > 20 || absY > 20) {
        if (absX > absY) {
          setActiveGesture('seek');
        } else {
          // Left side = Brightness, Right side = Volume
          const isLeft = dragStartRef.current.x < rect.left + rect.width * 0.5;
          setActiveGesture(isLeft ? 'brightness' : 'volume');
        }
      }
    }

    if (activeGesture === 'brightness') {
      const step = (-deltaY / rect.height) * 100;
      const nextBright = Math.round(Math.min(100, Math.max(10, dragStartRef.current.startBright + step)));
      setBrightness(nextBright);
    } else if (activeGesture === 'volume') {
      const step = (-deltaY / rect.height);
      const nextVol = Math.min(1, Math.max(0, dragStartRef.current.startVol + step));
      setVolume(nextVol);
      if (videoRef.current) videoRef.current.volume = nextVol;
    } else if (activeGesture === 'seek') {
      const deltaSec = (deltaX / rect.width) * 90; // +/- 90 sec scrub
      setGestureDeltaMs(deltaSec * 1000);
    }
  };

  const handlePointerUp = () => {
    if (activeGesture === 'seek' && videoRef.current) {
      const targetSec = (dragStartRef.current?.startPos || 0) / 1000 + gestureDeltaMs / 1000;
      videoRef.current.currentTime = Math.min(videoRef.current.duration || 1000, Math.max(0, targetSec));
    }
    dragStartRef.current = null;
    setActiveGesture('none');
    setGestureDeltaMs(0);
    resetControlsTimeout();
  };

  // Video aspect ratio classes
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case 'FILL':
        return 'w-full h-full object-cover';
      case '16_9':
        return 'w-full aspect-video object-contain';
      case '4_3':
        return 'w-full aspect-[4/3] object-contain';
      case 'ORIGINAL':
        return 'max-w-full max-h-full object-none';
      case 'FIT':
      default:
        return 'w-full h-full object-contain';
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden select-none touch-none"
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* Video Element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          src={video.videoUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDurationMs(videoRef.current.duration * 1000);
              if (initialPositionMs > 0) {
                videoRef.current.currentTime = initialPositionMs / 1000;
              }
              videoRef.current.play();
              setIsPlaying(true);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            if (videoRef.current) {
              onSaveProgress(durationMs, durationMs, true);
            }
          }}
          className={`${getAspectRatioStyle()} transition-all duration-200`}
        />
      </div>

      {/* Subtitles Overlay */}
      {currentSubtitleText && (
        <div className="absolute bottom-20 inset-x-4 text-center pointer-events-none z-20">
          <span className="inline-block bg-black/85 text-yellow-300 font-semibold text-sm sm:text-base px-3 py-1.5 rounded-lg shadow-2xl backdrop-blur-sm border border-yellow-500/20 max-w-2xl leading-relaxed whitespace-pre-line">
            {currentSubtitleText}
          </span>
        </div>
      )}

      {/* Speed Changed Notification Pill */}
      {speedNotificationText && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-orange-600/90 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-2xl z-40 flex items-center space-x-2 animate-in zoom-in-95">
          <Gauge className="w-3.5 h-3.5" />
          <span>{speedNotificationText}</span>
        </div>
      )}

      {/* GESTURE HUD OVERLAYS */}
      {/* 1. Brightness HUD (Left Side) */}
      {activeGesture === 'brightness' && (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-gray-700 flex flex-col items-center space-y-2 z-30 animate-in fade-in">
          <Sun className="w-6 h-6 text-orange-500" />
          <div className="w-1.5 h-24 bg-gray-700 rounded-full overflow-hidden flex flex-col justify-end">
            <div className="bg-orange-500 w-full rounded-full transition-all" style={{ height: `${brightness}%` }} />
          </div>
          <span className="font-mono text-xs font-bold text-white">{brightness}%</span>
        </div>
      )}

      {/* 2. Volume HUD (Right Side) */}
      {activeGesture === 'volume' && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-gray-700 flex flex-col items-center space-y-2 z-30 animate-in fade-in">
          {volume === 0 ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-orange-500" />}
          <div className="w-1.5 h-24 bg-gray-700 rounded-full overflow-hidden flex flex-col justify-end">
            <div className="bg-orange-500 w-full rounded-full transition-all" style={{ height: `${volume * 100}%` }} />
          </div>
          <span className="font-mono text-xs font-bold text-white">{Math.round(volume * 100)}%</span>
        </div>
      )}

      {/* 3. Seek Scrub HUD (Center) */}
      {activeGesture === 'seek' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-md px-6 py-4 rounded-2xl border border-orange-500/50 flex flex-col items-center space-y-1 z-30 shadow-2xl">
          <div className="flex items-center space-x-2 text-orange-500 font-mono text-lg font-bold">
            {gestureDeltaMs >= 0 ? <FastForward className="w-5 h-5" /> : <Rewind className="w-5 h-5" />}
            <span>{gestureDeltaMs >= 0 ? `+${formatTime(gestureDeltaMs)}` : `-${formatTime(Math.abs(gestureDeltaMs))}`}</span>
          </div>
          <div className="text-xs text-gray-300 font-mono">
            Target: {formatTime(currentTimeMs + gestureDeltaMs)} / {formatTime(durationMs)}
          </div>
        </div>
      )}

      {/* 4. Double Tap Visual Ripples */}
      {doubleTapRipple === 'left' && (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-5 rounded-full flex items-center space-x-1 text-white font-bold text-sm animate-ping pointer-events-none z-30">
          <Rewind className="w-6 h-6" />
          <span>-10s</span>
        </div>
      )}
      {doubleTapRipple === 'right' && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-5 rounded-full flex items-center space-x-1 text-white font-bold text-sm animate-ping pointer-events-none z-30">
          <span>+10s</span>
          <FastForward className="w-6 h-6" />
        </div>
      )}

      {/* Touch Lock Indicator (Always visible when locked) */}
      {isTouchLocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsTouchLocked(false);
          }}
          className="absolute top-6 left-6 p-3 bg-red-600/90 hover:bg-red-500 text-white rounded-full shadow-2xl z-40 flex items-center space-x-2 animate-bounce"
        >
          <Lock className="w-5 h-5" />
          <span className="text-xs font-bold pr-1">Tap to Unlock</span>
        </button>
      )}

      {/* TOP HEADER CONTROLS BAR */}
      <div className={`p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
        isControlsVisible && !isTouchLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Back to Explorer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
              {video.name}
            </h2>
            <div className="flex items-center space-x-2 text-[11px] text-gray-300 font-mono">
              <span className="text-orange-400 font-bold">{video.resolution}</span>
              <span>•</span>
              <span>{video.codec}</span>
              {softwareCodecFallbackEnabled && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400">SW Codec Fallback</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Quick Actions: Touch Lock, PiP, Background Play */}
        <div className="flex items-center space-x-2">
          {/* Audio Output Device Quick Switcher */}
          {audioRoutingState && onOpenAudioRoutingModal && (
            <button
              onClick={onOpenAudioRoutingModal}
              title={`Audio Output Device: ${
                audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.name || 'Audio Sink'
              } (${audioRoutingState.policy === 'auto_android' ? 'Auto-routed' : 'Manual'})`}
              className="px-2.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
            >
              {audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.type === 'bluetooth' ? (
                <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
              ) : audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.type === 'wired_headset' ? (
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Speaker className="w-3.5 h-3.5 text-orange-400" />
              )}
              <span className="hidden sm:inline">
                {audioRoutingState.policy === 'auto_android' ? 'Audio: Auto' : 'Audio: Manual'}
              </span>
            </button>
          )}

          {/* Playback Speed Quick Badge */}
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            title="Adjust Playback Speed"
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-mono font-bold flex items-center space-x-1 transition-all"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{playbackSpeed}x</span>
          </button>

          {/* Hide Video & Play Background Audio */}
          <button
            onClick={onEnterBackgroundPlay}
            title="Hide Video (Pure Background Audio Mode with AMOLED Screen-Off)"
            className="p-2 rounded-xl bg-white/10 hover:bg-orange-600 text-white transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          >
            <EyeOff className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Hide Video</span>
          </button>

          {/* Background Audio Button */}
          <button
            onClick={onEnterBackgroundPlay}
            title="Background Audio Playback (MediaSessionService)"
            className="p-2 rounded-xl bg-white/10 hover:bg-orange-600 text-white transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          >
            <Headphones className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Background</span>
          </button>

          {/* Picture-in-Picture Button */}
          <button
            onClick={onEnterPip}
            title="Picture-in-Picture (PiP Mode)"
            className="p-2 rounded-xl bg-white/10 hover:bg-orange-600 text-white transition-colors"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>

          {/* Lock Controls Button */}
          <button
            onClick={() => setIsTouchLocked(true)}
            title="Lock Screen Controls"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Unlock className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROLS & TIMELINE BAR */}
      <div className={`p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-30 transition-opacity duration-300 ${
        isControlsVisible && !isTouchLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        
        {/* Timeline Seek Bar */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-xs font-mono text-gray-300 w-12 text-right">
            {formatTime(currentTimeMs)}
          </span>

          <div className="relative flex-1 group py-2 cursor-pointer">
            <input
              type="range"
              min="0"
              max={durationMs / 1000}
              step="0.1"
              value={currentTimeMs / 1000}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-600 group-hover:h-2 transition-all focus:outline-none"
            />
          </div>

          <span className="text-xs font-mono text-gray-400 w-12">
            {formatTime(durationMs)}
          </span>
        </div>

        {/* Media Controls Row */}
        <div className="flex items-center justify-between">
          
          {/* Left: Speed, Audio Tracks & Subtitles Selectors */}
          <div className="flex items-center space-x-2 relative">
            
            {/* Speed Selector Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  playbackSpeed !== 1.0 || showSpeedMenu ? 'bg-orange-600 text-white font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Playback Speed"
              >
                <Gauge className="w-4 h-4" />
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-12 left-0 w-48 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 shadow-2xl z-40 text-xs text-white max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    <span>Playback Speed</span>
                    {playbackSpeed !== 1.0 && (
                      <button 
                        onClick={() => handleSetSpeed(1.0)}
                        className="text-orange-400 hover:underline text-[9px]"
                      >
                        Reset (1.0x)
                      </button>
                    )}
                  </div>
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        handleSetSpeed(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        playbackSpeed === speed ? 'bg-orange-600 text-white font-bold' : 'hover:bg-zinc-800 text-gray-200'
                      }`}
                    >
                      <span>{speed === 1.0 ? '1.0x (Normal)' : `${speed}x`}</span>
                      {playbackSpeed === speed && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Audio Track Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowAudioMenu(!showAudioMenu)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  showAudioMenu ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Audio Tracks"
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">Audio</span>
              </button>

              {showAudioMenu && (
                <div className="absolute bottom-12 left-0 w-56 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 shadow-2xl z-40 text-xs text-white">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Audio Tracks</div>
                  {video.audioTracks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedAudioTrack(t.id);
                        setShowAudioMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        selectedAudioTrack === t.id ? 'bg-orange-600 text-white font-bold' : 'hover:bg-zinc-800'
                      }`}
                    >
                      <span>{t.label}</span>
                      {selectedAudioTrack === t.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitle Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  selectedSubtitle !== 'off' ? 'bg-yellow-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Subtitles (.srt / .vtt)"
              >
                <Subtitles className="w-4 h-4" />
                <span className="hidden sm:inline">Subtitles</span>
              </button>

              {showSubtitleMenu && (
                <div className="absolute bottom-12 left-0 w-56 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 shadow-2xl z-40 text-xs text-white">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Subtitles (.srt)</div>
                  <button
                    onClick={() => {
                      setSelectedSubtitle('off');
                      setShowSubtitleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                      selectedSubtitle === 'off' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-zinc-800'
                    }`}
                  >
                    <span>Off (No Subtitles)</span>
                    {selectedSubtitle === 'off' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {video.subtitles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSubtitle(s.id);
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                        selectedSubtitle === s.id ? 'bg-orange-600 text-white font-bold' : 'hover:bg-zinc-800'
                      }`}
                    >
                      <span>{s.label}</span>
                      {selectedSubtitle === s.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Aspect Ratio Mode */}
            <div className="relative">
              <button
                onClick={() => setShowAspectRatioMenu(!showAspectRatioMenu)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5"
                title="Aspect Ratio (Fit, Fill, 16:9, 4:3)"
              >
                <Crop className="w-4 h-4" />
                <span className="hidden md:inline">{aspectRatio}</span>
              </button>

              {showAspectRatioMenu && (
                <div className="absolute bottom-12 left-0 w-44 bg-zinc-900 border border-zinc-700 rounded-xl p-1.5 shadow-2xl z-40 text-xs text-white">
                  {(['FIT', 'FILL', '16_9', '4_3', 'ORIGINAL'] as AspectRatioMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        setAspectRatio(mode);
                        setShowAspectRatioMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                        aspectRatio === mode ? 'bg-orange-600 text-white font-bold' : 'hover:bg-zinc-800'
                      }`}
                    >
                      <span>{mode.replace('_', ':')}</span>
                      {aspectRatio === mode && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Output Device Switcher */}
            {audioRoutingState && onOpenAudioRoutingModal && (
              <button
                onClick={onOpenAudioRoutingModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                title={`Output Sink: ${
                  audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.name || 'Audio'
                } (${audioRoutingState.policy === 'auto_android' ? 'Auto-routed' : 'Manual'})`}
              >
                {audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.type === 'bluetooth' ? (
                  <Bluetooth className="w-4 h-4 text-blue-400" />
                ) : audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.type === 'wired_headset' ? (
                  <Headphones className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Speaker className="w-4 h-4 text-orange-400" />
                )}
                <span className="hidden xl:inline text-[11px]">
                  {audioRoutingState.policy === 'auto_android' ? 'Sink (Auto)' : 'Sink (Manual)'}
                </span>
              </button>
            )}
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSeek(Math.max(0, currentTimeMs / 1000 - 10))}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-90"
              title="Rewind 10 Seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-xl transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => handleSeek(Math.min(durationMs / 1000, currentTimeMs / 1000 + 10))}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-90"
              title="Fast Forward 10 Seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Volume Slider & Fullscreen */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => {
                  const nextVol = volume === 0 ? 0.8 : 0;
                  setVolume(nextVol);
                  if (videoRef.current) videoRef.current.volume = nextVol;
                }}
                className="text-white hover:text-orange-500"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (videoRef.current) videoRef.current.volume = v;
                }}
                className="w-16 h-1 bg-gray-600 rounded-full appearance-none accent-orange-500 cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  containerRef.current?.requestFullscreen();
                }
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
