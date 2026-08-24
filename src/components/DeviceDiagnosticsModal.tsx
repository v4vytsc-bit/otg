import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Layers, 
  RefreshCw, 
  Activity, 
  Zap,
  Check
} from 'lucide-react';
import { DeviceConfig } from '../types';

interface DiagnosticsProps {
  deviceConfig: DeviceConfig;
  onChangeDeviceConfig: (cfg: Partial<DeviceConfig>) => void;
  onClose: () => void;
}

export const DeviceDiagnosticsModal: React.FC<DiagnosticsProps> = ({
  deviceConfig,
  onChangeDeviceConfig,
  onClose,
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    decoderStatus: string;
    usbHostStatus: string;
    safStatus: string;
    ramOptimization: string;
    roomDbLatency: string;
  }>({
    decoderStatus: 'Software Fallback ACTIVE (HEVC 10-bit & MKV compatible)',
    usbHostStatus: 'USB Host API (Libaums Driver: FAT32, exFAT, NTFS mounted)',
    safStatus: deviceConfig.apiLevel >= 24 ? 'Storage Access Framework Native' : 'Direct libaums SCSI emulation (API 23)',
    ramOptimization: 'Glide Hardware Bitmap Pooling (Downsample to 480x270)',
    roomDbLatency: '0.42ms (Keyed by driveId + filePath)',
  });

  const runAllTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
      setTestResults({
        decoderStatus: 'Verified: DefaultRenderersFactory software fallback active',
        usbHostStatus: 'Verified: Class 0x08 Mass Storage endpoints polled',
        safStatus: deviceConfig.apiLevel >= 24 ? 'SAF Uri Persisted' : 'Libaums Block Device SCSI Ready',
        ramOptimization: 'Glide Bitmap Pool: 12MB Heap Allocation saved',
        roomDbLatency: '0.38ms (SQLite WAL mode indexing active)',
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#141414] border border-[#2D2D2D] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Backwards Compatibility & Hardware Diagnostics
              </h3>
              <p className="text-xs text-gray-400">
                Verifying Android 6.0+ Marshmallow (API 23) to Android 14 (API 34) execution layers
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* OS & Architecture Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-3.5 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Emulated Android Version
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-orange-400">
                  Android {deviceConfig.androidVersion} (API {deviceConfig.apiLevel})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242424] text-gray-300">
                  {deviceConfig.apiLevel <= 23 ? 'Legacy Mode' : 'Modern Mode'}
                </span>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-3.5 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                OEM Environment
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-white">
                  {deviceConfig.brand.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Checks List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Diagnostic Checks & Emulated Hardware Subsystems
            </div>

            {/* Check 1: Software Codec Fallback */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3.5 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Media3 / ExoPlayer Software Decoder Fallback</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {testResults.decoderStatus}
                </p>
              </div>
            </div>

            {/* Check 2: Dual Layer OTG Driver */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3.5 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Dual-Layer OTG (SAF + Libaums Host Driver)</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">MOUNTED</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {testResults.usbHostStatus}
                </p>
              </div>
            </div>

            {/* Check 3: Glide Low RAM Pooling */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3.5 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Glide Hardware Bitmap Pooling & Downsampling</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {testResults.ramOptimization}
                </p>
              </div>
            </div>

            {/* Check 4: Room DB Speed */}
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-3.5 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Room DB Watch History Cache Latency</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">FAST</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {testResults.roomDbLatency}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F0F0F] border-t border-[#222]">
          <span className="text-xs text-gray-500 font-mono">
            Compatibility Status: 100% Passed
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="px-4 py-2 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-200 text-xs font-semibold rounded-xl border border-[#333] flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Benchmarking...' : 'Re-Run Subsystem Tests'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
