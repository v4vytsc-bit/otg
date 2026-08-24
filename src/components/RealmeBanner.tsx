import React, { useState } from 'react';
import { AlertCircle, ExternalLink, Power, X, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { DeviceConfig } from '../types';

interface RealmeBannerProps {
  deviceConfig: DeviceConfig;
  onToggleOtgPower: () => void;
}

export const RealmeBanner: React.FC<RealmeBannerProps> = ({
  deviceConfig,
  onToggleOtgPower,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const isRealmeOrOppo = deviceConfig.brand === 'Realme_ColorOS' || deviceConfig.brand === 'Xiaomi_MIUI';

  if (!isRealmeOrOppo || isDismissed) return null;

  return (
    <>
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs border-b shrink-0 transition-colors
        dark:bg-amber-950/40 dark:border-amber-700/40 dark:text-amber-200
        light:bg-amber-50 light:border-amber-200 light:text-amber-900
        oled:bg-zinc-950 oled:border-amber-600/40 oled:text-amber-300
        amber:bg-[#2A1D0F] amber:border-amber-600/40 amber:text-amber-200">
        
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-500 font-bold shrink-0">
            <Power className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-bold tracking-wide">
              {deviceConfig.brand.split('_')[0]} OTG Inactivity Detection:
            </span>{' '}
            <span className="opacity-90">
              {deviceConfig.otgPowerEnabled 
                ? 'OTG power is active. (ColorOS timer resets on activity).'
                : 'OTG Host mode is currently UNPOWERED or timed out.'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-2.5 py-1 rounded-md font-semibold underline underline-offset-2 hover:opacity-80 flex items-center space-x-1"
          >
            <span>Open System Helper</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={onToggleOtgPower}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all flex items-center space-x-1 ${
              deviceConfig.otgPowerEnabled
                ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/40'
                : 'bg-amber-500 text-black shadow hover:bg-amber-400'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{deviceConfig.otgPowerEnabled ? 'Disable OTG' : 'Enable OTG'}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md hover:bg-amber-500/20 opacity-70 hover:opacity-100"
            title="Dismiss Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OEM Settings Dialog Walkthrough */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl border text-sm
            dark:bg-[#181818] dark:border-gray-700 dark:text-gray-100
            light:bg-white light:border-slate-300 light:text-slate-900
            oled:bg-black oled:border-zinc-800 oled:text-white
            amber:bg-[#1E1610] amber:border-[#3E2919] amber:text-amber-100">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Realme / ColorOS OTG Setup</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="opacity-80 text-xs mb-4 leading-relaxed">
              Realme UI, ColorOS (OPPO/OnePlus), and MIUI automatically turn off OTG USB power after 10 minutes of inactivity to save battery. Follow these steps to keep the pendrive connected:
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-xl border flex items-start space-x-3
                dark:bg-black/30 dark:border-gray-800 light:bg-slate-50 light:border-slate-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <div className="font-semibold text-xs">Open Device Settings</div>
                  <div className="text-[11px] opacity-70">Navigate to <strong>Additional Settings</strong> or <strong>System Settings</strong>.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border flex items-start space-x-3
                dark:bg-black/30 dark:border-gray-800 light:bg-slate-50 light:border-slate-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <div className="font-semibold text-xs">Turn ON "OTG Connection"</div>
                  <div className="text-[11px] opacity-70">Enable the toggle button to supply 5V host power to the USB-C / Micro-USB port.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border flex items-start space-x-3
                dark:bg-black/30 dark:border-gray-800 light:bg-slate-50 light:border-slate-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <div className="font-semibold text-xs">App Auto-Detection</div>
                  <div className="text-[11px] opacity-70">The app will automatically register the USB device and trigger the resume dialog.</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onToggleOtgPower();
                  setShowSettingsModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-orange-600 text-white hover:bg-orange-500 shadow-md flex items-center justify-center space-x-2"
              >
                <Power className="w-4 h-4" />
                <span>Simulate Enabling OTG Toggle</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs border opacity-80 hover:opacity-100"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
