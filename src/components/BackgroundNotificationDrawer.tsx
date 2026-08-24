import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  X, 
  Headphones, 
  Volume2, 
  Radio, 
  ShieldAlert, 
  Maximize2,
  Bell,
  EyeOff,
  Eye,
  Moon,
  Gauge,
  Sparkles,
  Zap,
  BatteryCharging,
  Power,
  Speaker,
  Bluetooth
} from 'lucide-react';
import { VideoItem, AudioRoutingState } from '../types';
import { formatTime } from '../utils/mediaUtils';
import { updateSystemMediaSession, showBrowserMediaNotification } from '../utils/notificationUtils';
import { applyAudioSinkToElement } from '../utils/audioRoutingUtils';

interface BackgroundNotificationDrawerProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onMaximize: () => void;
  onSaveProgress: (positionMs: number, durationMs: number, isCompleted: boolean) => void;
  initialSpeed?: number;
  audioRoutingState?: AudioRoutingState;
  onOpenAudioRoutingModal?: () => void;
}

const SPEED_LIST = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export const BackgroundNotificationDrawer: React.FC<BackgroundNotificationDrawerProps> = ({
  video,
  isOpen,
  onClose,
  onMaximize,
  onSaveProgress,
  initialSpeed = 1.0,
  audioRoutingState,
  onOpenAudioRoutingModal,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(video.durationMs || 1000);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
  const [audioFocusStatus, setAudioFocusStatus] = useState<'FOCUSED' | 'DUCKED' | 'PAUSED_CALL'>('FOCUSED');
  
  // Video surface visibility & Screen-Off simulation
  const [isVideoHidden, setIsVideoHidden] = useState(true); // Default hidden in background play
  const [isScreenOffMode, setIsScreenOffMode] = useState(false); // AMOLED Blackout Screen mode
  const [currentTimeClock, setCurrentTimeClock] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const audioRef = useRef<HTMLAudioElement>(null);

  // Clock ticker for Screen-Off mode
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync playback on open
  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);

      showBrowserMediaNotification(
        'Background Play Active (MediaSession)',
        `${video.name} • ${playbackSpeed}x Speed`,
        video.thumbnailUrl
      );
    }
  }, [isOpen]);

  // Sync MediaSession
  useEffect(() => {
    if (!isOpen) return;

    updateSystemMediaSession(
      {
        title: video.name,
        artist: 'Background Audio Playback',
        album: 'OTG Media Explorer',
        thumbnailUrl: video.thumbnailUrl,
        isPlaying,
        playbackSpeed,
        currentTimeMs: currentMs,
        durationMs,
      },
      {
        onPlay: () => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        },
        onPause: () => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        },
        onSeekForward: () => {
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(durationMs / 1000, (currentMs + 10000) / 1000);
          }
        },
        onSeekBackward: () => {
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, (currentMs - 10000) / 1000);
          }
        },
      }
    );
  }, [isOpen, video, isPlaying, playbackSpeed, currentMs, durationMs]);

  // Apply Audio Sink routing
  useEffect(() => {
    if (audioRoutingState && audioRef.current) {
      const activeDev = audioRoutingState.availableDevices.find(
        (d) => d.id === audioRoutingState.activeDeviceId
      ) || audioRoutingState.autoSelectedDevice;
      if (activeDev) {
        applyAudioSinkToElement(audioRef.current, activeDev);
      }
    }
  }, [audioRoutingState, isOpen]);

  if (!isOpen) return null;

  const handleSpeedCycle = () => {
    const nextIdx = (SPEED_LIST.indexOf(playbackSpeed) + 1) % SPEED_LIST.length;
    const nextSpeed = SPEED_LIST[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
    showBrowserMediaNotification(`Speed: ${nextSpeed}x`, video.name, video.thumbnailUrl);
  };

  const handleSimulateCall = () => {
    if (audioFocusStatus === 'FOCUSED') {
      setAudioFocusStatus('PAUSED_CALL');
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAudioFocusStatus('FOCUSED');
      if (audioRef.current) audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSimulateNotificationDuck = () => {
    setAudioFocusStatus('DUCKED');
    if (audioRef.current) audioRef.current.volume = 0.2;
    setTimeout(() => {
      setAudioFocusStatus('FOCUSED');
      if (audioRef.current) audioRef.current.volume = 1.0;
    }, 3000);
  };

  return (
    <>
      {/* Hidden Audio Element extracting video soundtrack */}
      <audio
        ref={audioRef}
        src={video.videoUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const cur = audioRef.current.currentTime * 1000;
            const dur = (audioRef.current.duration || video.durationMs / 1000) * 1000;
            setCurrentMs(cur);
            setDurationMs(dur);
            onSaveProgress(cur, dur, cur >= dur * 0.9);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          onSaveProgress(durationMs, durationMs, true);
        }}
      />

      {/* 1. AMOLED True Black Screen-Off Power Saver Mode */}
      {isScreenOffMode && (
        <div 
          onDoubleClick={() => setIsScreenOffMode(false)}
          className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-8 select-none text-zinc-400 font-mono animate-in fade-in duration-300"
        >
          {/* Top Status: Minimalist Battery & OTG status */}
          <div className="flex items-center justify-between text-xs opacity-60">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>OTG USB HOST ACTIVE • SCREEN OFF MODE</span>
            </div>
            <div className="flex items-center space-x-2">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span>94%</span>
            </div>
          </div>

          {/* Center: Ambient Clock & Audio Visualizer */}
          <div className="flex flex-col items-center justify-center space-y-6 text-center my-auto">
            <div className="text-6xl sm:text-7xl font-light text-zinc-200 tracking-tight">
              {currentTimeClock}
            </div>

            {/* Audio Wavebars Visualization */}
            <div className="flex items-center space-x-1.5 h-10">
              {[40, 75, 100, 60, 85, 30, 95, 50, 80, 45, 90, 65, 35, 70].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 bg-orange-500 rounded-full transition-all duration-300 ${
                    isPlaying ? 'opacity-80' : 'opacity-30'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (i % 2 === 0 ? 0.9 : 1.1))) * 0.4}px` : '4px',
                    animation: isPlaying ? `pulse ${0.6 + (i % 5) * 0.2}s infinite alternate` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Title & Speed readout */}
            <div className="max-w-md">
              <div className="text-zinc-200 text-sm font-bold truncate">{video.name}</div>
              <div className="text-xs text-orange-400 font-mono mt-1">
                Audio-Only Mode • {playbackSpeed}x Speed • {formatTime(currentMs)} / {formatTime(durationMs)}
              </div>
            </div>

            {/* Minimalist Controls on Screen Off */}
            <div className="flex items-center space-x-5 pt-2">
              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = Math.max(0, (currentMs - 10000) / 1000);
                }}
                className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                title="Rewind 10s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  if (!audioRef.current) return;
                  if (audioRef.current.paused) {
                    audioRef.current.play();
                    setIsPlaying(true);
                  } else {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className="p-4 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-2xl"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = Math.min(durationMs / 1000, (currentMs + 10000) / 1000);
                }}
                className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                title="Forward 10s"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleSpeedCycle}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-orange-400 font-bold text-xs"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>

          {/* Bottom Wake Prompt */}
          <div className="text-center">
            <button
              onClick={() => setIsScreenOffMode(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2 px-4 rounded-full border border-zinc-800 hover:border-zinc-700 inline-flex items-center space-x-2"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Double-click or tap here to wake screen</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Android System Media Notification Card (Top Right) */}
      <div className="fixed top-4 right-4 sm:right-6 w-96 rounded-2xl p-4 shadow-2xl border border-zinc-700/80 bg-[#121212] text-white z-40 animate-in slide-in-from-top-6 backdrop-blur-xl">
        
        {/* System Header */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3 font-mono">
          <div className="flex items-center space-x-1.5 text-orange-400 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>MediaSessionService • Foreground Playback</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
              audioFocusStatus === 'FOCUSED' ? 'bg-emerald-500/20 text-emerald-400' :
              audioFocusStatus === 'DUCKED' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
            }`}>
              Focus: {audioFocusStatus}
            </span>
            <button 
              onClick={onClose} 
              className="p-1 hover:text-white opacity-60 hover:opacity-100"
              title="Stop Background Playback"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Media Notification Body */}
        <div className="flex items-center space-x-3 mb-3">
          {/* Conditional Thumbnail / Video Preview Surface */}
          {!isVideoHidden ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-700/50 shadow-md relative group">
              <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setIsVideoHidden(true)}
                title="Hide Video Image"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px]"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-orange-500/10 border border-orange-500/30 shrink-0 flex flex-col items-center justify-center text-orange-400 shadow-md">
              <Headphones className="w-6 h-6 animate-pulse" />
              <span className="text-[9px] font-bold font-mono mt-0.5">AUDIO</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm truncate pr-2">{video.name}</h4>
            </div>
            <div className="text-xs text-orange-400 font-semibold truncate mt-0.5 flex items-center space-x-1.5">
              <span>OTG Background Audio</span>
              <span className="text-zinc-500">•</span>
              <span className="font-mono text-[10px] text-zinc-300">{playbackSpeed}x</span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
              {formatTime(currentMs)} / {formatTime(durationMs)}
            </div>
          </div>
        </div>

        {/* Seek Progress Bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full mb-3 overflow-hidden">
          <div 
            className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] transition-all" 
            style={{ width: `${(currentMs / (durationMs || 1)) * 100}%` }}
          />
        </div>

        {/* Notification Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
          <div className="flex items-center space-x-1.5">
            {/* Speed Cycle Button */}
            <button
              onClick={handleSpeedCycle}
              title="Change Playback Speed"
              className="text-[11px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-orange-400 font-bold font-mono flex items-center space-x-1"
            >
              <Gauge className="w-3 h-3" />
              <span>{playbackSpeed}x</span>
            </button>

            {/* Toggle Hide Video Surface */}
            <button
              onClick={() => setIsVideoHidden(!isVideoHidden)}
              title={isVideoHidden ? "Show Video Surface Thumbnail" : "Hide Video Surface (Pure Audio Mode)"}
              className={`text-[10px] px-2 py-1 rounded-lg flex items-center space-x-1 transition-colors ${
                isVideoHidden ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'
              }`}
            >
              {isVideoHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{isVideoHidden ? 'Show Pic' : 'Hide Pic'}</span>
            </button>

            {/* Audio Output Switcher Button */}
            {audioRoutingState && onOpenAudioRoutingModal && (
              <button
                onClick={onOpenAudioRoutingModal}
                title={`Audio Output Sink: ${
                  audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.name
                } (${audioRoutingState.policy === 'auto_android' ? 'Auto-routed' : 'Manual'})`}
                className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-orange-400 flex items-center space-x-1 border border-orange-500/20"
              >
                {audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.type === 'bluetooth' ? (
                  <Bluetooth className="w-3 h-3 text-blue-400" />
                ) : (
                  <Speaker className="w-3 h-3 text-orange-400" />
                )}
                <span>{audioRoutingState.policy === 'auto_android' ? 'Auto Sink' : 'Sink'}</span>
              </button>
            )}

            {/* AMOLED Screen-Off Power Saver */}
            <button
              onClick={() => setIsScreenOffMode(true)}
              title="AMOLED Screen-Off Power Saver Display"
              className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-gray-300 flex items-center space-x-1"
            >
              <Moon className="w-3 h-3 text-amber-400" />
              <span>Screen-Off</span>
            </button>
          </div>

          {/* Core Player Controls */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.max(0, (currentMs - 10000) / 1000);
              }}
              className="p-1.5 text-gray-300 hover:text-white"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (!audioRef.current) return;
                if (audioRef.current.paused) {
                  audioRef.current.play();
                  setIsPlaying(true);
                } else {
                  audioRef.current.pause();
                  setIsPlaying(false);
                }
              }}
              className="p-2 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.2" />}
            </button>

            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.min(durationMs / 1000, (currentMs + 10000) / 1000);
              }}
              className="p-1.5 text-gray-300 hover:text-white"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onMaximize}
              className="p-1.5 text-gray-400 hover:text-white"
              title="Return to Video Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </>
  );
};
