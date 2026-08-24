import React from 'react';
import { Play, RotateCcw, FolderOpen, CheckCircle, Clock, X, Film } from 'lucide-react';
import { VideoItem, WatchHistoryRecord } from '../types';
import { formatTime } from '../utils/mediaUtils';

interface DrivePluginResumeModalProps {
  isOpen: boolean;
  historyRecord: WatchHistoryRecord | null;
  video: VideoItem | null;
  onResume: () => void;
  onBrowseDrive: () => void;
  onClose: () => void;
}

export const DrivePluginResumeModal: React.FC<DrivePluginResumeModalProps> = ({
  isOpen,
  historyRecord,
  video,
  onResume,
  onBrowseDrive,
  onClose,
}) => {
  if (!isOpen || !historyRecord || !video) return null;

  const progressPercent = Math.min(
    100,
    Math.round((historyRecord.lastPositionMs / historyRecord.totalDurationMs) * 100)
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all animate-in fade-in zoom-in-95
        dark:bg-[#161616] dark:border-gray-800 dark:text-gray-100
        light:bg-white light:border-slate-300 light:text-slate-900
        oled:bg-black oled:border-zinc-800 oled:text-white
        amber:bg-[#1E1610] amber:border-[#382618] amber:text-amber-100">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-500">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            <span>OTG USB Pendrive Attached</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-xl font-bold mb-2">Resume Unfinished Video?</h3>
        <p className="text-xs opacity-70 mb-4">
          We found a previously watched video on this drive. Would you like to resume playback where you left off?
        </p>

        {/* Video Preview Card */}
        <div className="flex items-center space-x-4 p-3 rounded-xl border mb-6
          dark:bg-[#1E1E1E] dark:border-gray-800
          light:bg-slate-50 light:border-slate-200
          oled:bg-zinc-950 oled:border-zinc-800
          amber:bg-[#251B13] amber:border-[#3E2919]">
          
          <div className="w-28 aspect-video rounded-lg overflow-hidden bg-gray-900 relative shrink-0 border border-gray-700/50">
            <img 
              src={video.thumbnailUrl} 
              alt={video.name} 
              className="w-full h-full object-cover"
            />
            {/* YouTube Red Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
              <div 
                className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)]" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{video.name}</h4>
            <div className="flex items-center space-x-2 text-xs opacity-70 mt-1">
              <span className="text-orange-500 font-semibold">{progressPercent}% Watched</span>
              <span>•</span>
              <span>{formatTime(historyRecord.lastPositionMs)} / {formatTime(historyRecord.totalDurationMs)}</span>
            </div>
            <div className="text-[11px] opacity-50 truncate mt-0.5">{video.parentFolder}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onResume}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm bg-orange-600 text-white hover:bg-orange-500 shadow-lg transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume from {formatTime(historyRecord.lastPositionMs)}</span>
          </button>

          <button
            onClick={onBrowseDrive}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm border hover:opacity-80 transition-all"
          >
            <FolderOpen className="w-4 h-4 text-orange-500" />
            <span>Browse USB Drive</span>
          </button>
        </div>

      </div>
    </div>
  );
};

interface VideoClickBottomSheetProps {
  isOpen: boolean;
  video: VideoItem | null;
  historyRecord: WatchHistoryRecord | null;
  onResume: () => void;
  onStartFromBeginning: () => void;
  onMarkAsWatched?: () => void;
  onClose: () => void;
}

export const VideoClickBottomSheet: React.FC<VideoClickBottomSheetProps> = ({
  isOpen,
  video,
  historyRecord,
  onResume,
  onStartFromBeginning,
  onMarkAsWatched,
  onClose,
}) => {
  if (!isOpen || !video) return null;

  const hasHistory = !!(historyRecord && historyRecord.lastPositionMs > 3000);
  const progressPercent = historyRecord
    ? Math.min(100, Math.round((historyRecord.lastPositionMs / historyRecord.totalDurationMs) * 100))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border transition-all animate-in slide-in-from-bottom-6 sm:zoom-in-95
        dark:bg-[#161616] dark:border-gray-800 dark:text-gray-100
        light:bg-white light:border-slate-300 light:text-slate-900
        oled:bg-black oled:border-zinc-800 oled:text-white
        amber:bg-[#1E1610] amber:border-[#382618] amber:text-amber-100">
        
        {/* Handle for bottom sheet on mobile */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4 sm:hidden opacity-50" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-base truncate max-w-[280px]">{video.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Details Card */}
        <div className="flex items-center space-x-3 p-3 rounded-xl border mb-5
          dark:bg-[#202020] dark:border-gray-800
          light:bg-slate-50 light:border-slate-200
          oled:bg-zinc-950 oled:border-zinc-800
          amber:bg-[#261C14] amber:border-[#422D1C]">
          
          <div className="w-24 aspect-video rounded-lg overflow-hidden bg-gray-900 relative shrink-0">
            <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover" />
            {hasHistory && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-xs">
            <div className="font-semibold truncate">{video.resolution} • {video.codec}</div>
            <div className="opacity-70 mt-0.5">
              Duration: {formatTime(video.durationMs)}
            </div>
            {hasHistory && (
              <div className="text-orange-500 font-semibold mt-0.5">
                Last played at {formatTime(historyRecord!.lastPositionMs)} ({progressPercent}%)
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {hasHistory && (
            <button
              onClick={onResume}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm bg-orange-600 text-white hover:bg-orange-500 shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume from {formatTime(historyRecord!.lastPositionMs)}</span>
            </button>
          )}

          <button
            onClick={onStartFromBeginning}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              !hasHistory
                ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-md'
                : 'border hover:opacity-80'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play from Beginning (00:00)</span>
          </button>

          {hasHistory && onMarkAsWatched && (
            <button
              onClick={onMarkAsWatched}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium text-xs opacity-70 hover:opacity-100 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark as Watched</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
