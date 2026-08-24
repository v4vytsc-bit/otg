package com.media.otgvlc

import android.app.PictureInPictureParams
import android.content.res.Configuration
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Rational
import android.view.View
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import com.media.otgvlc.audio.AudioRoutingHelper
import com.media.otgvlc.data.AppDatabase
import com.media.otgvlc.data.WatchHistoryEntity
import com.media.otgvlc.databinding.ActivityVlcPlayerBinding
import com.media.otgvlc.gesture.VlcGestureController
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class VlcPlayerActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_VIDEO_URI = "extra_video_uri"
        const val EXTRA_VIDEO_TITLE = "extra_video_title"
        const val EXTRA_DRIVE_ID = "extra_drive_id"
        const val EXTRA_START_POS_MS = "extra_start_pos_ms"
    }

    private lateinit var binding: ActivityVlcPlayerBinding
    private lateinit var database: AppDatabase
    private lateinit var gestureController: VlcGestureController
    private lateinit var audioRoutingHelper: AudioRoutingHelper

    private var player: ExoPlayer? = null
    private var videoUri: String? = null
    private var videoTitle: String? = null
    private var driveId: String = "primary_otg"
    private var startPositionMs: Long = 0L

    private var currentSpeed: Float = 1.0f
    private val speedPresets = listOf(0.25f, 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Keep screen on during active OTG playback
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        binding = ActivityVlcPlayerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        database = AppDatabase.getInstance(applicationContext)
        audioRoutingHelper = AudioRoutingHelper(this)

        videoUri = intent.getStringExtra(EXTRA_VIDEO_URI)
        videoTitle = intent.getStringExtra(EXTRA_VIDEO_TITLE)
        driveId = intent.getStringExtra(EXTRA_DRIVE_ID) ?: "primary_otg"
        startPositionMs = intent.getLongExtra(EXTRA_START_POS_MS, 0L)

        binding.tvHeaderTitle.text = videoTitle ?: "Video Player"

        setupGestures()
        initializePlayer()
        setupControls()
    }

    private fun initializePlayer() {
        // Renderers Factory with Software Codec Fallback for HEVC / legacy SoCs
        val renderersFactory = DefaultRenderersFactory(this).apply {
            setEnableDecoderFallback(true)
            setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER)
        }

        player = ExoPlayer.Builder(this, renderersFactory)
            .build()
            .apply {
                binding.playerView.player = this
                
                if (videoUri != null) {
                    val mediaItem = MediaItem.fromUri(Uri.parse(videoUri))
                    setMediaItem(mediaItem)
                    prepare()
                    if (startPositionMs > 0) {
                        seekTo(startPositionMs)
                    }
                    playWhenReady = true
                }

                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        if (playbackState == Player.STATE_ENDED) {
                            saveProgress(isCompleted = true)
                        }
                    }
                })
            }
    }

    private fun setupGestures() {
        gestureController = VlcGestureController(
            context = this,
            view = binding.gestureOverlay,
            onBrightnessChanged = { brightnessPercent ->
                val lp = window.attributes
                lp.screenBrightness = brightnessPercent / 100f
                window.attributes = lp
                binding.hudBrightness.apply {
                    visibility = View.VISIBLE
                    text = "Brightness: ${brightnessPercent.toInt()}%"
                }
            },
            onVolumeChanged = { volumePercent ->
                binding.hudVolume.apply {
                    visibility = View.VISIBLE
                    text = "Volume: ${volumePercent.toInt()}%"
                }
            },
            onSeekRelative = { deltaMs ->
                val current = player?.currentPosition ?: 0L
                val target = (current + deltaMs).coerceAtLeast(0L)
                player?.seekTo(target)
            },
            onDoubleTap = { isRightSide ->
                val delta = if (isRightSide) 10000L else -10000L
                val current = player?.currentPosition ?: 0L
                player?.seekTo((current + delta).coerceAtLeast(0L))
            }
        )
    }

    private fun setupControls() {
        binding.btnSpeed.setOnClickListener {
            cyclePlaybackSpeed()
        }

        binding.btnPip.setOnClickListener {
            enterPictureInPicture()
        }

        binding.btnAmoledScreenOff.setOnClickListener {
            toggleAmoledScreenOffMode()
        }
    }

    private fun cyclePlaybackSpeed() {
        val currentIndex = speedPresets.indexOf(currentSpeed)
        val nextIndex = (currentIndex + 1) % speedPresets.size
        currentSpeed = speedPresets[nextIndex]

        player?.playbackParameters = PlaybackParameters(currentSpeed)
        binding.btnSpeed.text = "${currentSpeed}x"
    }

    private fun toggleAmoledScreenOffMode() {
        val isAmoled = binding.viewAmoledBlackout.visibility == View.VISIBLE
        binding.viewAmoledBlackout.visibility = if (isAmoled) View.GONE else View.VISIBLE
    }

    private fun enterPictureInPicture() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val aspectRatio = Rational(16, 9)
            val pipParams = PictureInPictureParams.Builder()
                .setAspectRatio(aspectRatio)
                .build()
            enterPictureInPictureMode(pipParams)
        }
    }

    override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
        binding.controlDeck.visibility = if (isInPictureInPictureMode) View.GONE else View.VISIBLE
    }

    private fun saveProgress(isCompleted: Boolean = false) {
        val current = player?.currentPosition ?: 0L
        val duration = player?.duration ?: 0L
        val uri = videoUri ?: return

        lifecycleScope.launch(Dispatchers.IO) {
            database.watchHistoryDao().upsertHistory(
                WatchHistoryEntity(
                    driveId = driveId,
                    filePath = uri,
                    lastPositionMs = current,
                    durationMs = duration,
                    isCompleted = isCompleted,
                    updatedAt = System.currentTimeMillis()
                )
            )
        }
    }

    override fun onPause() {
        super.onPause()
        saveProgress()
        player?.pause()
    }

    override fun onDestroy() {
        super.onDestroy()
        saveProgress()
        player?.release()
        player = null
        audioRoutingHelper.release()
    }
}
