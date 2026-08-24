import React, { useState, useEffect } from 'react';
import { 
  Usb, 
  Layers, 
  Code2, 
  Smartphone, 
  Moon, 
  Sun, 
  Sparkles, 
  Contrast, 
  FolderPlus, 
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Bell,
  BellRing,
  Speaker,
  Bluetooth,
  Headphones
} from 'lucide-react';
import { AppTheme, DeviceConfig, OtgDrive, AudioRoutingState } from '../types';
import { requestNotificationPermission } from '../utils/notificationUtils';

interface NavbarProps {
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  activeView: 'explorer' | 'code' | 'sandbox';
  onViewChange: (view: 'explorer' | 'code' | 'sandbox') => void;
  drives: OtgDrive[];
  activeDrive: OtgDrive | null;
  onSelectDrive: (drive: OtgDrive) => void;
  onSimulateDriveAttach: () => void;
  onSimulateDriveDetach: () => void;
  onOpenRealFolder: () => void;
  deviceConfig: DeviceConfig;
  onOpenDeviceConfig: () => void;
  onTriggerNotification?: (title: string, msg: string) => void;
  audioRoutingState?: AudioRoutingState;
  onOpenAudioRoutingModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onThemeChange,
  activeView,
  onViewChange,
  drives,
  activeDrive,
  onSelectDrive,
  onSimulateDriveAttach,
  onSimulateDriveDetach,
  onOpenRealFolder,
  deviceConfig,
  onOpenDeviceConfig,
  onTriggerNotification,
  audioRoutingState,
  onOpenAudioRoutingModal,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (onTriggerNotification) {
      onTriggerNotification(
        granted ? 'System Notifications Enabled' : 'Notification Permission Prompted',
        granted ? 'OTG Foreground & Background MediaSession alerts active' : 'Please allow notifications in browser settings'
      );
    }
  };

  const themeOptions: { id: AppTheme; label: string; icon: React.ReactNode; colorDesc: string }[] = [
    { id: 'dark', label: 'Elegant Dark', icon: <Moon className="w-3.5 h-3.5" />, colorDesc: '#0A0A0A Obsidian & Orange' },
    { id: 'light', label: 'Clean Light', icon: <Sun className="w-3.5 h-3.5" />, colorDesc: '#F8FAFC Crisp Slate & Amber' },
    { id: 'oled', label: 'OLED Pure Black', icon: <Contrast className="w-3.5 h-3.5" />, colorDesc: '#000000 AMOLED Battery Saver' },
    { id: 'amber', label: 'Cine Amber', icon: <Sparkles className="w-3.5 h-3.5" />, colorDesc: '#120E0B Warm Sunset Cinema' },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b transition-colors select-none z-30 shrink-0
      dark:bg-[#141414] dark:border-gray-800 dark:text-gray-100
      light:bg-white light:border-slate-200 light:text-slate-900
      oled:bg-black oled:border-zinc-800 oled:text-white
      amber:bg-[#18130F] amber:border-[#2E2218] amber:text-amber-50">
      
      {/* Brand & Drive Info */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105
          dark:bg-orange-600 dark:text-white
          light:bg-orange-500 light:text-white
          oled:bg-white oled:text-black
          amber:bg-amber-500 amber:text-black">
          <Usb className="w-5 h-5" />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight">OTG MEDIA EXPLORER</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider
              dark:bg-orange-500/20 dark:text-orange-400
              light:bg-orange-100 light:text-orange-700
              oled:bg-zinc-800 oled:text-zinc-200
              amber:bg-amber-500/20 amber:text-amber-400">
              VLC Engine • minSdk 23
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium">
            {activeDrive ? (
              <div className="flex items-center space-x-1.5 text-emerald-500">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-mono text-[11px] truncate max-w-[200px] sm:max-w-[280px]">
                  USB CONNECTED: {activeDrive.label} ({activeDrive.fileSystem})
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-amber-500">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[11px]">No OTG Pendrive Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Drive Selector & Simulated Actions */}
      <div className="flex items-center space-x-2 my-2 sm:my-0">
        {/* Drive Selector */}
        <div className="relative flex items-center">
          <select 
            aria-label="Select USB Drive"
            value={activeDrive?.id || ''}
            onChange={(e) => {
              const selected = drives.find(d => d.id === e.target.value);
              if (selected) onSelectDrive(selected);
            }}
            className="text-xs font-medium rounded-lg px-2.5 py-1.5 border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-1
              dark:bg-[#1E1E1E] dark:border-gray-700 dark:text-gray-200 dark:focus:ring-orange-500
              light:bg-slate-100 light:border-slate-300 light:text-slate-800 light:focus:ring-orange-500
              oled:bg-zinc-900 oled:border-zinc-700 oled:text-zinc-100 oled:focus:ring-white
              amber:bg-[#241C15] amber:border-[#3E2D20] amber:text-amber-100 amber:focus:ring-amber-500"
          >
            {drives.map(d => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.fileSystem})
              </option>
            ))}
          </select>
          <HardDrive className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none opacity-50" />
        </div>

        {/* Plugin / Unplug Sim */}
        <button
          onClick={activeDrive ? onSimulateDriveDetach : onSimulateDriveAttach}
          title={activeDrive ? "Simulate Disconnecting USB Drive" : "Simulate Connecting USB Pendrive"}
          className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
            activeDrive 
              ? 'border-red-500/40 text-red-500 hover:bg-red-500/10' 
              : 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
          }`}
        >
          <Usb className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{activeDrive ? 'Eject OTG' : 'Plug OTG'}</span>
        </button>

        {/* Open Real Filesystem Folder */}
        <button
          onClick={onOpenRealFolder}
          title="Open real local folder with video files (SAF / Local Drive)"
          className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all
            dark:bg-[#1F1F1F] dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500
            light:bg-slate-100 light:border-slate-300 light:text-slate-700 light:hover:bg-slate-200
            oled:bg-zinc-900 oled:border-zinc-700 oled:text-zinc-300 oled:hover:border-zinc-500
            amber:bg-[#2A2018] amber:border-[#423122] amber:text-amber-200 amber:hover:border-amber-500"
        >
          <FolderPlus className="w-3.5 h-3.5 text-orange-500" />
          <span className="hidden sm:inline">Add Real Folder</span>
        </button>
      </div>

      {/* Right Controls: Views, Device Sandbox & Theme */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* View Switcher Tabs */}
        <div className="flex p-1 rounded-xl border
          dark:bg-[#0A0A0A] dark:border-gray-800
          light:bg-slate-100 light:border-slate-200
          oled:bg-black oled:border-zinc-800
          amber:bg-[#120E0B] amber:border-[#2D2015]">
          <button
            onClick={() => onViewChange('explorer')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeView === 'explorer'
                ? 'bg-orange-600 text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </button>

          <button
            onClick={() => onViewChange('code')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeView === 'code'
                ? 'bg-orange-600 text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kotlin Code</span>
          </button>
        </div>

        {/* Audio Output Device Switcher Button */}
        {audioRoutingState && onOpenAudioRoutingModal && (
          <button
            onClick={onOpenAudioRoutingModal}
            title={`Audio Output: ${
              audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.name || 'Audio Sink'
            } (${audioRoutingState.policy === 'auto_android' ? 'Auto-routed' : 'Manual'})`}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all"
          >
            {audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.type === 'bluetooth' ? (
              <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
            ) : audioRoutingState.availableDevices.find((d) => d.id === audioRoutingState.activeDeviceId)?.type === 'wired_headset' ? (
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Speaker className="w-3.5 h-3.5 text-orange-400" />
            )}
            <span className="hidden md:inline text-[11px] font-mono">
              {audioRoutingState.policy === 'auto_android' ? 'Audio (Auto)' : 'Audio (Manual)'}
            </span>
          </button>
        )}

        {/* System Media Notifications Button */}
        <button
          onClick={handleToggleNotifications}
          title={notificationsEnabled ? "System Notifications & MediaSession: Active" : "Click to Enable Native System Notifications"}
          className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            notificationsEnabled 
              ? 'border-orange-500/40 text-orange-400 bg-orange-500/10' 
              : 'border-zinc-700 text-gray-400 hover:text-white hover:border-gray-500'
          }`}
        >
          {notificationsEnabled ? <BellRing className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> : <Bell className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline text-[11px]">{notificationsEnabled ? 'Notify ON' : 'Notify'}</span>
        </button>

        {/* Device Sandbox Button */}
        <button
          onClick={onOpenDeviceConfig}
          title="Android Device & OEM Compatibility Matrix (Android 6.0 to 14, ColorOS/Realme OTG)"
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all
            dark:bg-[#181818] dark:border-gray-700 dark:hover:border-orange-500
            light:bg-slate-100 light:border-slate-300 light:hover:border-orange-500
            oled:bg-zinc-900 oled:border-zinc-800 oled:hover:border-white
            amber:bg-[#201812] amber:border-[#382618] amber:hover:border-amber-400"
        >
          <Smartphone className="w-3.5 h-3.5 text-orange-500" />
          <span className="hidden lg:inline text-[11px]">
            {deviceConfig.brand.split('_')[0]} • Android {deviceConfig.androidVersion}
          </span>
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative group">
          <button 
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all
              dark:bg-[#1F1F1F] dark:border-gray-700 dark:text-gray-200
              light:bg-slate-100 light:border-slate-300 light:text-slate-800
              oled:bg-zinc-900 oled:border-zinc-800 oled:text-white
              amber:bg-[#261C14] amber:border-[#3D291A] amber:text-amber-100"
            title="Switch Theme"
          >
            {themeOptions.find(t => t.id === currentTheme)?.icon}
            <span className="hidden sm:inline text-[11px]">
              {themeOptions.find(t => t.id === currentTheme)?.label}
            </span>
          </button>

          {/* Theme Menu */}
          <div className="absolute right-0 mt-1 w-52 py-1 rounded-xl shadow-2xl border hidden group-hover:block z-50
            dark:bg-[#181818] dark:border-gray-700 dark:text-gray-200
            light:bg-white light:border-slate-200 light:text-slate-800
            oled:bg-black oled:border-zinc-800 oled:text-white
            amber:bg-[#1C140E] amber:border-[#382718] amber:text-amber-100">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Select App Theme
            </div>
            {themeOptions.map(t => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                  currentTheme === t.id 
                    ? 'bg-orange-500/20 text-orange-400 font-semibold' 
                    : 'hover:bg-gray-500/10'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {t.icon}
                  <div>
                    <div>{t.label}</div>
                    <div className="text-[10px] opacity-60">{t.colorDesc}</div>
                  </div>
                </div>
                {currentTheme === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />}
              </button>
            ))}
          </div>
        </div>

      </div>

    </header>
  );
};
