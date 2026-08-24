import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  FileVideo, 
  RotateCcw, 
  Layers, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  HardDrive, 
  Sparkles,
  ArrowUpDown,
  FolderOpen
} from 'lucide-react';
import { VideoItem, WatchHistoryRecord } from '../types';
import { formatTime, formatBytes } from '../utils/historyStorage';

interface VideoGridProps {
  videos: VideoItem[];
  watchHistory: Record<string, WatchHistoryRecord>;
  latestUnfinished: WatchHistoryRecord | null;
  onPlayVideo: (video: VideoItem, startFromPosition?: number) => void;
  folderTitle: string;
  totalStorageUsed: number;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  watchHistory,
  latestUnfinished,
  onPlayVideo,
  folderTitle,
  totalStorageUsed,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'size' | 'progress'>('name');

  // Find the video object for the latest unfinished record
  const latestUnfinishedVideo = latestUnfinished
    ? videos.find((v) => v.filePath === latestUnfinished.filePath) || null
    : null;

  // Sorting
  const sortedVideos = [...videos].sort((a, b) => {
    const histA = watchHistory[a.filePath];
    const histB = watchHistory[b.filePath];

    if (sortBy === 'progress') {
      const progA = histA ? histA.lastPositionMs / histA.totalDurationMs : 0;
      const progB = histB ? histB.lastPositionMs / histB.totalDurationMs : 0;
      return progB - progA;
    }
    if (sortBy === 'duration') return b.durationMs - a.durationMs;
    if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 select-none bg-[#0A0A0A]">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center space-x-2 text-xs text-orange-400 font-mono font-medium uppercase mb-1">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>USB OTG Drive Directory</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>{folderTitle}</span>
            <span className="text-xs font-normal font-mono px-2 py-0.5 rounded-full bg-[#181818] border border-[#2A2A2A] text-gray-400">
              {videos.length} {videos.length === 1 ? 'Video' : 'Videos'} • {formatBytes(totalStorageUsed)}
            </span>
          </h2>
        </div>

        {/* View mode & Sort controls */}
        <div className="flex items-center space-x-3">
          {/* Sort dropdown */}
          <div className="flex items-center space-x-1.5 bg-[#141414] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            <select
              aria-label="Sort videos"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-gray-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="name" className="bg-[#181818]">Sort by Name</option>
              <option value="progress" className="bg-[#181818]">Sort by Watch %</option>
              <option value="duration" className="bg-[#181818]">Sort by Duration</option>
              <option value="size" className="bg-[#181818]">Sort by File Size</option>
            </select>
          </div>

          {/* Grid / List toggle */}
          <div className="flex bg-[#141414] border border-[#262626] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured "Resume Playback" Hero Card from Room DB */}
      {latestUnfinished && latestUnfinishedVideo && (
        <div className="bg-[#141414] rounded-2xl p-5 border border-[#262626] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center space-x-4">
              <div 
                onClick={() => onPlayVideo(latestUnfinishedVideo, latestUnfinished.lastPositionMs)}
                className="w-32 sm:w-40 aspect-video bg-gray-900 rounded-xl overflow-hidden border border-[#333] relative cursor-pointer group-hover:border-orange-500 transition-colors flex-shrink-0"
              >
                <img
                  src={latestUnfinishedVideo.thumbnailUrl}
                  alt={latestUnfinishedVideo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom glowing YouTube Red progress bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                  <div
                    className="h-full bg-red-600 yt-red-glow"
                    style={{
                      width: `${Math.min(
                        100,
                        (latestUnfinished.lastPositionMs / latestUnfinished.totalDurationMs) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-800/60 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Auto-Resume Detected
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {Math.round((latestUnfinished.lastPositionMs / latestUnfinished.totalDurationMs) * 100)}% Watched
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white line-clamp-1">
                  {latestUnfinished.fileName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Resume playback from{' '}
                  <span className="text-orange-400 font-mono font-bold">
                    {formatTime(latestUnfinished.lastPositionMs)}
                  </span>{' '}
                  of {formatTime(latestUnfinished.totalDurationMs)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <button
                onClick={() => onPlayVideo(latestUnfinishedVideo, latestUnfinished.lastPositionMs)}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-950/50 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>RESUME</span>
              </button>
              <button
                onClick={() => onPlayVideo(latestUnfinishedVideo, 0)}
                className="px-4 py-2.5 border border-[#333] hover:border-gray-500 text-gray-300 hover:text-white font-bold rounded-xl text-xs sm:text-sm bg-[#1A1A1A] hover:bg-[#242424] flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTART</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Videos Layout */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#121212] rounded-2xl border border-[#222]">
          <FileVideo className="w-12 h-12 text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-gray-300">No Video Files in this Directory</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Ensure your USB drive contains supported video formats (.mkv, .mp4, .avi, .webm) or switch folders.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedVideos.map((video) => {
            const hist = watchHistory[video.filePath];
            const progressPercent = hist && hist.totalDurationMs > 0
              ? Math.min(100, Math.round((hist.lastPositionMs / hist.totalDurationMs) * 100))
              : 0;
            const isCompleted = hist?.isCompleted || progressPercent >= 95;

            return (
              <div
                key={video.id}
                onClick={() => onPlayVideo(video, hist ? hist.lastPositionMs : 0)}
                className="relative group bg-[#141414] rounded-xl overflow-hidden border border-[#222222] hover:border-orange-500/80 shadow-md hover:shadow-orange-950/20 transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Thumbnail Container */}
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-11 h-11 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badges: Codec & Resolution */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1">
                    <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-[9px] font-mono font-bold text-orange-400 rounded border border-orange-500/30 uppercase">
                      {video.codec}
                    </span>
                    <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-[9px] font-mono text-gray-300 rounded">
                      {video.resolution}
                    </span>
                  </div>

                  {/* Format pill */}
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-[9px] font-mono font-bold text-gray-300 rounded uppercase">
                      .{video.format}
                    </span>
                  </div>

                  {/* Bottom Duration Badge */}
                  <span className="absolute bottom-2.5 right-2 px-1.5 py-0.5 bg-black/85 backdrop-blur-sm text-[10px] font-mono font-bold text-white rounded">
                    {formatTime(video.durationMs)}
                  </span>

                  {/* Completed Checkmark if watched */}
                  {isCompleted && (
                    <div className="absolute bottom-2.5 left-2 flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded text-[9px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Watched</span>
                    </div>
                  )}

                  {/* YouTube-Style Red Progress Bar */}
                  {progressPercent > 0 && !isCompleted && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/90 z-10">
                      <div
                        className="h-full bg-red-600 yt-red-glow transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Info Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-100 group-hover:text-orange-400 transition-colors line-clamp-1" title={video.name}>
                      {video.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span>{formatBytes(video.sizeBytes)}</span>
                      {progressPercent > 0 && !isCompleted ? (
                        <span className="text-orange-400 font-medium font-mono text-[10px]">
                          {progressPercent}% watched ({formatTime(hist.lastPositionMs)})
                        </span>
                      ) : isCompleted ? (
                        <span className="text-emerald-400 font-mono text-[10px]">Completed</span>
                      ) : (
                        <span className="text-gray-500 text-[10px]">Unwatched</span>
                      )}
                    </div>
                  </div>

                  {/* Audio & Subtitle Indicators */}
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-[#1F1F1F] text-[10px] text-gray-500">
                    <span className="font-mono">
                      {video.audioTracks.length} Audio {video.audioTracks.length > 1 ? 'tracks' : 'track'}
                    </span>
                    {video.subtitles.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-400/80 font-mono">
                          {video.subtitles.length} Subtitles
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#141414] rounded-xl border border-[#222222] divide-y divide-[#1F1F1F] overflow-hidden">
          {sortedVideos.map((video) => {
            const hist = watchHistory[video.filePath];
            const progressPercent = hist && hist.totalDurationMs > 0
              ? Math.min(100, Math.round((hist.lastPositionMs / hist.totalDurationMs) * 100))
              : 0;
            const isCompleted = hist?.isCompleted || progressPercent >= 95;

            return (
              <div
                key={video.id}
                onClick={() => onPlayVideo(video, hist ? hist.lastPositionMs : 0)}
                className="flex items-center justify-between p-3.5 hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-24 aspect-video bg-gray-900 rounded-lg overflow-hidden relative flex-shrink-0 border border-[#2A2A2A]">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                    {progressPercent > 0 && !isCompleted && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                        <div
                          className="h-full bg-red-600 yt-red-glow"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-gray-100 group-hover:text-orange-400 transition-colors truncate">
                      {video.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                      <span className="font-mono">{formatTime(video.durationMs)}</span>
                      <span>•</span>
                      <span>{formatBytes(video.sizeBytes)}</span>
                      <span>•</span>
                      <span className="font-mono text-orange-400/80">{video.codec}</span>
                      <span>•</span>
                      <span>{video.resolution}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pl-4 flex-shrink-0">
                  {progressPercent > 0 && !isCompleted ? (
                    <div className="text-right font-mono">
                      <div className="text-xs text-orange-400 font-bold">{progressPercent}%</div>
                      <div className="text-[10px] text-gray-500">{formatTime(hist.lastPositionMs)}</div>
                    </div>
                  ) : isCompleted ? (
                    <span className="text-xs text-emerald-400 font-medium">Watched</span>
                  ) : (
                    <span className="text-xs text-gray-500">Unwatched</span>
                  )}

                  <button className="w-8 h-8 rounded-full bg-[#202020] group-hover:bg-orange-600 text-gray-300 group-hover:text-white flex items-center justify-center transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
