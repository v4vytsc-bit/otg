import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BreadcrumbBar } from './components/BreadcrumbBar';
import { FileExplorer } from './components/FileExplorer';
import { VlcPlayer } from './components/VlcPlayer';
import { PipFloatingPlayer } from './components/PipFloatingPlayer';
import { BackgroundNotificationDrawer } from './components/BackgroundNotificationDrawer';
import { DrivePluginResumeModal, VideoClickBottomSheet } from './components/ResumeDialogModal';
import { RealmeBanner } from './components/RealmeBanner';
import { DeviceSandboxModal } from './components/DeviceSandboxModal';
import { KotlinCodeViewer } from './components/KotlinCodeViewer';
import { AudioOutputDeviceModal } from './components/AudioOutputDeviceModal';
import { SAMPLE_OTG_DRIVES } from './data/sampleDrives';
import { 
  AppTheme, 
  DeviceConfig, 
  FolderItem, 
  OtgDrive, 
  VideoItem, 
  WatchHistoryRecord,
  AudioRoutingPolicy,
  AudioRoutingState
} from './types';
import { 
  getHistoryForFile, 
  getLastUnfinishedVideo, 
  loadAllHistory, 
  saveHistoryRecord 
} from './utils/mediaUtils';
import { 
  loadAudioRoutingConfig, 
  saveAudioRoutingConfig, 
  computeAutoAudioDevice,
  fetchHardwareAudioOutputs 
} from './utils/audioRoutingUtils';
import { HardDrive, Usb, Film, Play, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Theme State: 'dark' | 'light' | 'oled' | 'amber'
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('dark');

  // Navigation View: 'explorer' | 'code' | 'sandbox'
  const [activeView, setActiveView] = useState<'explorer' | 'code' | 'sandbox'>('explorer');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // OTG Drives & Filesystem State
  const [drives, setDrives] = useState<OtgDrive[]>(SAMPLE_OTG_DRIVES);
  const [activeDrive, setActiveDrive] = useState<OtgDrive | null>(SAMPLE_OTG_DRIVES[0]);
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Watch History Database (Simulating Room DB)
  const [historyMap, setHistoryMap] = useState<Record<string, WatchHistoryRecord>>({});

  // Active Players State
  const [activeVideoForPlayer, setActiveVideoForPlayer] = useState<{ video: VideoItem; startPosMs: number } | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoItem | null>(null);
  const [bgVideo, setBgVideo] = useState<VideoItem | null>(null);
  const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(1.0);

  // In-app System Notification Toast
  const [toastNotification, setToastNotification] = useState<{ id: number; title: string; message: string } | null>(null);

  const showSystemToast = (title: string, message: string) => {
    setToastNotification({ id: Date.now(), title, message });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.title === title ? null : prev));
    }, 4000);
  };

  // Modals & Bottom Sheets
  const [driveResumeModal, setDriveResumeModal] = useState<{
    isOpen: boolean;
    record: WatchHistoryRecord | null;
    video: VideoItem | null;
  }>({ isOpen: false, record: null, video: null });

  const [videoClickModal, setVideoClickModal] = useState<{
    isOpen: boolean;
    video: VideoItem | null;
    record: WatchHistoryRecord | null;
  }>({ isOpen: false, video: null, record: null });

  const [deviceSandboxOpen, setDeviceSandboxOpen] = useState(false);

  // Device Sandbox Configuration
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>({
    androidVersion: '6.0',
    apiLevel: 23,
    brand: 'Realme_ColorOS',
    otgPowerEnabled: true,
    lowRamDevice: true,
    softwareCodecFallback: true,
    storageAccessLayer: 'libaums_USB_Host',
  });

  // Audio Output Routing Engine (Auto-Android vs Manual)
  const [audioRoutingState, setAudioRoutingState] = useState<AudioRoutingState>(() => loadAudioRoutingConfig());
  const [audioModalOpen, setAudioModalOpen] = useState(false);

  // Sync real hardware devices if available
  useEffect(() => {
    fetchHardwareAudioOutputs().then((hwDevs) => {
      if (hwDevs.length > 0 && hwDevs !== audioRoutingState.availableDevices) {
        setAudioRoutingState((prev) => {
          const autoDev = computeAutoAudioDevice(hwDevs);
          return {
            ...prev,
            availableDevices: hwDevs,
            autoSelectedDevice: autoDev,
            activeDeviceId: prev.policy === 'auto_android' ? autoDev.id : prev.activeDeviceId,
          };
        });
      }
    });

    // Listen to real hardware device change events
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      const handleDeviceChange = async () => {
        const hwDevs = await fetchHardwareAudioOutputs();
        setAudioRoutingState((prev) => {
          const autoDev = computeAutoAudioDevice(hwDevs);
          const activeId = prev.policy === 'auto_android' ? autoDev.id : prev.activeDeviceId;
          const next = {
            ...prev,
            availableDevices: hwDevs,
            autoSelectedDevice: autoDev,
            activeDeviceId: activeId,
          };
          saveAudioRoutingConfig(next);
          return next;
        });
        showSystemToast('Audio Hardware Changed', 'Android Audio Output auto-detected new peripheral');
      };

      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, []);

  const handleUpdateAudioPolicy = (policy: AudioRoutingPolicy) => {
    const autoSelected = computeAutoAudioDevice(audioRoutingState.availableDevices);
    const nextActive = policy === 'auto_android' ? autoSelected.id : audioRoutingState.activeDeviceId;
    const nextState: AudioRoutingState = {
      ...audioRoutingState,
      policy,
      activeDeviceId: nextActive,
      autoSelectedDevice: autoSelected,
    };
    setAudioRoutingState(nextState);
    saveAudioRoutingConfig(nextState);
    showSystemToast(
      policy === 'auto_android' ? 'Auto Audio Routing Active' : 'Manual Audio Routing Active',
      policy === 'auto_android'
        ? `Android Auto-selected: ${autoSelected.name}`
        : 'Output sink locked to selected hardware'
    );
  };

  const handleSelectAudioDevice = (deviceId: string) => {
    const target = audioRoutingState.availableDevices.find((d) => d.id === deviceId);
    const nextState: AudioRoutingState = {
      ...audioRoutingState,
      activeDeviceId: deviceId,
    };
    setAudioRoutingState(nextState);
    saveAudioRoutingConfig(nextState);
    showSystemToast(
      'Audio Output Switched',
      target ? `Routing audio to ${target.name}` : 'Audio sink changed'
    );
  };

  const handleToggleDeviceAvailability = (deviceId: string, isAvailable: boolean) => {
    const updatedDevs = audioRoutingState.availableDevices.map((d) =>
      d.id === deviceId ? { ...d, isAvailable } : d
    );
    const autoSelected = computeAutoAudioDevice(updatedDevs);
    const activeId = audioRoutingState.policy === 'auto_android'
      ? autoSelected.id
      : audioRoutingState.activeDeviceId;

    const nextState: AudioRoutingState = {
      ...audioRoutingState,
      availableDevices: updatedDevs,
      autoSelectedDevice: autoSelected,
      activeDeviceId: activeId,
    };
    setAudioRoutingState(nextState);
    saveAudioRoutingConfig(nextState);

    const changedDev = updatedDevs.find((d) => d.id === deviceId);
    if (audioRoutingState.policy === 'auto_android') {
      showSystemToast(
        isAvailable ? `${changedDev?.type.toUpperCase()} Connected` : `${changedDev?.type.toUpperCase()} Unplugged`,
        `Android Auto-Routed audio to: ${autoSelected.name}`
      );
    }
  };

  // Apply theme class to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Pre-seed sample watch history for demonstration
  useEffect(() => {
    const existing = loadAllHistory();
    if (Object.keys(existing).length === 0) {
      // Seed sample progress for Tears of Steel (75%) and Sintel (35%)
      const seed1: WatchHistoryRecord = {
        id: `${SAMPLE_OTG_DRIVES[0].id}:/Movies & Cinema/Tears_of_Steel_1080p_HEVC.mkv`,
        driveId: SAMPLE_OTG_DRIVES[0].id,
        filePath: '/Movies & Cinema/Tears_of_Steel_1080p_HEVC.mkv',
        fileName: 'Tears_of_Steel_1080p_HEVC.mkv',
        lastPositionMs: 550500, // ~9m 10s (75%)
        totalDurationMs: 734000,
        updatedAt: Date.now() - 3600000,
        isCompleted: false,
      };
      const seed2: WatchHistoryRecord = {
        id: `${SAMPLE_OTG_DRIVES[0].id}:/Anime & Animations/Sintel_OpenSource_Cinema_4K.mp4`,
        driveId: SAMPLE_OTG_DRIVES[0].id,
        filePath: '/Anime & Animations/Sintel_OpenSource_Cinema_4K.mp4',
        fileName: 'Sintel_OpenSource_Cinema_4K.mp4',
        lastPositionMs: 310800, // ~35%
        totalDurationMs: 888000,
        updatedAt: Date.now() - 86400000,
        isCompleted: false,
      };
      saveHistoryRecord(seed1);
      saveHistoryRecord(seed2);
      setHistoryMap({ [seed1.id]: seed1, [seed2.id]: seed2 });
    } else {
      setHistoryMap(existing);
    }
  }, []);

  // Check for unfinished videos on drive mount
  const checkDriveForResume = (drive: OtgDrive) => {
    const lastUnfinished = getLastUnfinishedVideo(drive.id);
    if (lastUnfinished) {
      const video = drive.videos.find((v) => v.filePath === lastUnfinished.filePath);
      if (video) {
        setDriveResumeModal({
          isOpen: true,
          record: lastUnfinished,
          video,
        });
      }
    }
  };

  const handleSelectDrive = (drive: OtgDrive) => {
    setActiveDrive(drive);
    setCurrentPath('/');
    checkDriveForResume(drive);
  };

  const handleSimulateDriveAttach = () => {
    const nextDrive = SAMPLE_OTG_DRIVES[0];
    setActiveDrive(nextDrive);
    setCurrentPath('/');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.1 } });
    checkDriveForResume(nextDrive);
  };

  const handleSimulateDriveDetach = () => {
    setActiveDrive(null);
    setActiveVideoForPlayer(null);
    setPipVideo(null);
    setBgVideo(null);
  };

  // Video Item Click handler
  const handleSelectVideo = (video: VideoItem) => {
    if (!activeDrive) return;
    const history = getHistoryForFile(activeDrive.id, video.filePath);
    if (history && history.lastPositionMs > 3000) {
      // Show Resume vs Start from Beginning Bottom Sheet
      setVideoClickModal({
        isOpen: true,
        video,
        record: history,
      });
    } else {
      // Play immediately
      setActiveVideoForPlayer({ video, startPosMs: 0 });
    }
  };

  // Save playback progress to Room DB simulator
  const handleSaveProgress = (positionMs: number, durationMs: number, isCompleted: boolean) => {
    const currentVid = activeVideoForPlayer?.video || pipVideo || bgVideo;
    if (!activeDrive || !currentVid) return;

    const record: WatchHistoryRecord = {
      id: `${activeDrive.id}:${currentVid.filePath}`,
      driveId: activeDrive.id,
      filePath: currentVid.filePath,
      fileName: currentVid.name,
      lastPositionMs: positionMs,
      totalDurationMs: durationMs,
      updatedAt: Date.now(),
      isCompleted,
    };

    saveHistoryRecord(record);
    setHistoryMap((prev) => ({ ...prev, [record.id]: record }));
  };

  // Real local directory import
  const handleOpenRealFolder = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'video/*';
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      if (files.length === 0) return;

      const newVideos: VideoItem[] = files.map((file, idx) => ({
        id: `local-file-${idx}-${Date.now()}`,
        name: file.name,
        filePath: `/${file.name}`,
        parentFolder: '/',
        sizeBytes: file.size,
        durationMs: 120000, // Estimated default
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        videoUrl: URL.createObjectURL(file),
        format: file.name.split('.').pop() || 'mp4',
        codec: 'H.264',
        resolution: '1080p FHD',
        audioTracks: [{ id: 'a1', label: 'Default Audio', language: 'en' }],
        subtitles: [],
      }));

      const customDrive: OtgDrive = {
        id: `REAL_USB_${Date.now().toString(36).toUpperCase()}`,
        label: `Local Folder (${files.length} Files)`,
        fileSystem: 'SAF_NATIVE',
        capacityBytes: 64 * 1024 * 1024 * 1024,
        usedBytes: files.reduce((a, b) => a + b.size, 0),
        isRealDrive: true,
        folders: [],
        videos: newVideos,
      };

      setDrives((prev) => [customDrive, ...prev]);
      setActiveDrive(customDrive);
      setCurrentPath('/');
      confetti({ particleCount: 50, spread: 70 });
    };
    input.click();
  };

  // Directory calculations for breadcrumbs
  const currentFolders = activeDrive ? activeDrive.folders.filter((f) => f.parentPath === currentPath) : [];
  const currentVideos = activeDrive ? activeDrive.videos.filter((v) => v.parentFolder === currentPath) : [];
  const currentPathBytes = currentVideos.reduce((acc, v) => acc + v.sizeBytes, 0);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden transition-colors ${
      currentTheme === 'dark' ? 'bg-[#0A0A0A] text-gray-100' :
      currentTheme === 'light' ? 'bg-[#F8FAFC] text-slate-900' :
      currentTheme === 'oled' ? 'bg-[#000000] text-white' :
      'bg-[#120E0B] text-amber-50'
    }`}>
      
      {/* 1. App Header */}
      <Navbar
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        activeView={activeView}
        onViewChange={setActiveView}
        drives={drives}
        activeDrive={activeDrive}
        onSelectDrive={handleSelectDrive}
        onSimulateDriveAttach={handleSimulateDriveAttach}
        onSimulateDriveDetach={handleSimulateDriveDetach}
        onOpenRealFolder={handleOpenRealFolder}
        deviceConfig={deviceConfig}
        onOpenDeviceConfig={() => setDeviceSandboxOpen(true)}
        onTriggerNotification={showSystemToast}
        audioRoutingState={audioRoutingState}
        onOpenAudioRoutingModal={() => setAudioModalOpen(true)}
      />

      {/* In-App Android Notification Toast Banner */}
      {toastNotification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center space-x-3 bg-zinc-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700/80 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100">{toastNotification.title}</div>
              <div className="text-[11px] text-zinc-400 font-medium">{toastNotification.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Realme / ColorOS OTG 10-minute timeout notification banner */}
      <RealmeBanner
        deviceConfig={deviceConfig}
        onToggleOtgPower={() => setDeviceConfig(prev => ({ ...prev, otgPowerEnabled: !prev.otgPowerEnabled }))}
      />

      {/* 3. Main Content Views */}
      {activeView === 'code' ? (
        <KotlinCodeViewer />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeDrive ? (
            <>
              {/* Breadcrumb Path & Search Bar */}
              <BreadcrumbBar
                activeDrive={activeDrive}
                currentPath={currentPath}
                onNavigatePath={setCurrentPath}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalVideosCount={currentVideos.length}
                totalFoldersCount={currentFolders.length}
                currentPathBytes={currentPathBytes}
              />

              {/* Hierarchical Folder & Video Explorer */}
              <FileExplorer
                currentPath={currentPath}
                folders={activeDrive.folders}
                videos={activeDrive.videos}
                historyMap={historyMap}
                driveId={activeDrive.id}
                onNavigateFolder={setCurrentPath}
                onSelectVideo={handleSelectVideo}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            </>
          ) : (
            /* Empty State when no USB drive is connected */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 border border-orange-500/20 shadow-xl">
                <Usb className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-xl font-bold mb-2">No USB OTG Pendrive Connected</h2>
              <p className="text-xs opacity-70 max-w-md mb-6 leading-relaxed">
                Connect a USB flash drive or click below to simulate pendrive insertion. On Realme/ColorOS devices, verify OTG connection is toggled ON in System Settings.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleSimulateDriveAttach}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-500 text-white shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
                >
                  <Usb className="w-4 h-4" />
                  <span>Simulate Plug-in OTG Drive</span>
                </button>
                <button
                  onClick={handleOpenRealFolder}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs border hover:opacity-80 flex items-center space-x-2"
                >
                  <HardDrive className="w-4 h-4 text-orange-500" />
                  <span>Select Real Folder from Disk</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Full VLC Gesture Player Modal */}
      {activeVideoForPlayer && activeDrive && (
        <VlcPlayer
          video={activeVideoForPlayer.video}
          driveId={activeDrive.id}
          initialPositionMs={activeVideoForPlayer.startPosMs}
          softwareCodecFallbackEnabled={deviceConfig.softwareCodecFallback}
          audioRoutingState={audioRoutingState}
          onOpenAudioRoutingModal={() => setAudioModalOpen(true)}
          onSpeedChange={(spd) => setCurrentPlaybackSpeed(spd)}
          onNotify={showSystemToast}
          onClose={() => setActiveVideoForPlayer(null)}
          onSaveProgress={handleSaveProgress}
          onEnterBackgroundPlay={() => {
            setBgVideo(activeVideoForPlayer.video);
            setActiveVideoForPlayer(null);
            showSystemToast('Background Audio Active', 'MediaSessionService playing soundtrack with video hidden');
          }}
          onEnterPip={() => {
            setPipVideo(activeVideoForPlayer.video);
            setActiveVideoForPlayer(null);
            showSystemToast('PiP Mode Active', 'Video floating window opened');
          }}
        />
      )}

      {/* 5. Picture-in-Picture Floating Player */}
      {pipVideo && (
        <PipFloatingPlayer
          video={pipVideo}
          isOpen={true}
          initialSpeed={currentPlaybackSpeed}
          onClose={() => setPipVideo(null)}
          onMaximize={() => {
            const history = activeDrive ? getHistoryForFile(activeDrive.id, pipVideo.filePath) : null;
            setActiveVideoForPlayer({ video: pipVideo, startPosMs: history?.lastPositionMs || 0 });
            setPipVideo(null);
          }}
          onSwitchToBackgroundAudio={() => {
            setBgVideo(pipVideo);
            setPipVideo(null);
            showSystemToast('Switched to Background Audio', 'Video hidden - soundtrack playing');
          }}
          onSaveProgress={handleSaveProgress}
        />
      )}

      {/* 6. Background Audio Notification Drawer */}
      {bgVideo && (
        <BackgroundNotificationDrawer
          video={bgVideo}
          isOpen={true}
          initialSpeed={currentPlaybackSpeed}
          audioRoutingState={audioRoutingState}
          onOpenAudioRoutingModal={() => setAudioModalOpen(true)}
          onClose={() => setBgVideo(null)}
          onMaximize={() => {
            const history = activeDrive ? getHistoryForFile(activeDrive.id, bgVideo.filePath) : null;
            setActiveVideoForPlayer({ video: bgVideo, startPosMs: history?.lastPositionMs || 0 });
            setBgVideo(null);
          }}
          onSaveProgress={handleSaveProgress}
        />
      )}

      {/* 7. Drive Plug-in Resume Unfinished Video Modal */}
      <DrivePluginResumeModal
        isOpen={driveResumeModal.isOpen}
        historyRecord={driveResumeModal.record}
        video={driveResumeModal.video}
        onResume={() => {
          if (driveResumeModal.video && driveResumeModal.record) {
            setActiveVideoForPlayer({
              video: driveResumeModal.video,
              startPosMs: driveResumeModal.record.lastPositionMs,
            });
          }
          setDriveResumeModal({ isOpen: false, record: null, video: null });
        }}
        onBrowseDrive={() => setDriveResumeModal({ isOpen: false, record: null, video: null })}
        onClose={() => setDriveResumeModal({ isOpen: false, record: null, video: null })}
      />

      {/* 8. Video Click Resume vs Start from Beginning Modal */}
      <VideoClickBottomSheet
        isOpen={videoClickModal.isOpen}
        video={videoClickModal.video}
        historyRecord={videoClickModal.record}
        onResume={() => {
          if (videoClickModal.video && videoClickModal.record) {
            setActiveVideoForPlayer({
              video: videoClickModal.video,
              startPosMs: videoClickModal.record.lastPositionMs,
            });
          }
          setVideoClickModal({ isOpen: false, video: null, record: null });
        }}
        onStartFromBeginning={() => {
          if (videoClickModal.video) {
            setActiveVideoForPlayer({
              video: videoClickModal.video,
              startPosMs: 0,
            });
          }
          setVideoClickModal({ isOpen: false, video: null, record: null });
        }}
        onMarkAsWatched={() => {
          if (videoClickModal.video && activeDrive) {
            handleSaveProgress(videoClickModal.video.durationMs, videoClickModal.video.durationMs, true);
          }
          setVideoClickModal({ isOpen: false, video: null, record: null });
        }}
        onClose={() => setVideoClickModal({ isOpen: false, video: null, record: null })}
      />

      {/* 9. Device Compatibility Sandbox Modal */}
      <DeviceSandboxModal
        isOpen={deviceSandboxOpen}
        onClose={() => setDeviceSandboxOpen(false)}
        config={deviceConfig}
        onChangeConfig={setDeviceConfig}
      />

      {/* 10. Audio Output Device & Automatic Routing Modal */}
      <AudioOutputDeviceModal
        isOpen={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        routingState={audioRoutingState}
        onSelectDevice={handleSelectAudioDevice}
        onUpdatePolicy={handleUpdateAudioPolicy}
        onToggleDeviceAvailability={handleToggleDeviceAvailability}
      />

    </div>
  );
}
