import { OtgDrive } from '../types';

export const SAMPLE_OTG_DRIVES: OtgDrive[] = [
  {
    id: 'SANDISK_ULTRA_64GB_9A21',
    label: 'SanDisk Ultra Dual Drive (64 GB)',
    fileSystem: 'FAT32',
    capacityBytes: 64 * 1024 * 1024 * 1024,
    usedBytes: 42.8 * 1024 * 1024 * 1024,
    folders: [
      { id: 'f1', name: 'Movies & Cinema', path: '/Movies & Cinema', parentPath: '/', itemCount: 3 },
      { id: 'f2', name: 'Anime & Animations', path: '/Anime & Animations', parentPath: '/', itemCount: 2 },
      { id: 'f3', name: 'Camera Footage (4K)', path: '/Camera Footage (4K)', parentPath: '/', itemCount: 1 },
      { id: 'f4', name: 'Sci-Fi Shorts', path: '/Movies & Cinema/Sci-Fi Shorts', parentPath: '/Movies & Cinema', itemCount: 2 },
    ],
    videos: [
      {
        id: 'vid-1',
        name: 'Tears_of_Steel_1080p_HEVC.mkv',
        filePath: '/Movies & Cinema/Tears_of_Steel_1080p_HEVC.mkv',
        parentFolder: '/Movies & Cinema',
        sizeBytes: 1.4 * 1024 * 1024 * 1024,
        durationMs: 734000, // 12m 14s
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        format: 'mkv',
        codec: 'HEVC 10-bit',
        resolution: '1080p FHD',
        audioTracks: [
          { id: 'a1', label: 'English 5.1 (Surround)', language: 'en' },
          { id: 'a2', label: 'Spanish (Stereo)', language: 'es' },
          { id: 'a3', label: 'Director Commentary', language: 'en-comm' },
        ],
        subtitles: [
          {
            id: 's1',
            label: 'English [CC]',
            language: 'en',
            content: `1\n00:00:01,000 --> 00:00:05,000\n[Atmospheric Synthesizer Music]\n\n2\n00:00:07,500 --> 00:00:11,200\nThom: We had an agreement, Celia.\n\n3\n00:00:12,000 --> 00:00:16,800\nCelia: The world changed while you were rebuilding your machine.\n\n4\n00:00:20,100 --> 00:00:25,000\nThom: Calibration locks engaged. Stand clear of the relay array!\n\n5\n00:00:30,000 --> 00:00:35,000\n[Robotic Sentinels Hum in Distance]\n\n6\n00:00:42,000 --> 00:00:46,000\nCelia: It's too late. The orbital link is already transmitting.`
          },
          {
            id: 's2',
            label: 'Spanish',
            language: 'es',
            content: `1\n00:00:01,000 --> 00:00:05,000\n[Música de sintetizador atmosférica]\n\n2\n00:00:07,500 --> 00:00:11,200\nThom: Teníamos un acuerdo, Celia.\n\n3\n00:00:12,000 --> 00:00:16,800\nCelia: El mundo cambió mientras reconstruías tu máquina.`
          }
        ]
      },
      {
        id: 'vid-2',
        name: 'Sintel_OpenSource_Cinema_4K.mp4',
        filePath: '/Anime & Animations/Sintel_OpenSource_Cinema_4K.mp4',
        parentFolder: '/Anime & Animations',
        sizeBytes: 2.1 * 1024 * 1024 * 1024,
        durationMs: 888000, // 14m 48s
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        format: 'mp4',
        codec: 'H.264',
        resolution: '4K 2160p',
        audioTracks: [
          { id: 'a1', label: 'Original Orchestral Score (DTS-HD)', language: 'en' },
          { id: 'a2', label: 'French Dub', language: 'fr' }
        ],
        subtitles: [
          {
            id: 's1',
            label: 'English',
            language: 'en',
            content: `1\n00:00:05,000 --> 00:00:09,000\n[Wind howls violently over snowy peaks]\n\n2\n00:00:12,000 --> 00:00:16,000\nSintel: Where are you hiding, little one?\n\n3\n00:00:25,000 --> 00:00:30,000\n[Dragon wings flapping through mountain clouds]`
          }
        ]
      },
      {
        id: 'vid-3',
        name: 'Big_Buck_Bunny_60fps_Dolby.mp4',
        filePath: '/Anime & Animations/Big_Buck_Bunny_60fps_Dolby.mp4',
        parentFolder: '/Anime & Animations',
        sizeBytes: 850 * 1024 * 1024,
        durationMs: 596000, // 9m 56s
        thumbnailUrl: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        format: 'mp4',
        codec: 'VP9',
        resolution: '1080p 60fps',
        audioTracks: [
          { id: 'a1', label: 'English Stereo', language: 'en' }
        ],
        subtitles: []
      },
      {
        id: 'vid-4',
        name: 'Cosmos_Laundromat_First_Cycle.webm',
        filePath: '/Movies & Cinema/Cosmos_Laundromat_First_Cycle.webm',
        parentFolder: '/Movies & Cinema',
        sizeBytes: 1.8 * 1024 * 1024 * 1024,
        durationMs: 725000, // 12m 05s
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        format: 'webm',
        codec: 'AV1',
        resolution: '1080p FHD',
        audioTracks: [
          { id: 'a1', label: 'English Master', language: 'en' }
        ],
        subtitles: []
      },
      {
        id: 'vid-5',
        name: 'For_Bigger_Blazes_HDR_Demo.mp4',
        filePath: '/Camera Footage (4K)/For_Bigger_Blazes_HDR_Demo.mp4',
        parentFolder: '/Camera Footage (4K)',
        sizeBytes: 320 * 1024 * 1024,
        durationMs: 15000, // 15s
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        format: 'mp4',
        codec: 'HEVC 10-bit',
        resolution: '4K HDR',
        audioTracks: [
          { id: 'a1', label: 'Dolby Digital Plus', language: 'en' }
        ],
        subtitles: []
      },
      {
        id: 'vid-6',
        name: 'SciFi_Station_Alpha_Log_04.mkv',
        filePath: '/Movies & Cinema/Sci-Fi Shorts/SciFi_Station_Alpha_Log_04.mkv',
        parentFolder: '/Movies & Cinema/Sci-Fi Shorts',
        sizeBytes: 640 * 1024 * 1024,
        durationMs: 310000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        format: 'mkv',
        codec: 'H.264',
        resolution: '1080p FHD',
        audioTracks: [
          { id: 'a1', label: 'Audio Track 1', language: 'en' }
        ],
        subtitles: []
      },
      {
        id: 'vid-7',
        name: 'Deep_Space_Relay_Telemetry.mp4',
        filePath: '/Movies & Cinema/Sci-Fi Shorts/Deep_Space_Relay_Telemetry.mp4',
        parentFolder: '/Movies & Cinema/Sci-Fi Shorts',
        sizeBytes: 480 * 1024 * 1024,
        durationMs: 240000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        format: 'mp4',
        codec: 'H.264',
        resolution: '720p HD',
        audioTracks: [
          { id: 'a1', label: 'English Standard', language: 'en' }
        ],
        subtitles: []
      }
    ]
  },
  {
    id: 'SAMSUNG_BAR_PLUS_128GB_4F88',
    label: 'Samsung BAR Plus (128 GB)',
    fileSystem: 'exFAT',
    capacityBytes: 128 * 1024 * 1024 * 1024,
    usedBytes: 89.2 * 1024 * 1024 * 1024,
    folders: [
      { id: 'sb-f1', name: 'Documentary Series', path: '/Documentary Series', parentPath: '/', itemCount: 2 },
      { id: 'sb-f2', name: 'Tech Tutorials', path: '/Tech Tutorials', parentPath: '/', itemCount: 1 },
    ],
    videos: [
      {
        id: 'sb-vid-1',
        name: 'Nature_Planet_Deep_Oceans_4K.mp4',
        filePath: '/Documentary Series/Nature_Planet_Deep_Oceans_4K.mp4',
        parentFolder: '/Documentary Series',
        sizeBytes: 3.2 * 1024 * 1024 * 1024,
        durationMs: 960000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        format: 'mp4',
        codec: 'HEVC 10-bit',
        resolution: '4K UHD',
        audioTracks: [{ id: 'a1', label: 'English Narration', language: 'en' }],
        subtitles: []
      },
      {
        id: 'sb-vid-2',
        name: 'Wild_Serengeti_Migration_HDR.mkv',
        filePath: '/Documentary Series/Wild_Serengeti_Migration_HDR.mkv',
        parentFolder: '/Documentary Series',
        sizeBytes: 2.8 * 1024 * 1024 * 1024,
        durationMs: 840000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        format: 'mkv',
        codec: 'VP9',
        resolution: '1080p FHD',
        audioTracks: [{ id: 'a1', label: 'Original', language: 'en' }],
        subtitles: []
      }
    ]
  },
  {
    id: 'KINGSTON_DT50_32GB_B712',
    label: 'Kingston DataTraveler (32 GB)',
    fileSystem: 'NTFS',
    capacityBytes: 32 * 1024 * 1024 * 1024,
    usedBytes: 18.5 * 1024 * 1024 * 1024,
    folders: [
      { id: 'k-f1', name: 'Action Trailers', path: '/Action Trailers', parentPath: '/', itemCount: 2 },
    ],
    videos: [
      {
        id: 'k-vid-1',
        name: 'Subaru_Outback_Adventure_Spot.mp4',
        filePath: '/Action Trailers/Subaru_Outback_Adventure_Spot.mp4',
        parentFolder: '/Action Trailers',
        sizeBytes: 140 * 1024 * 1024,
        durationMs: 60000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        format: 'mp4',
        codec: 'H.264',
        resolution: '1080p FHD',
        audioTracks: [{ id: 'a1', label: 'Stereo', language: 'en' }],
        subtitles: []
      },
      {
        id: 'k-vid-2',
        name: 'For_Bigger_Meltdowns_Teaser.mp4',
        filePath: '/Action Trailers/For_Bigger_Meltdowns_Teaser.mp4',
        parentFolder: '/Action Trailers',
        sizeBytes: 210 * 1024 * 1024,
        durationMs: 120000,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        format: 'mp4',
        codec: 'H.264',
        resolution: '1080p FHD',
        audioTracks: [{ id: 'a1', label: 'Dolby 5.1', language: 'en' }],
        subtitles: []
      }
    ]
  }
];
