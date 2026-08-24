import React from 'react';
import { 
  Film, 
  Folder, 
  History, 
  HardDrive, 
  Code, 
  Cpu, 
  AlertCircle, 
  ChevronRight, 
  Zap,
  Info
} from 'lucide-react';
import { OtgDrive, DeviceConfig } from '../types';
import { formatBytes } from '../utils/historyStorage';

export type TabType = 'all' | 'folders' | 'history' | 'drives' | 'code';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentDrive: OtgDrive | null;
  selectedFolder: string;
  onSelectFolder: (folderPath: string) => void;
  videoCount: number;
  historyCount: number;
  deviceConfig: DeviceConfig;
  onOpenRealmeHelper: () => void;
  onOpenDiagnostics: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentDrive,
  selectedFolder,
  onSelectFolder,
  videoCount,
  historyCount,
  deviceConfig,
  onOpenRealmeHelper,
  onOpenDiagnostics,
}) => {
  const usedPercent = currentDrive 
    ? Math.round((currentDrive.usedBytes / currentDrive.capacityBytes) * 100)
    : 0;

  return (
    <aside className="w-64 bg-[#0F0F0F] border-r border-[#222222] p-5 flex flex-col justify-between select-none h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Library
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                onTabChange('all');
                onSelectFolder('/');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all' && selectedFolder === '/'
                  ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Film className="w-4 h-4" />
                <span>All Videos</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202020] text-gray-400 font-mono">
                {videoCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('folders')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'folders' || selectedFolder !== '/'
                  ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Folder className="w-4 h-4" />
                <span>Folder Tree</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202020] text-gray-400 font-mono">
                {currentDrive?.folders.length || 0}
              </span>
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <History className="w-4 h-4" />
                <span>Watch History</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-400 font-mono">
                {historyCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('drives')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'drives'
                  ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <HardDrive className="w-4 h-4" />
                <span>USB & Filesystems</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202020] text-gray-400 font-mono uppercase">
                {currentDrive?.fileSystem || 'None'}
              </span>
            </button>
          </nav>
        </div>

        {/* Folder Hierarchy when active */}
        {currentDrive && currentDrive.folders.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Folders on Pendrive
            </div>
            <div className="space-y-1 pl-1">
              <button
                onClick={() => {
                  onTabChange('folders');
                  onSelectFolder('/');
                }}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs truncate text-left transition-colors ${
                  selectedFolder === '/'
                    ? 'text-orange-400 font-semibold bg-[#1C1C1C]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
                }`}
              >
                <Folder className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                <span className="truncate">/ (Root Directory)</span>
              </button>

              {currentDrive.folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onTabChange('folders');
                    onSelectFolder(folder.path);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs truncate text-left transition-colors ${
                    selectedFolder === folder.path
                      ? 'text-orange-400 font-semibold bg-[#1C1C1C]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-gray-600 text-[10px]">↳</span>
                    <Folder className="w-3.5 h-3.5 flex-shrink-0 text-amber-500/80" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono">
                    {folder.itemCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Diagnostics badge */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1.5 font-medium text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              Software Codec Mode
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              Active
            </span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            ExoPlayer fallback enabled for 10-bit HEVC & MKV playback on Android 6.0+ chipsets.
          </p>
          <button
            onClick={onOpenDiagnostics}
            className="w-full text-left text-[10px] text-orange-400 hover:text-orange-300 font-medium flex items-center justify-between pt-1 border-t border-[#222]"
          >
            <span>Run Chipset & FS Tests</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Area: Realme Warning & Storage Meter */}
      <div className="space-y-4 pt-4 border-t border-[#222]">
        {/* Realme / ColorOS Alert Banner */}
        <div className="p-3 bg-amber-950/25 border border-amber-800/35 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              REALME / COLOROS?
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 bg-amber-900/50 text-amber-300 rounded">
              OEM Fix
            </span>
          </div>
          <p className="text-[10px] text-amber-200/80 leading-snug">
            OTG power turns off after 10 mins if inactive in ColorOS / Realme UI.
          </p>
          <button
            onClick={onOpenRealmeHelper}
            className="w-full mt-1 py-1 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-wide transition-colors text-center"
          >
            Open Settings Helper
          </button>
        </div>

        {/* USB Storage Capacity Indicator */}
        {currentDrive && (
          <div className="bg-[#141414] border border-[#222] rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 text-[11px] font-medium truncate max-w-[120px]">
                {currentDrive.label}
              </span>
              <span className="text-[10px] font-mono text-gray-400 font-bold">
                {usedPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>{formatBytes(currentDrive.usedBytes)} used</span>
              <span>{formatBytes(currentDrive.capacityBytes)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
