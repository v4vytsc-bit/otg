import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FolderTree, 
  Terminal, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_KOTLIN_PROJECT, AndroidSourceFile } from '../data/androidKotlinCode';

export const KotlinCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(ANDROID_KOTLIN_PROJECT[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Add README.md
      zip.file(
        'README.md',
        `# Android OTG USB File Explorer & VLC Player (Legacy minSdk 23 to targetSdk 34)

## Overview
High-compatibility native Android app in Kotlin that auto-launches on USB OTG pendrive connection, supports folder-by-folder navigation, persists watch progress per drive in Room DB with YouTube-style red thumbnail progress bars, and plays media with a VLC touch-gesture engine.

## Architecture Highlights
- **minSdk 23** (Android 6.0 Marshmallow) to **targetSdk 34+**
- **Dual-layer OTG**: SAF (API 24+) and libaums USB Mass Storage Host API (API 23+)
- **Realme / ColorOS Helper**: Handles 10-minute auto-cutoff for USB OTG power
- **Media3 ExoPlayer**: Decoder software fallback enabled (\`setEnableDecoderFallback(true)\`) for HEVC 10-bit & MKV on legacy chipsets
- **Background Audio**: MediaSessionService foreground playback with Android Media Notification
- **VLC Gestures**: Swipe left for Brightness, Swipe right for Volume, Horizontal swipe for seek scrubbing, Double tap ±10s jump
`
      );

      // Add all project source files
      ANDROID_KOTLIN_PROJECT.forEach((file) => {
        zip.file(file.path, file.code);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Android_OTG_VLC_Explorer_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'gradle', label: 'Gradle Config' },
    { id: 'manifest', label: 'Manifest & USB' },
    { id: 'room', label: 'Room Database' },
    { id: 'otg', label: 'OTG & Realme' },
    { id: 'player', label: 'VLC & Gestures' },
    { id: 'ui', label: 'Adapters & UI' },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFiles = activeCategory === 'all'
    ? ANDROID_KOTLIN_PROJECT
    : ANDROID_KOTLIN_PROJECT.filter(f => f.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      
      {/* File Tree Sidebar */}
      <div className="w-full md:w-80 border-r flex flex-col shrink-0
        dark:bg-[#111111] dark:border-gray-800
        light:bg-slate-50 light:border-slate-200
        oled:bg-black oled:border-zinc-800
        amber:bg-[#16100B] amber:border-[#2C1D13]">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b dark:border-gray-800 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-xs uppercase tracking-wider">Kotlin Source Files</span>
          </div>
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow transition-all"
            title="Download full Android Studio Project as ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Zipping...' : 'Export ZIP'}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center overflow-x-auto p-2 gap-1 border-b dark:border-gray-800/60 scrollbar-none text-[11px]">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                activeCategory === c.id
                  ? 'bg-orange-600/20 text-orange-400 font-bold border border-orange-500/30'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-start space-x-2.5 p-2.5 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-gray-500/10 opacity-80 hover:opacity-100'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono truncate">{file.name}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'opacity-50'}`}>
                    {file.path}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Code Editor View */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0D0D0D] text-gray-200">
        
        {/* Editor Top Bar */}
        <div className="px-4 py-3 bg-[#151515] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="font-mono text-xs font-bold text-orange-400">{selectedFile.path}</span>
            <span className="text-[11px] opacity-60 hidden lg:inline truncate max-w-md">
              — {selectedFile.description}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-200 border border-zinc-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono text-xs leading-relaxed">
          <pre className="text-emerald-400/90 whitespace-pre">
            <code>{selectedFile.code}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};
