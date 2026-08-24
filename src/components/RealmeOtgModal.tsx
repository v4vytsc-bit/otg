import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Smartphone, 
  Power, 
  CheckCircle2, 
  Timer, 
  ExternalLink,
  Info 
} from 'lucide-react';
import { DeviceConfig } from '../types';

interface RealmeModalProps {
  deviceConfig: DeviceConfig;
  onChangeDeviceConfig: (cfg: Partial<DeviceConfig>) => void;
  onClose: () => void;
}

export const RealmeOtgModal: React.FC<RealmeModalProps> = ({
  deviceConfig,
  onChangeDeviceConfig,
  onClose,
}) => {
  const [otgPower, setOtgPower] = useState<boolean>(deviceConfig.otgPowerEnabled);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 mins

  useEffect(() => {
    let timer: any;
    if (!otgPower) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setSecondsRemaining(600);
    }
    return () => clearInterval(timer);
  }, [otgPower]);

  const handleToggle = () => {
    const newState = !otgPower;
    setOtgPower(newState);
    onChangeDeviceConfig({ otgPowerEnabled: newState });
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#141414] border border-[#2D2D2D] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Realme UI / ColorOS OTG Connection Helper
              </h3>
              <p className="text-xs text-gray-400">
                10-Minute Power Timeout Detection & System Toggle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Alert Callout */}
          <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <Info className="w-4 h-4" />
              <span>Why does OTG turn off on Realme, OPPO & OnePlus?</span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Realme UI, ColorOS and OxygenOS feature an aggressive battery saver: if no OTG read/write occurs for 10 minutes, the OS cuts 5V power to the USB port. The app monitors this state and directs users to the persistent system switch.
            </p>
          </div>

          {/* Interactive Toggle Card */}
          <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Power className={`w-4 h-4 ${otgPower ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="font-bold text-sm text-white">OTG Connection</span>
              </div>
              <p className="text-xs text-gray-400">
                {otgPower ? (
                  <span className="text-emerald-400 font-medium">
                    ✓ Power state kept permanently active by wake-lock
                  </span>
                ) : (
                  <span className="text-amber-400 font-mono">
                    Auto-disconnect in: {formatTimer(secondsRemaining)}
                  </span>
                )}
              </p>
            </div>

            {/* Toggle switch */}
            <button
              onClick={handleToggle}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                otgPower ? 'bg-orange-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  otgPower ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Settings Path Instructions */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Native Android Settings Path
            </div>
            <div className="p-3 bg-[#111] rounded-lg border border-[#222] font-mono text-xs text-gray-300 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>Settings &gt; Additional Settings &gt; OTG Connection</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-[#0F0F0F] border-t border-[#222]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
