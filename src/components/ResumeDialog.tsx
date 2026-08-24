import React from 'react';
import { Play, RotateCcw, FolderOpen, Clock, X, Sparkles } from 'lucide-react';
import { VideoItem, WatchHistoryRecord } from '../types';
import { formatTime } from '../utils/historyStorage';

interface ResumePromptProps {
  type: 'drive_plugin' | 'video_tap';
  video: VideoItem;
  historyRecord: WatchHistoryRecord;
  onConfirmResume: () => void;
  onStartBeginning: () => void;
  onClose: () => void;
}

export const ResumeDialog: React.FC<ResumePromptProps> = ({
  type,
  video,
  historyRecord,
  onConfirmResume,
  onStartBeginning,
  onClose,
}) => {
  const percent = Math.min(
    100,
    Math.round((historyRecord.lastPositionMs / historyRecord.totalDurationMs) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#141414] border border-[#2D2D2D] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
            <h3 className="font-bold text-sm text-white tracking-wide uppercase">
              {type === 'drive_plugin' ? 'USB Drive Plugin Detected' : 'Resume Playback'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Thumbnail preview */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-[#262626]">
            <img
              src={video.thumbnailUrl}
              alt={video.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-orange-950/80 border border-orange-500/40 text-orange-400 font-mono text-[10px] font-bold rounded">
                {video.codec}
              </span>
              <span className="px-2 py-0.5 bg-black/70 text-gray-300 font-mono text-[10px] rounded">
                {video.resolution}
              </span>
            </div>

            {/* Time badge */}
            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-[11px] font-mono font-bold text-white rounded">
              {formatTime(video.durationMs)}
            </span>

            {/* YouTube Red Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-800">
              <div
                className="h-full bg-red-600 yt-red-glow"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-base text-white line-clamp-1">{video.name}</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>
                Saved timestamp:{' '}
                <span className="font-mono font-bold text-orange-400">
                  {formatTime(historyRecord.lastPositionMs)}
                </span>{' '}
                ({percent}% watched)
              </span>
            </div>
            {type === 'drive_plugin' && (
              <p className="text-xs text-gray-400 mt-2 bg-[#1A1A1A] p-2.5 rounded-lg border border-[#262626]">
                You were previously watching this file on this USB pendrive. Would you like to resume?
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-[#0F0F0F] border-t border-[#222]">
          <button
            onClick={onStartBeginning}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#333] hover:bg-[#1E1E1E] text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            {type === 'drive_plugin' ? (
              <>
                <FolderOpen className="w-4 h-4" />
                <span>Open File Browser</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start from Beginning</span>
              </>
            )}
          </button>

          <button
            onClick={onConfirmResume}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-950/40 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume ({formatTime(historyRecord.lastPositionMs)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
