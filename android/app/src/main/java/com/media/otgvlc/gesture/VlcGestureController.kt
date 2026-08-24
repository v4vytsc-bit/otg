package com.media.otgvlc.gesture

import android.content.Context
import android.media.AudioManager
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.View
import kotlin.math.abs

/**
 * VLC-style gesture detector:
 * - Left vertical drag: Screen Brightness (0-100%)
 * - Right vertical drag: Media Volume (0-100%)
 * - Horizontal swipe: Fine seek scrubbing (±ms)
 * - Left/Right double tap: ±10s jump
 */
class VlcGestureController(
    private val context: Context,
    view: View,
    private val onBrightnessChanged: (Float) -> Unit,
    private val onVolumeChanged: (Float) -> Unit,
    private val onSeekRelative: (Long) -> Unit,
    private val onDoubleTap: (isRightSide: Boolean) -> Unit
) {
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
    private var currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
    private var currentBrightness = 70f // default 70%

    private val gestureDetector = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {

        override fun onDoubleTap(e: MotionEvent): Boolean {
            val isRightSide = e.x > view.width / 2
            onDoubleTap(isRightSide)
            return true
        }

        override fun onScroll(
            e1: MotionEvent?,
            e2: MotionEvent,
            distanceX: Float,
            distanceY: Float
        ): Boolean {
            if (e1 == null) return false

            val deltaX = e2.x - e1.x
            val deltaY = e2.y - e1.y

            if (abs(deltaX) > abs(deltaY)) {
                // Horizontal Swipe: Seek Scrubbing
                val seekDeltaMs = (deltaX * 50).toLong()
                onSeekRelative(seekDeltaMs)
            } else {
                // Vertical Swipe: Left = Brightness, Right = Volume
                val isRightSide = e1.x > view.width / 2
                val percentDelta = -(distanceY / view.height) * 100f

                if (isRightSide) {
                    val targetVol = (currentVolume + (percentDelta / 100f * maxVolume)).coerceIn(0f, maxVolume.toFloat())
                    currentVolume = targetVol.toInt()
                    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, currentVolume, 0)
                    onVolumeChanged((currentVolume.toFloat() / maxVolume) * 100f)
                } else {
                    currentBrightness = (currentBrightness + percentDelta).coerceIn(5f, 100f)
                    onBrightnessChanged(currentBrightness)
                }
            }
            return true
        }
    })

    init {
        view.setOnTouchListener { _, event ->
            gestureDetector.onTouchEvent(event)
            true
        }
    }
}
