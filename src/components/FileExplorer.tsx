import React from 'react';
import { 
  Folder, 
  Film, 
  Clock, 
  HardDrive, 
  CheckCircle2, 
  Play, 
  MoreVertical, 
  FileVideo,
  Sparkles,
  Layers,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { FolderItem, VideoItem, WatchHistoryRecord } from '../types';
import { formatBytes, formatTime } from '../utils/mediaUtils';

interface FileExplorerProps {
  currentPath: string;
  folders: FolderItem[];
  videos: VideoItem[];
  historyMap: Record<string, WatchHistoryRecord>;
  driveId: string;
  onNavigateFolder: (path: string) => void;
  onSelectVideo: (video: VideoItem) => void;
  viewMode: 'grid' | 'list';
  searchQuery: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  currentPath,
  folders,
  videos,
  historyMap,
  driveId,
  onNavigateFolder,
  onSelectVideo,
  viewMode,
  searchQuery,
}) => {
  // Filter subfolders whose parentPath equals currentPath
  const currentFolders = folders.filter((f) => {
    if (searchQuery) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return f.parentPath === currentPath;
  });

  // Filter videos whose parentFolder equals currentPath
  const currentVideos = videos.filter((v) => {
    if (searchQuery) {
      return v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             v.codec.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return v.parentFolder === currentPath;
  });

  const isEmpty = currentFolders.length === 0 && currentVideos.length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 select-none">
      
      {isEmpty && (
        <div className="h-64 flex flex-col items-center justify-center text-center opacity-60">
          <FolderOpen className="w-12 h-12 mb-3 text-orange-500 stroke-[1.5]" />
          <h4 className="font-bold text-base">No Items in this Directory</h4>
          <p className="text-xs max-w-sm mt-1">
            {searchQuery ? `No folders or videos match "${searchQuery}".` : 'This directory contains no subfolders or compatible video files.'}
          </p>
        </div>
      )}

      {/* 1. Folders Section */}
      {currentFolders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>Folders ({currentFolders.length})</span>
          </div>

          <div className={`grid gap-3 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {currentFolders.map((folder) => {
              // Calculate folder size from contained videos
              const containedVideos = videos.filter(v => v.parentFolder.startsWith(folder.path));
              const totalFolderBytes = containedVideos.reduce((acc, v) => acc + v.sizeBytes, 0);

              return (
                <div
                  key={folder.id}
                  onClick={() => onNavigateFolder(folder.path)}
                  className="group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md
                    dark:bg-[#181818] dark:border-gray-800 dark:hover:border-amber-500/50
                    light:bg-white light:border-slate-200 light:hover:border-amber-500/50 light:shadow-sm
                    oled:bg-zinc-950 oled:border-zinc-800 oled:hover:border-amber-500
                    amber:bg-[#1C150E] amber:border-[#382618] amber:hover:border-amber-500"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                      dark:bg-amber-500/10 dark:text-amber-400
                      light:bg-amber-100 light:text-amber-700
                      oled:bg-zinc-900 oled:text-amber-300
                      amber:bg-amber-500/20 amber:text-amber-400">
                      <Folder className="w-5 h-5 fill-amber-500/30" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate group-hover:text-amber-500 transition-colors">
                        {folder.name}
                      </h4>
                      <div className="text-[11px] opacity-60 flex items-center space-x-2 mt-0.5 font-mono">
                        <span>{folder.itemCount} items</span>
                        <span>•</span>
                        <span>{formatBytes(totalFolderBytes || 520 * 1024 * 1024)}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Video Files Section with YouTube Red Bar */}
      {currentVideos.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            <Film className="w-3.5 h-3.5 text-orange-500" />
            <span>Video Files ({currentVideos.length})</span>
          </div>

          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {currentVideos.map((video) => {
              const historyKey = `${driveId}:${video.filePath}`;
              const history = historyMap[historyKey];
              const hasHistory = !!(history && history.lastPositionMs > 2000);
              const isCompleted = history?.isCompleted || (history && history.lastPositionMs >= history.totalDurationMs * 0.9);
              const progressPercent = history
                ? Math.min(100, Math.round((history.lastPositionMs / history.totalDurationMs) * 100))
                : 0;

              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.015] hover:shadow-xl ${
                    viewMode === 'grid' ? 'flex flex-col' : 'flex items-center p-2.5'
                  } dark:bg-[#181818] dark:border-gray-800/80 dark:hover:border-orange-500
                    light:bg-white light:border-slate-200 light:hover:border-orange-500 light:shadow-sm
                    oled:bg-zinc-950 oled:border-zinc-800 oled:hover:border-orange-500
                    amber:bg-[#1E1610] amber:border-[#382618] amber:hover:border-amber-500`}
                >
                  {/* Thumbnail Container */}
                  <div className={`relative bg-gray-900 overflow-hidden shrink-0 ${
                    viewMode === 'grid' ? 'aspect-video w-full' : 'w-36 aspect-video rounded-lg mr-3.5'
                  }`}>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[10px] font-bold rounded shadow-sm">
                      {formatTime(video.durationMs)}
                    </span>

                    {/* Codec / Format Badge */}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/85 text-orange-400 font-mono text-[9px] font-bold uppercase rounded border border-orange-500/40">
                      {video.codec} • {video.format.toUpperCase()}
                    </span>

                    {/* Watched Badge if >= 90% */}
                    {isCompleted && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-600/90 text-white text-[9px] font-bold rounded flex items-center space-x-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Watched</span>
                      </span>
                    )}

                    {/* YouTube-Style Red Progress Bar Overlay */}
                    {hasHistory && (
                      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-800/90 overflow-hidden">
                        <div
                          className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)] transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Metadata Info */}
                  <div className={`p-3 min-w-0 flex-1 ${viewMode === 'list' ? 'p-0' : ''}`}>
                    <h3 className="font-semibold text-sm truncate group-hover:text-orange-500 transition-colors" title={video.name}>
                      {video.name}
                    </h3>

                    <div className="flex items-center justify-between mt-1 text-xs opacity-60 font-mono">
                      <div className="flex items-center space-x-2 truncate">
                        <span>{video.resolution}</span>
                        <span>•</span>
                        <span>{formatBytes(video.sizeBytes)}</span>
                      </div>
                      
                      {hasHistory && !isCompleted && (
                        <span className="text-orange-500 font-semibold text-[11px] shrink-0">
                          {progressPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
