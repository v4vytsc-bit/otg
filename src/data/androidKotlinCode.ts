export interface AndroidSourceFile {
  path: string;
  name: string;
  category: 'manifest' | 'gradle' | 'room' | 'otg' | 'player' | 'ui';
  description: string;
  code: string;
}

export const ANDROID_KOTLIN_PROJECT: AndroidSourceFile[] = [
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts',
    category: 'gradle',
    description: 'Target SDK 34, Min SDK 23 (Android 6.0 Marshmallow compat), Media3, Room, Glide & libaums dependencies.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
}

android {
    namespace = "com.media.otgvlc"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.media.otgvlc"
        minSdk = 23 // Backwards compatible down to Android 6.0 Marshmallow
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true

        // Optimize APK size and split architectures for legacy 32-bit & modern 64-bit SOCs
        ndk {
            abiFilters.addAll(setOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    // AndroidX Core & Lifecycle (Optimized for minSdk 23)
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")

    // AndroidX Media3 / ExoPlayer with Software Codec Fallback & MediaSessionService
    val media3Version = "1.3.0"
    implementation("androidx.media3:media3-exoplayer:$media3Version")
    implementation("androidx.media3:media3-ui:$media3Version")
    implementation("androidx.media3:media3-session:$media3Version")
    implementation("androidx.media3:media3-extractor:$media3Version")
    implementation("androidx.media3:media3-datasource-okhttp:$media3Version")

    // Room Database for Watch History & Per-Drive Persistence
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    // Glide with Hardware Bitmap Pooling for Video Thumbnails on Low-RAM devices
    implementation("com.github.bumptech.glide:glide:4.16.0")
    kapt("com.github.bumptech.glide:compiler:4.16.0")

    // libaums: USB Host Mass Storage driver for legacy Android (FAT32, exFAT, NTFS direct access)
    implementation("me.jahnen.libaums:core:0.8.8")
    implementation("me.jahnen.libaums:storageprovider:0.8.8")

    // DocumentFile for Storage Access Framework (SAF) on API 24+
    implementation("androidx.documentfile:documentfile:1.0.1")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'USB_DEVICE_ATTACHED auto-launch filter, MediaPlayback foreground service, PiP support & Storage permissions.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.media.otgvlc">

    <!-- Permissions for Legacy (API 23-29) & Modern (API 30+) Storage -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    
    <!-- USB Host & OTG Features -->
    <uses-feature android:name="android.hardware.usb.host" android:required="false" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".OtgApplication"
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.OtgVlcExplorer"
        tools:targetApi="34">

        <!-- Main Directory Browser Activity (Auto-launches on OTG Pendrive Insert) -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- USB OTG Device Attached Intent Filter -->
            <intent-filter>
                <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
            </intent-filter>

            <meta-data
                android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
                android:resource="@xml/device_filter" />
        </activity>

        <!-- VLC-Style Gesture Player Activity with Picture-in-Picture Support -->
        <activity
            android:name=".ui.VlcPlayerActivity"
            android:exported="false"
            android:configChanges="screenSize|smallestScreenSize|screenLayout|orientation|keyboardHidden"
            android:supportsPictureInPicture="true"
            android:resizeableActivity="true"
            android:launchMode="singleTask"
            android:theme="@style/Theme.OtgVlcExplorer.Player" />

        <!-- Media3 Background Audio Playback Service -->
        <service
            android:name=".player.PlaybackService"
            android:exported="false"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
            </intent-filter>
        </service>

    </application>
</manifest>
`
  },
  {
    path: 'app/src/main/res/xml/device_filter.xml',
    name: 'device_filter.xml',
    category: 'manifest',
    description: 'USB Mass Storage Class filter (Class 0x08, Subclass 0x06, Protocol 0x50) to trigger OS default app prompt on pendrive attach.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- USB Mass Storage Class (Class 8 = 0x08, Bulk-Only Transport) -->
    <!-- Matches all USB Flash Drives, External SSDs, SD Card Readers and OTG Pendrives -->
    <usb-device class="8" />
    <usb-device class="8" subclass="6" />
    <usb-device class="8" subclass="6" protocol="80" />
</resources>
`
  },
  {
    path: 'app/src/main/java/com/media/otgvlc/data/db/WatchHistoryEntity.kt',
    name: 'WatchHistoryEntity.kt',
    category: 'room',
    description: 'Room entity for persisting watch progress keyed by Drive UUID / Serial + Relative File Path.',
    code: `package com.media.otgvlc.data.db

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Persists playback progress per USB Drive Identifier and relative file path.
 * When an OTG pendrive is plugged in, the app queries this entity to find the last unfinished video.
 */
@Entity(
    tableName = "watch_history",
    indices = [
        Index(value = ["driveId", "filePath"], unique = true),
        Index(value = ["updatedAt"])
    ]
)
data class WatchHistoryEntity(
    @PrimaryKey
    val compositeKey: String, // "\${driveId}:\${filePath}"
    val driveId: String,       // USB Serial or SAF Tree UUID e.g. "SANDISK_ULTRA_8C3F"
    val filePath: String,      // Relative path e.g. "/Movies/SciFi/TearsOfSteel.mkv"
    val fileName: String,      // "TearsOfSteel.mkv"
    val lastPositionMs: Long,  // Playback position in milliseconds
    val totalDurationMs: Long, // Total video duration
    val updatedAt: Long = System.currentTimeMillis(),
    val isCompleted: Boolean = false // Set true if position >= 90% of duration
) {
    val progressPercentage: Float
        get() = if (totalDurationMs > 0) {
            ((lastPositionMs.toFloat() / totalDurationMs.toFloat()) * 100f).coerceIn(0f, 100f)
        } else 0f

    companion object {
        fun createKey(driveId: String, filePath: String): String = "$driveId:$filePath"
    }
}
`
  },
  {
    path: 'app/src/main/java/com/media/otgvlc/data/db/WatchHistoryDao.kt',
    name: 'WatchHistoryDao.kt',
    category: 'room',
    description: 'Room DAO providing instant lookup for per-drive resume state and progress bar rendering.',
    code: `package com.media.otgvlc.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface WatchHistoryDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(record: WatchHistoryEntity)

    @Query("SELECT * FROM watch_history WHERE driveId = :driveId AND filePath = :filePath LIMIT 1")
    suspend fun getProgressForFile(driveId: String, filePath: String): WatchHistoryEntity?

    @Query("SELECT * FROM watch_history WHERE driveId = :driveId")
    fun observeHistoryForDrive(driveId: String): Flow<List<WatchHistoryEntity>>

    /**
     * Finds the most recently watched UNFINISHED video on the connected OTG drive
     * to show the smart "Resume [Video Name] from [MM:SS]?" popup upon drive plugin.
     */
    @Query("""
        SELECT * FROM watch_history 
        WHERE driveId = :driveId 
          AND isCompleted = 0 
          AND lastPositionMs > 10000 
        ORDER BY updatedAt DESC 
        LIMIT 1
    """)
    suspend fun getLastUnfinishedVideoForDrive(driveId: String): WatchHistoryEntity?

    @Query("DELETE FROM watch_history WHERE driveId = :driveId AND filePath = :filePath")
    suspend fun deleteProgress(driveId: String, filePath: String)

    @Query("DELETE FROM watch_history WHERE driveId = :driveId")
    suspend fun clearDriveHistory(driveId: String)
}
`
  },
  {
    path: 'app/src/main/java/com/media/otgvlc/data/db/AppDatabase.kt',
    name: 'AppDatabase.kt',
    category: 'room',
    description: 'Thread-safe Room Database singleton configured for low memory footprint on legacy Android.',
    code: `package com.media.otgvlc.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [WatchHistoryEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {

    abstract fun watchHistoryDao(): WatchHistoryDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "otg_watch_history.db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/media/otgvlc/otg/RealmeOtgHelper.kt',
    name: 'RealmeOtgHelper.kt',
    category: 'otg',
    description: 'Detects Realme UI, ColorOS (OPPO/OnePlus), and MIUI devices where OTG power cuts off after 10 min and provides direct Settings shortcut.',
    code: `package com.media.otgvlc.otg

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log

object RealmeOtgHelper {

    private const val TAG = "RealmeOtgHelper"

    /**
     * Checks if the device manufacturer has aggressive OTG auto-cutoff (ColorOS / Realme UI / OxygenOS / MIUI)
     */
    fun isColorOsOrRealme(): Boolean {
        val manufacturer = Build.MANUFACTURER.lowercase()
        val brand = Build.BRAND.lowercase()
        return manufacturer.contains("realme") ||
               manufacturer.contains("oppo") ||
               manufacturer.contains("oneplus") ||
               brand.contains("realme") ||
               brand.contains("oppo")
    }

    fun isMiui(): Boolean {
        val manufacturer = Build.MANUFACTURER.lowercase()
        return manufacturer.contains("xiaomi") || manufacturer.contains("redmi") || manufacturer.contains("poco")
    }

    /**
     * Launches the OEM-specific OTG Connection settings screen
     */
    fun openOtgSettings(context: Context) {
        val intents = listOf(
            // Realme / ColorOS OTG Settings Component
            Intent().setComponent(
                ComponentName("com.android.settings", "com.android.settings.Settings\\$OTGSettingsActivity")
            ),
            Intent().setComponent(
                ComponentName("com.coloros.settings", "com.coloros.settings.OtgSettingsActivity")
            ),
            Intent().setComponent(
                ComponentName("com.android.settings", "com.android.settings.SubSettings")
            ).apply {
                putExtra(":settings:show_fragment", "com.android.settings.OtgSettingsFragment")
            },
            // Fallback to general system settings
            Intent(Settings.ACTION_SETTINGS)
        )

        for (intent in intents) {
            try {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                Log.d(TAG, "Successfully launched OTG settings intent: \${intent.component}")
                return
            } catch (e: Exception) {
                Log.w(TAG, "Intent failed: \${intent.component}, trying next fallback...")
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/media/otgvlc/player/PlaybackService.kt',
    name: 'PlaybackService.kt',
    category: 'player',
    description: 'AndroidX Media3 MediaSessionService providing background audio playback, system notification controls, and audio focus.',
    code: `package com.media.otgvlc.player

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.media.otgvlc.R
import com.media.otgvlc.ui.VlcPlayerActivity

class PlaybackService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private lateinit var exoPlayer: ExoPlayer

    override fun onCreate() {
        super.onCreate()

        // 1. Configure Renderers Factory with SOFTWARE CODEC FALLBACK for legacy SOCs (minSdk 23)
        val renderersFactory = DefaultRenderersFactory(this).apply {
            setEnableDecoderFallback(true) // Crucial for 10-bit HEVC, MKV on older chipsets lacking HW decode
            setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER)
        }

        // 2. Build ExoPlayer instance with Audio Attributes for automatic Audio Focus handling
        exoPlayer = ExoPlayer.Builder(this, renderersFactory)
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
                    .setUsage(C.USAGE_MEDIA)
                    .build(),
                /* handleAudioFocus = */ true // Ducks or pauses audio during calls & notifications
            )
            .setHandleAudioBecomingNoisy(true) // Auto-pauses if earphones are unplugged
            .setWakeMode(C.WAKE_MODE_LOCAL)
            .build()

        // 3. Create MediaSession to tie with OS Media Notification and Android Auto / Wear
        val sessionActivityPendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, VlcPlayerActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        mediaSession = MediaSession.Builder(this, exoPlayer)
            .setSessionActivity(sessionActivityPendingIntent)
            .build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }
}
`
  },
  {
    path: 'app/src/main/java/com/media/otgvlc/player/VlcGestureTouchListener.kt',
    name: 'VlcGestureTouchListener.kt',
    category: 'player',
    description: 'VLC-style touch controller: Left swipe Brightness, Right swipe Volume, Horizontal seek scrub, Double tap ±10s.',
    code: `package com.media.otgvlc.player

import android.app.Activity
import android.content.Context
import android.media.AudioManager
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import kotlin.math.abs

interface VlcGestureCallback {
    fun onBrightnessChanged(brightnessPercent: Int)
    fun onVolumeChanged(volumePercent: Int, current: Int, max: Int)
    fun onSeekScrubbing(deltaMs: Long, targetPositionMs: Long)
    fun onSeekCommit(targetPositionMs: Long)
    fun onDoubleTapEdge(isRightEdge: Boolean) // Left edge = -10s, Right edge = +10s
    fun onSingleTap()
    fun onGestureEnded()
}

class VlcGestureTouchListener(
    private val activity: Activity,
    private val callback: VlcGestureCallback
) : View.OnTouchListener {

    private val audioManager = activity.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
    
    private var initialX = 0f
    private var initialY = 0f
    private var isDragging = false
    private var activeGestureType: GestureType = GestureType.NONE
    private var currentPositionMs = 0L
    private var totalDurationMs = 0L

    enum class GestureType {
        NONE, BRIGHTNESS, VOLUME, SEEK
    }

    private val gestureDetector = GestureDetector(activity, object : GestureDetector.SimpleOnGestureListener() {
        override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
            callback.onSingleTap()
            return true
        }

        override fun onDoubleTap(e: MotionEvent): Boolean {
            val screenWidth = activity.window.decorView.width
            val isRight = e.x > (screenWidth / 2)
            callback.onDoubleTapEdge(isRight)
            return true
        }
    })

    fun setPlaybackPosition(currentMs: Long, durationMs: Long) {
        this.currentPositionMs = currentMs
        this.totalDurationMs = durationMs
    }

    override fun onTouch(view: View, event: MotionEvent): Boolean {
        if (gestureDetector.onTouchEvent(event)) {
            return true
        }

        val screenWidth = view.width.toFloat()
        val screenHeight = view.height.toFloat()

        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                initialX = event.x
                initialY = event.y
                isDragging = false
                activeGestureType = GestureType.NONE
            }

            MotionEvent.ACTION_MOVE -> {
                val deltaX = event.x - initialX
                val deltaY = event.y - initialY
                val absX = abs(deltaX)
                val absY = abs(deltaY)

                if (!isDragging && (absX > 30 || absY > 30)) {
                    isDragging = true
                    if (absX > absY) {
                        activeGestureType = GestureType.SEEK
                    } else {
                        // Left 50% = Brightness, Right 50% = Volume
                        activeGestureType = if (initialX < screenWidth * 0.5f) {
                            GestureType.BRIGHTNESS
                        } else {
                            GestureType.VOLUME
                        }
                    }
                }

                if (isDragging) {
                    when (activeGestureType) {
                        GestureType.BRIGHTNESS -> handleBrightnessDelta(deltaY, screenHeight)
                        GestureType.VOLUME -> handleVolumeDelta(deltaY, screenHeight)
                        GestureType.SEEK -> handleSeekDelta(deltaX, screenWidth)
                        GestureType.NONE -> {}
                    }
                }
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (isDragging && activeGestureType == GestureType.SEEK) {
                    val deltaX = event.x - initialX
                    val seekDeltaMs = ((deltaX / screenWidth) * 90000).toLong() // +/- 90 seconds max scrub
                    val target = (currentPositionMs + seekDeltaMs).coerceIn(0L, totalDurationMs)
                    callback.onSeekCommit(target)
                }
                callback.onGestureEnded()
                isDragging = false
                activeGestureType = GestureType.NONE
            }
        }
        return true
    }

    private fun handleBrightnessDelta(deltaY: Float, height: Float) {
        val window = activity.window
        val lp = window.attributes
        var current = if (lp.screenBrightness < 0) 0.5f else lp.screenBrightness
        // Negative deltaY is upwards swipe -> increase brightness
        val step = -deltaY / height * 0.03f
        current = (current + step).coerceIn(0.01f, 1.0f)
        lp.screenBrightness = current
        window.attributes = lp
        callback.onBrightnessChanged((current * 100).toInt())
    }

    private fun handleVolumeDelta(deltaY: Float, height: Float) {
        val currentVol = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        val step = if (-deltaY > 0) 1 else -1
        val newVol = (currentVol + step).coerceIn(0, maxVolume)
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, newVol, 0)
        val percent = ((newVol.toFloat() / maxVolume) * 100).toInt()
        callback.onVolumeChanged(percent, newVol, maxVolume)
    }

    private fun handleSeekDelta(deltaX: Float, width: Float) {
        val seekDeltaMs = ((deltaX / width) * 90000).toLong()
        val target = (currentPositionMs + seekDeltaMs).coerceIn(0L, totalDurationMs)
        callback.onSeekScrubbing(seekDeltaMs, target)
    }
}
`
  },
  {
    path: 'app/src/main/java/com/media/otgvlc/ui/VideoThumbnailAdapter.kt',
    name: 'VideoThumbnailAdapter.kt',
    category: 'ui',
    description: 'Recyclerview adapter with Glide thumbnail downsampling and red YouTube-style watch progress bar overlay.',
    code: `package com.media.otgvlc.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.media.otgvlc.data.db.WatchHistoryEntity
import com.media.otgvlc.databinding.ItemVideoCardBinding
import com.media.otgvlc.model.VideoFileItem

class VideoThumbnailAdapter(
    private val onItemClick: (VideoFileItem, WatchHistoryEntity?) -> Unit
) : RecyclerView.Adapter<VideoThumbnailAdapter.VideoViewHolder>() {

    private val items = mutableListOf<VideoFileItem>()
    private val progressMap = mutableMapOf<String, WatchHistoryEntity>()

    fun submitList(newItems: List<VideoFileItem>, history: List<WatchHistoryEntity>) {
        items.clear()
        items.addAll(newItems)
        progressMap.clear()
        history.forEach { progressMap[it.filePath] = it }
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VideoViewHolder {
        val binding = ItemVideoCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VideoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: VideoViewHolder, position: Int) {
        val video = items[position]
        val progress = progressMap[video.relativePath]
        holder.bind(video, progress)
    }

    override fun getItemCount(): Int = items.size

    inner class VideoViewHolder(private val binding: ItemVideoCardBinding) : RecyclerView.ViewHolder(binding.root) {

        fun bind(video: VideoFileItem, history: WatchHistoryEntity?) {
            binding.tvVideoTitle.text = video.displayName
            binding.tvDuration.text = video.formattedDuration
            binding.tvFileSize.text = video.formattedSize
            binding.tvCodecBadge.text = video.codec

            // Glide with memory caching and downsampling for fast scrolling on low-RAM devices
            Glide.with(binding.ivThumbnail)
                .load(video.uri)
                .diskCacheStrategy(DiskCacheStrategy.AUTOMATIC)
                .centerCrop()
                .into(binding.ivThumbnail)

            // YouTube-style Red Progress Bar Calculation
            if (history != null && history.lastPositionMs > 1000) {
                binding.progressBarRed.visibility = View.VISIBLE
                binding.progressBarRed.progress = history.progressPercentage.toInt()
                
                // Show Watched Badge if >= 90% completed
                if (history.isCompleted || history.progressPercentage >= 90f) {
                    binding.badgeWatched.visibility = View.VISIBLE
                    binding.tvWatchedPercent.text = "Watched"
                } else {
                    binding.badgeWatched.visibility = View.GONE
                    binding.tvWatchedPercent.text = "\${history.progressPercentage.toInt()}% Watched"
                }
            } else {
                binding.progressBarRed.visibility = View.GONE
                binding.badgeWatched.visibility = View.GONE
                binding.tvWatchedPercent.text = "Unwatched"
            }

            binding.root.setOnClickListener {
                onItemClick(video, history)
            }
        }
    }
}
`
  }
];
