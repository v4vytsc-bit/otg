import React from 'react';
import { 
  Usb, 
  Search, 
  Code2, 
  Smartphone, 
  AlertTriangle, 
  SlidersHorizontal,
  RefreshCw,
  Plus
} from 'lucide-react';
import { OtgDrive, DeviceConfig } from '../types';
import { formatBytes } from '../utils/historyStorage';

interface HeaderProps {
  currentDrive: OtgDrive | null;
  drives: OtgDrive[];
  onSelectDrive: (driveId: string) => void;
  onConnectCustomDrive: () => void;
  deviceConfig: DeviceConfig;
  onChangeDeviceConfig: (cfg: Partial<DeviceConfig>) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCodeModal: () => void;
  onOpenDiagnostics: () => void;
  onOpenRealmeHelper: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDrive,
  drives,
  onSelectDrive,
  onConnectCustomDrive,
  deviceConfig,
  onChangeDeviceConfig,
  searchQuery,
  onSearchChange,
  onOpenCodeModal,
  onOpenDiagnostics,
  onOpenRealmeHelper,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-[#141414] border-b border-[#262626] shadow-xl z-20 select-none">
      {/* Brand & Drive Status */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(234,88,12,0.4)]">
          <Usb className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-tight text-white">
              OTG MEDIA EXPLORER
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase bg-orange-950/80 text-orange-400 border border-orange-800/60 rounded">
              v1.0 VLC Engine
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs mt-0.5">
            {currentDrive ? (
              <>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="font-mono text-emerald-400 font-medium text-[11px] truncate max-w-[200px]">
                  USB CONNECTED: {currentDrive.id.split('_')[0]} ({currentDrive.fileSystem})
                </span>
                <span className="text-gray-500 text-[11px]">
                  • {formatBytes(currentDrive.usedBytes)} / {formatBytes(currentDrive.capacityBytes)}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="font-mono text-red-400 font-medium text-[11px]">
                  NO USB DRIVE DETECTED
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center Search & Drive Switcher */}
      <div className="flex items-center space-x-3">
        {/* Drive Selector dropdown */}
        <div className="relative flex items-center bg-[#1E1E1E] rounded-lg border border-[#333] px-2.5 py-1 text-xs">
          <Usb className="w-3.5 h-3.5 text-orange-400 mr-2" />
          <select
            aria-label="Active USB Drive"
            value={currentDrive?.id || ''}
            onChange={(e) => onSelectDrive(e.target.value)}
            className="bg-transparent text-gray-200 focus:outline-none cursor-pointer pr-4 text-xs font-mono"
          >
            {drives.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#181818] text-gray-200">
                {d.label} [{d.fileSystem}]
              </option>
            ))}
          </select>
          <button
            onClick={onConnectCustomDrive}
            title="Simulate Plugin / New Pendrive"
            className="ml-2 pl-2 border-l border-gray-700 text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Plug In</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search MKV, MP4, 4K videos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#1A1A1A] border border-[#2D2D2D] focus:border-orange-500 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Device Mode, Realme Warning, Diagnostics, Kotlin Code */}
      <div className="flex items-center space-x-2.5">
        {/* Device Profile / Android Version Selector */}
        <div className="hidden lg:flex items-center bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg px-2 py-1 text-xs text-gray-300">
          <Smartphone className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
          <span className="text-gray-400 mr-1 text-[11px]">OS:</span>
          <select
            aria-label="Emulated Android Version"
            value={deviceConfig.androidVersion}
            onChange={(e) => {
              const v = e.target.value as any;
              const api = v === '6.0' ? 23 : v === '9.0' ? 28 : v === '11.0' ? 30 : 34;
              onChangeDeviceConfig({ androidVersion: v, apiLevel: api, lowRamDevice: v === '6.0' });
            }}
            className="bg-transparent text-orange-400 font-mono font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="6.0" className="bg-[#181818]">Android 6.0 (API 23)</option>
            <option value="9.0" className="bg-[#181818]">Android 9.0 (API 28)</option>
            <option value="11.0" className="bg-[#181818]">Android 11.0 (API 30)</option>
            <option value="14.0" className="bg-[#181818]">Android 14.0 (API 34)</option>
          </select>
        </div>

        {/* ColorOS / Realme Quick Status */}
        {deviceConfig.brand === 'Realme_ColorOS' && !deviceConfig.otgPowerEnabled && (
          <button
            onClick={onOpenRealmeHelper}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-600/60 text-amber-300 hover:bg-amber-900/80 rounded-lg text-xs font-medium animate-pulse transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">OTG 10m Timeout</span>
          </button>
        )}

        {/* Compatibility Diagnostics */}
        <button
          onClick={onOpenDiagnostics}
          title="Hardware Decoders & USB Host Diagnostics"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] border border-[#333] text-gray-300 rounded-lg text-xs font-medium transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden xl:inline text-[11px]">Compatibility</span>
        </button>

        {/* Kotlin Code Viewer Button */}
        <button
          onClick={onOpenCodeModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950/50 transition-all cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Kotlin Codebase</span>
        </button>
      </div>
    </header>
  );
};
