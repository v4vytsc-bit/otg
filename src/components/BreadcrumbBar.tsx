import React from 'react';
import { 
  ChevronRight, 
  Home, 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  HardDrive, 
  Folder,
  Film
} from 'lucide-react';
import { OtgDrive } from '../types';
import { formatBytes } from '../utils/mediaUtils';

interface BreadcrumbBarProps {
  activeDrive: OtgDrive | null;
  currentPath: string;
  onNavigatePath: (path: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalVideosCount: number;
  totalFoldersCount: number;
  currentPathBytes: number;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  activeDrive,
  currentPath,
  onNavigatePath,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalVideosCount,
  totalFoldersCount,
  currentPathBytes,
}) => {
  // Parse path segments: e.g. "/Movies & Cinema/Sci-Fi Shorts" -> ["Movies & Cinema", "Sci-Fi Shorts"]
  const pathSegments = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);

  return (
    <div className="px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0
      dark:bg-[#101010] dark:border-gray-800
      light:bg-slate-50 light:border-slate-200
      oled:bg-black oled:border-zinc-800
      amber:bg-[#150F0B] amber:border-[#2C1D13]">
      
      {/* Breadcrumb Navigation Trail */}
      <div className="flex items-center flex-wrap gap-1 text-sm font-medium">
        <button
          onClick={() => onNavigatePath('/')}
          className="flex items-center space-x-1.5 px-2 py-1 rounded-lg transition-colors hover:text-orange-500
            dark:hover:bg-gray-800 light:hover:bg-slate-200 oled:hover:bg-zinc-900 amber:hover:bg-[#251A12]"
          title="Root Directory of USB Drive"
        >
          <HardDrive className="w-4 h-4 text-orange-500" />
          <span className="font-semibold">{activeDrive?.label || 'USB Drive'}</span>
        </button>

        {pathSegments.map((segment, index) => {
          const targetPath = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;

          return (
            <React.Fragment key={targetPath}>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              <button
                onClick={() => onNavigatePath(targetPath)}
                className={`px-2 py-1 rounded-lg transition-colors truncate max-w-[160px] sm:max-w-[220px] ${
                  isLast
                    ? 'text-orange-500 font-bold'
                    : 'opacity-70 hover:opacity-100 hover:text-orange-500'
                } dark:hover:bg-gray-800 light:hover:bg-slate-200 oled:hover:bg-zinc-900 amber:hover:bg-[#251A12]`}
                title={segment}
              >
                {segment}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Directory Stats & Search & View Toggle */}
      <div className="flex items-center flex-wrap gap-2.5 ml-auto">
        {/* Sub-item Count Badges */}
        <div className="hidden sm:flex items-center space-x-3 text-xs opacity-60 font-mono">
          <span className="flex items-center space-x-1">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>{totalFoldersCount} folders</span>
          </span>
          <span className="flex items-center space-x-1">
            <Film className="w-3.5 h-3.5 text-orange-500" />
            <span>{totalVideosCount} videos</span>
          </span>
          <span>• {formatBytes(currentPathBytes)}</span>
        </div>

        {/* Search Filter */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 opacity-40 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-xs pl-8 pr-3 py-1.5 rounded-lg border w-36 sm:w-48 focus:outline-none focus:ring-1 focus:ring-orange-500
              dark:bg-[#1A1A1A] dark:border-gray-700 dark:text-gray-200
              light:bg-white light:border-slate-300 light:text-slate-900
              oled:bg-zinc-900 oled:border-zinc-800 oled:text-white
              amber:bg-[#1E1610] amber:border-[#3A271B] amber:text-amber-100"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-lg border
          dark:bg-[#181818] dark:border-gray-700
          light:bg-slate-100 light:border-slate-300
          oled:bg-zinc-900 oled:border-zinc-800
          amber:bg-[#1C150E] amber:border-[#382618]">
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-orange-600 text-white'
                : 'opacity-50 hover:opacity-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            title="List View"
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-orange-600 text-white'
                : 'opacity-50 hover:opacity-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
