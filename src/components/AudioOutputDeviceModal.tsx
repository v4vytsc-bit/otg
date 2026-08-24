import React, { useState } from 'react';
import { 
  Speaker, 
  Bluetooth, 
  HardDrive, 
  Headphones, 
  Tv, 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Radio, 
  Volume2, 
  Battery, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Sliders, 
  RefreshCw,
  Info
} from 'lucide-react';
import { AudioOutputDevice, AudioRoutingPolicy, AudioRoutingState } from '../types';
import { computeAutoAudioDevice } from '../utils/audioRoutingUtils';

interface AudioOutputDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  routingState: AudioRoutingState;
  onUpdatePolicy: (policy: AudioRoutingPolicy) => void;
  onSelectDevice: (deviceId: string) => void;
  onToggleDeviceAvailability: (deviceId: string, isAvailable: boolean) => void;
  onPlayTestTone?: (device: AudioOutputDevice) => void;
}

export const AudioOutputDeviceModal: React.FC<AudioOutputDeviceModalProps> = ({
  isOpen,
  onClose,
  routingState,
  onUpdatePolicy,
  onSelectDevice,
  onToggleDeviceAvailability,
  onPlayTestTone,
}) => {
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);

  if (!isOpen) return null;

  const getDeviceIcon = (type: AudioOutputDevice['type']) => {
    switch (type) {
      case 'bluetooth':
        return <Bluetooth className="w-4 h-4 text-blue-400" />;
      case 'usb_dac':
        return <HardDrive className="w-4 h-4 text-amber-400" />;
      case 'wired_headset':
        return <Headphones className="w-4 h-4 text-emerald-400" />;
      case 'hdmi':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'speaker':
      default:
        return <Speaker className="w-4 h-4 text-orange-400" />;
    }
  };

  const handleTestSound = (device: AudioOutputDevice) => {
    setIsPlayingTestTone(true);
    if (onPlayTestTone) {
      onPlayTestTone(device);
    } else {
      // Synthesize a clean harmonic stereo chime via Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.debug(e);
      }
    }
    setTimeout(() => setIsPlayingTestTone(false), 600);
  };

  const activeDevice = routingState.availableDevices.find((d) => d.id === routingState.activeDeviceId) 
    || routingState.autoSelectedDevice;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl p-6 shadow-2xl border transition-all animate-in zoom-in-95
        dark:bg-[#161616] dark:border-gray-800 dark:text-gray-100
        light:bg-white light:border-slate-300 light:text-slate-900
        oled:bg-black oled:border-zinc-800 oled:text-white
        amber:bg-[#1E1610] amber:border-[#382618] amber:text-amber-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center border border-orange-500/30">
              <Speaker className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Audio Output Router</h3>
              <p className="text-xs opacity-60">Android Hardware Audio Sink & Auto-Switching Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Output Banner */}
        <div className="p-3.5 rounded-xl border border-orange-500/30 bg-orange-500/10 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow">
              {getDeviceIcon(activeDevice.type)}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-1.5">
                <span>Active Output Sink</span>
                {routingState.policy === 'auto_android' && (
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[9px]">
                    AUTO-SELECTED
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-zinc-100 truncate">{activeDevice.name}</div>
              <div className="text-[11px] opacity-70 font-mono mt-0.5">{activeDevice.sampleRate}</div>
            </div>
          </div>

          <button
            onClick={() => handleTestSound(activeDevice)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isPlayingTestTone 
                ? 'bg-emerald-600 text-white scale-95' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
            title="Play Audio Chime to verify output device"
          >
            <Volume2 className="w-3.5 h-3.5 text-orange-400" />
            <span>{isPlayingTestTone ? 'Testing...' : 'Test Tone'}</span>
          </button>
        </div>

        {/* 1. Policy Toggle Mode */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold uppercase tracking-wider text-[11px] opacity-70">
              Android Audio Routing Policy
            </label>
            <span className="text-[10px] opacity-50 font-mono">AudioDeviceCallback API</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdatePolicy('auto_android')}
              className={`p-3 rounded-xl border text-left transition-all ${
                routingState.policy === 'auto_android'
                  ? 'border-orange-500 bg-orange-500/10 font-bold text-orange-400 shadow-sm'
                  : 'opacity-70 hover:opacity-100 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs">
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <span>Automatic (Recommended)</span>
              </div>
              <div className="text-[10px] opacity-70 mt-1 leading-snug">
                Prioritizes Bluetooth TWS → USB-C DAC → 3.5mm Wired → Phone Speaker automatically.
              </div>
            </button>

            <button
              onClick={() => onUpdatePolicy('manual')}
              className={`p-3 rounded-xl border text-left transition-all ${
                routingState.policy === 'manual'
                  ? 'border-orange-500 bg-orange-500/10 font-bold text-orange-400 shadow-sm'
                  : 'opacity-70 hover:opacity-100 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-xs">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Manual Override</span>
              </div>
              <div className="text-[10px] opacity-70 mt-1 leading-snug">
                Forces audio strictly to your selected sink device without auto-switching.
              </div>
            </button>
          </div>
        </div>

        {/* 2. Detected & Available Output Sinks List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold uppercase tracking-wider text-[11px] opacity-70">
              Audio Hardware Output Sinks
            </label>
            <span className="text-[10px] opacity-50">Click to select (or test)</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {routingState.availableDevices.map((dev) => {
              const isSelected = dev.id === routingState.activeDeviceId;
              const isAutoTarget = dev.id === routingState.autoSelectedDevice.id;

              return (
                <div
                  key={dev.id}
                  onClick={() => {
                    if (dev.isAvailable) {
                      onSelectDevice(dev.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500/10 text-white font-semibold'
                      : dev.isAvailable
                      ? 'border-gray-800 hover:border-gray-700 hover:bg-white/5 opacity-85'
                      : 'border-gray-800/40 bg-zinc-900/30 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                      {getDeviceIcon(dev.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs truncate font-medium">{dev.name}</span>
                        {dev.batteryPercent && (
                          <span className="flex items-center space-x-0.5 text-[9px] text-emerald-400 font-mono">
                            <Battery className="w-2.5 h-2.5" />
                            <span>{dev.batteryPercent}%</span>
                          </span>
                        )}
                        {!dev.isAvailable && (
                          <span className="text-[9px] text-zinc-500 font-mono">Disconnected</span>
                        )}
                      </div>
                      <div className="text-[10px] opacity-60 font-mono mt-0.5">{dev.sampleRate}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isAutoTarget && routingState.policy === 'auto_android' && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[9px] font-bold">
                        AUTO
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Android Hardware Simulator Bar (Connect / Disconnect Peripherals) */}
        <div className="pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
            <span className="font-bold flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              <span>Simulate Peripheral Connection Events</span>
            </span>
            <span className="text-[10px] opacity-60">Tests Auto-Switching</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {routingState.availableDevices.filter(d => d.type !== 'speaker').map((dev) => (
              <button
                key={dev.id}
                onClick={() => onToggleDeviceAvailability(dev.id, !dev.isAvailable)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium flex items-center space-x-1.5 transition-all ${
                  dev.isAvailable
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {getDeviceIcon(dev.type)}
                <span>{dev.isAvailable ? `Unplug ${dev.type.toUpperCase()}` : `Plug in ${dev.type.toUpperCase()}`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <div className="text-[10px] opacity-50 flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>Routes via HTML5 setSinkId & Android AudioDeviceInfo</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl font-bold text-xs bg-orange-600 text-white hover:bg-orange-500 shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
