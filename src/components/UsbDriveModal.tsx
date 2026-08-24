import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  Usb, 
  Check, 
  Plus, 
  FileVideo, 
  FolderPlus, 
  Sparkles,
  Zap 
} from 'lucide-react';
import { OtgDrive, VideoItem } from '../types';
import { formatBytes } from '../utils/historyStorage';

interface UsbModalProps {
  drives: OtgDrive[];
  currentDriveId: string;
  onSelectDrive: (driveId: string) => void;
  onAddNewDrive: (newDrive: OtgDrive) => void;
  onClose: () => void;
}

export const UsbDriveModal: React.FC<UsbModalProps> = ({
  drives,
  currentDriveId,
  onSelectDrive,
  onAddNewDrive,
  onClose,
}) => {
  const [newDriveLabel, setNewDriveLabel] = useState('');
  const [newDriveFs, setNewDriveFs] = useState<'FAT32' | 'exFAT' | 'NTFS'>('exFAT');
  const [newDriveSizeGb, setNewDriveSizeGb] = useState(64);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateDrive = () => {
    if (!newDriveLabel.trim()) return;
    const id = `USB_${newDriveLabel.toUpperCase().replace(/\s+/g, '_')}_${Math.floor(1000 + Math.random() * 9000)}`;
    
    const sampleVideos: VideoItem[] = [
      {
        id: `custom-vid-1-${Date.now()}`,
        name: '4K_Wildlife_Cinematic_Demo.mkv',
        filePath: '/Wildlife/4K_Wildlife_Cinematic_Demo.mkv',
        parentFolder: '/Wildlife',
        sizeBytes: 1.8 * 1024 * 1024 * 1024,
        durationMs: 480000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        format: 'mkv',
        codec: 'HEVC 10-bit',
        resolution: '4K UHD',
        audioTracks: [{ id: 'a1', label: 'English 5.1', language: 'en' }],
        subtitles: []
      },
      {
        id: `custom-vid-2-${Date.now()}`,
        name: 'Action_Pursuit_Trailer.mp4',
        filePath: '/Trailers/Action_Pursuit_Trailer.mp4',
        parentFolder: '/Trailers',
        sizeBytes: 350 * 1024 * 1024,
        durationMs: 120000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        format: 'mp4',
        codec: 'H.264',
        resolution: '1080p FHD',
        audioTracks: [{ id: 'a1', label: 'Stereo', language: 'en' }],
        subtitles: []
      }
    ];

    const newDrive: OtgDrive = {
      id,
      label: `${newDriveLabel} (${newDriveSizeGb} GB)`,
      fileSystem: newDriveFs,
      capacityBytes: newDriveSizeGb * 1024 * 1024 * 1024,
      usedBytes: 2.15 * 1024 * 1024 * 1024,
      folders: [
        { id: 'f_wild', name: 'Wildlife', path: '/Wildlife', parentPath: '/', itemCount: 1 },
        { id: 'f_trail', name: 'Trailers', path: '/Trailers', parentPath: '/', itemCount: 1 }
      ],
      videos: sampleVideos
    };

    onAddNewDrive(newDrive);
    onSelectDrive(newDrive.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#141414] border border-[#2D2D2D] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Usb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">USB OTG Drive Manager</h3>
              <p className="text-xs text-gray-400">
                Simulate plug-in events and multi-filesystem compatibility (FAT32, exFAT, NTFS)
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
          {/* Drive List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Connected Pendrives & External Drives
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {drives.map((drive) => {
                const isSelected = drive.id === currentDriveId;
                const usedPct = Math.round((drive.usedBytes / drive.capacityBytes) * 100);

                return (
                  <div
                    key={drive.id}
                    onClick={() => {
                      onSelectDrive(drive.id);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-600/10 border-orange-500/50 shadow-md'
                        : 'bg-[#181818] border-[#262626] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-orange-600 text-white' : 'bg-[#222] text-gray-400'
                      }`}>
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-white">{drive.label}</h4>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#262626] text-orange-400 rounded">
                            {drive.fileSystem}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">
                          {formatBytes(drive.usedBytes)} / {formatBytes(drive.capacityBytes)} ({usedPct}% used) • {drive.videos.length} videos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button className="px-3 py-1 rounded-lg bg-[#242424] hover:bg-orange-600 text-gray-300 hover:text-white text-xs font-medium transition-colors">
                          Mount Drive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Custom Drive Simulation */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#222] border border-dashed border-[#333] hover:border-orange-500 rounded-xl text-xs font-semibold text-gray-300 hover:text-orange-400 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simulate Plugging In Another USB Drive</span>
            </button>
          ) : (
            <div className="p-4 bg-[#181818] border border-[#2D2D2D] rounded-xl space-y-4">
              <div className="font-bold text-xs text-white uppercase tracking-wider">
                Plug In New USB Storage
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Drive Model Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Corsair Flash Voyager"
                    value={newDriveLabel}
                    onChange={(e) => setNewDriveLabel(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Filesystem Format</label>
                  <select
                    value={newDriveFs}
                    onChange={(e) => setNewDriveFs(e.target.value as any)}
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="FAT32">FAT32 (Legacy Universal)</option>
                    <option value="exFAT">exFAT (Modern &gt;4GB)</option>
                    <option value="NTFS">NTFS (Windows PC)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Capacity</label>
                  <select
                    value={newDriveSizeGb}
                    onChange={(e) => setNewDriveSizeGb(Number(e.target.value))}
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value={32}>32 GB</option>
                    <option value={64}>64 GB</option>
                    <option value={128}>128 GB</option>
                    <option value={256}>256 GB</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDrive}
                  disabled={!newDriveLabel.trim()}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Mount & Connect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F0F0F] border-t border-[#222]">
          <span className="text-[11px] text-gray-500 font-mono">
            libaums USB Host Layer Active
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#202020] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
