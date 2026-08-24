import React from 'react';
import { 
  Smartphone, 
  X, 
  Cpu, 
  HardDrive, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Check,
  Power
} from 'lucide-react';
import { AndroidVersion, DeviceBrand, DeviceConfig } from '../types';

interface DeviceSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeviceConfig;
  onChangeConfig: (newConfig: DeviceConfig) => void;
}

export const DeviceSandboxModal: React.FC<DeviceSandboxModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  const versionMap: Record<AndroidVersion, { api: number; codename: string; defaultStorage: 'SAF' | 'libaums_USB_Host' }> = {
    '6.0': { api: 23, codename: 'Marshmallow (minSdk Legacy)', defaultStorage: 'libaums_USB_Host' },
    '9.0': { api: 28, codename: 'Pie (Mid-tier)', defaultStorage: 'SAF' },
    '11.0': { api: 30, codename: 'Android 11 (Scoped Storage)', defaultStorage: 'SAF' },
    '14.0': { api: 34, codename: 'Upside Down Cake (targetSdk 34)', defaultStorage: 'SAF' },
  };

  const handleVersionChange = (version: AndroidVersion) => {
    onChangeConfig({
      ...config,
      androidVersion: version,
      apiLevel: versionMap[version].api,
      storageAccessLayer: versionMap[version].defaultStorage,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl p-6 shadow-2xl border transition-all animate-in zoom-in-95
        dark:bg-[#161616] dark:border-gray-800 dark:text-gray-100
        light:bg-white light:border-slate-300 light:text-slate-900
        oled:bg-black oled:border-zinc-800 oled:text-white
        amber:bg-[#1E1610] amber:border-[#382618] amber:text-amber-100">
        
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <Smartphone className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-bold text-base">Device & OS Compatibility Matrix</h3>
              <p className="text-xs opacity-60">Test backwards-compatibility behaviors down to Android 6.0 (API 23)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* 1. Android Version */}
          <div>
            <label className="font-bold uppercase tracking-wider text-[11px] opacity-70 block mb-2">
              Android OS Version & API Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(versionMap) as AndroidVersion[]).map((ver) => (
                <button
                  key={ver}
                  onClick={() => handleVersionChange(ver)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.androidVersion === ver
                      ? 'border-orange-500 bg-orange-500/10 font-bold text-orange-400 shadow-sm'
                      : 'opacity-70 hover:opacity-100 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="text-sm font-bold">Android {ver}</div>
                  <div className="text-[10px] opacity-70">API {versionMap[ver].api}</div>
                  <div className="text-[9px] opacity-50 mt-1 truncate">{versionMap[ver].codename}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. OEM Brand (Realme / ColorOS / MIUI) */}
          <div>
            <label className="font-bold uppercase tracking-wider text-[11px] opacity-70 block mb-2">
              OEM Brand & Custom ROM Behavior
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Realme_ColorOS', label: 'Realme UI / ColorOS (OPPO/1+)', desc: 'Enforces 10-min OTG inactive timeout' },
                { id: 'Xiaomi_MIUI', label: 'Xiaomi / MIUI / HyperOS', desc: 'Aggressive background app killer' },
                { id: 'Samsung_OneUI', label: 'Samsung One UI', desc: 'Native OTG auto-mount' },
                { id: 'Google_Pixel_AOSP', label: 'Google Pixel / AOSP Stock', desc: 'Standard Android SAF framework' },
              ].map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onChangeConfig({ ...config, brand: brand.id as DeviceBrand })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.brand === brand.id
                      ? 'border-orange-500 bg-orange-500/10 font-bold text-orange-400'
                      : 'opacity-70 hover:opacity-100 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="font-semibold text-xs">{brand.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{brand.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Storage Layer & Codec Optimizations */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-black/20">
              <div>
                <div className="font-semibold text-xs flex items-center space-x-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                  <span>Storage Access Mode</span>
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  {config.storageAccessLayer === 'SAF' 
                    ? 'Storage Access Framework (ACTION_OPEN_DOCUMENT_TREE) for API 24+' 
                    : 'libaums USB Host Mass Storage (FAT32/exFAT/NTFS) for Legacy API 23'}
                </div>
              </div>
              <button
                onClick={() => onChangeConfig({
                  ...config,
                  storageAccessLayer: config.storageAccessLayer === 'SAF' ? 'libaums_USB_Host' : 'SAF'
                })}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 border border-zinc-600"
              >
                {config.storageAccessLayer}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-black/20">
              <div>
                <div className="font-semibold text-xs flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-orange-500" />
                  <span>Software Codec Fallback (Media3)</span>
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  `setEnableDecoderFallback(true)` for 10-bit HEVC/MKV on older SOCs
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.softwareCodecFallback}
                onChange={(e) => onChangeConfig({ ...config, softwareCodecFallback: e.target.checked })}
                className="w-4 h-4 accent-orange-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-black/20">
              <div>
                <div className="font-semibold text-xs flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Low-RAM Device Mode</span>
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  Glide hardware bitmap pooling & downsampling enabled
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.lowRamDevice}
                onChange={(e) => onChangeConfig({ ...config, lowRamDevice: e.target.checked })}
                className="w-4 h-4 accent-orange-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl font-bold text-xs bg-orange-600 text-white hover:bg-orange-500 shadow-md"
          >
            Apply Configurations
          </button>
        </div>

      </div>
    </div>
  );
};
