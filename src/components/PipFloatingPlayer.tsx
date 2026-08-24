import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  X, 
  Maximize2, 
  RotateCcw, 
  RotateCw, 
  Gauge, 
  Headphones, 
  EyeOff 
} from 'lucide-react';
import { VideoItem } from '../types';
import { formatTime } from '../utils/mediaUtils';
import { updateSystemMediaSession } from '../utils/notificationUtils';

interface PipFloatingPlayerProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onMaximize: () => void;
  onSaveProgress: (positionMs: number, durationMs: number, isCompleted: boolean) => void;
  onSwitchToBackgroundAudio?: () => void;
  initialSpeed?: number;
}

const SPEED_LIST = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const PipFloatingPlayer: React.FC<PipFloatingPlayerProps> = ({
  video,
  isOpen,
  onClose,
  onMaximize,
  onSaveProgress,
  onSwitchToBackgroundAudio,
  initialSpeed = 1.0,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(video.durationMs / 1000);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  if (!isOpen) return null;

  const handleSpeedCycle = () => {
    const nextIdx = (SPEED_LIST.indexOf(playbackSpeed) + 1) % SPEED_LIST.length;
    const nextSpeed = SPEED_LIST[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-black z-50 animate-in slide-in-from-bottom-8">
      {/* Mini Top Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs border-b border-gray-800">
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="font-bold truncate max-w-[130px]">{video.name}</span>
          <button
            onClick={handleSpeedCycle}
            title="Cycle Playback Speed"
            className="px-1.5 py-0.2 bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold rounded"
          >
            {playbackSpeed}x
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {onSwitchToBackgroundAudio && (
            <button
              onClick={onSwitchToBackgroundAudio}
              className="p-1 rounded hover:bg-white/20 text-amber-400 hover:text-amber-300"
              title="Hide Video (Switch to Background Audio)"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onMaximize}
            className="p-1 rounded hover:bg-white/20 text-gray-300 hover:text-white"
            title="Expand to Full Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-600/80 text-gray-300 hover:text-white"
            title="Close PiP"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={video.videoUrl}
          autoPlay
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTimeSec(videoRef.current.currentTime);
              onSaveProgress(
                videoRef.current.currentTime * 1000,
                (videoRef.current.duration || durationSec) * 1000,
                videoRef.current.currentTime >= (videoRef.current.duration || durationSec) * 0.9
              );
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDurationSec(videoRef.current.duration);
              videoRef.current.playbackRate = playbackSpeed;
              videoRef.current.play();
              setIsPlaying(true);
            }
          }}
          className="w-full h-full object-contain"
        />

        {/* Floating Mini Controls Bar */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-700 rounded-full mb-2 overflow-hidden">
            <div 
              className="h-full bg-red-600" 
              style={{ width: `${(currentTimeSec / (durationSec || 1)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-mono text-[10px]">
              {formatTime(currentTimeSec * 1000)} / {formatTime(durationSec * 1000)}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTimeSec - 10);
                }}
                className="p-1 hover:text-orange-400"
                title="Rewind 10s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (!videoRef.current) return;
                  if (videoRef.current.paused) {
                    videoRef.current.play();
                    setIsPlaying(true);
                  } else {
                    videoRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className="p-1.5 rounded-full bg-orange-600 text-white hover:bg-orange-500"
              >
                {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = Math.min(durationSec, currentTimeSec + 10);
                }}
                className="p-1 hover:text-orange-400"
                title="Forward 10s"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
