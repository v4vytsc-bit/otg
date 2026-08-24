import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Layers, 
  Terminal, 
  FolderTree, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import JSZip from 'jszip';
import { KOTLIN_PROJECT_FILES, KotlinCodeFile } from '../utils/androidCodebase';

interface AndroidCodeModalProps {
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const currentFile = KOTLIN_PROJECT_FILES[selectedFileIndex] || KOTLIN_PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Add README and all Kotlin project files
      zip.file('README.md', `# Android OTG USB File Explorer & VLC Player
## Production Kotlin Architecture (API 23 to 34+)

This production package includes:
1. **build.gradle.kts**: Configured for minSdk 23 (Android 6.0 Marshmallow), AndroidX Media3 1.3.1, Room 2.6.1, Glide 4.16.0, and libaums 0.8.6.
2. **AndroidManifest.xml**: Configured with USB_DEVICE_ATTACHED auto-launch intent and device_filter.xml.
3. **Room Database**: Complete schema tracking watch history per USB drive & file path.
4. **VLC Gesture Engine**: Complete TouchListener supporting Brightness, Volume, Scrub Seeking & Double-Tap edge jump.
5. **Software Codec Fallback**: ExoPlayer configuration ensuring 10-bit HEVC & MKV play smoothly on older chipsets.
6. **Realme / ColorOS Helper**: Deep-links to hidden 10-minute OTG timeout toggle.
`);

      for (const f of KOTLIN_PROJECT_FILES) {
        zip.file(f.path, f.content);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'OtgMediaExplorer-Kotlin-Production.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#2A2A2A] w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  Native Android (Kotlin) Production Codebase
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-semibold">
                  minSdk 23 • targetSdk 34
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Complete, backwards-compatible implementation ready for Android Studio
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow-md shadow-orange-950/40 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Generating ZIP...' : 'Download Project ZIP'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Sidebar */}
          <div className="w-72 bg-[#0F0F0F] border-r border-[#222] p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Source Files ({KOTLIN_PROJECT_FILES.length})
              </div>
              <div className="space-y-1">
                {KOTLIN_PROJECT_FILES.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`w-full flex flex-col p-2.5 rounded-lg text-left transition-all ${
                      selectedFileIndex === idx
                        ? 'bg-orange-600/15 border border-orange-500/40 text-orange-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-orange-400/80" />
                      <span className="font-mono text-xs font-semibold truncate">
                        {file.path.split('/').pop()}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5 truncate pl-5">
                      {file.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="mt-4 p-3 bg-[#161616] border border-[#262626] rounded-xl space-y-1.5 text-[10px] text-gray-400">
              <div className="font-bold text-gray-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified Standards
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                <li>ExoPlayer Software Fallback enabled</li>
                <li>Glide Hardware Bitmap Pooling</li>
                <li>Room DB keyed by DriveId + Path</li>
                <li>Realme / ColorOS 10m OTG routing</li>
              </ul>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
            {/* File Path Header & Copy Button */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#222] bg-[#141414]">
              <div>
                <span className="text-xs font-mono font-bold text-orange-400">
                  {currentFile.path}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">{currentFile.description}</p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-200 hover:text-white text-xs font-medium border border-[#333] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Output Text */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs text-gray-300 leading-relaxed bg-[#0A0A0A]">
              <pre className="whitespace-pre">
                <code>{currentFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
