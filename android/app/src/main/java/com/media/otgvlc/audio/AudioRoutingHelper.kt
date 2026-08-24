package com.media.otgvlc.audio

import android.content.Context
import android.media.AudioDeviceCallback
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import androidx.annotation.RequiresApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Android Native Hardware Audio Routing Manager
 *
 * Implements automatic Android audio routing hierarchy:
 * 1. Bluetooth A2DP / LE Audio / TWS Earbuds
 * 2. USB-C Lossless Audio DAC / OTG Dongle
 * 3. 3.5mm CTIA Wired Headset
 * 4. HDMI / Cast Display Audio
 * 5. Built-in Internal Stereo Speakers
 */
class AudioRoutingHelper(private val context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    data class AudioDeviceModel(
        val id: String,
        val name: String,
        val type: DeviceType,
        val isAvailable: Boolean,
        val nativeDeviceInfo: AudioDeviceInfo? = null
    )

    enum class DeviceType {
        BLUETOOTH,
        USB_DAC,
        WIRED_HEADSET,
        HDMI,
        SPEAKER
    }

    enum class RoutingPolicy {
        AUTO_ANDROID,
        MANUAL
    }

    private val _currentPolicy = MutableStateFlow(RoutingPolicy.AUTO_ANDROID)
    val currentPolicy: StateFlow<RoutingPolicy> = _currentPolicy.asStateFlow()

    private val _activeDevice = MutableStateFlow<AudioDeviceModel?>(null)
    val activeDevice: StateFlow<AudioDeviceModel?> = _activeDevice.asStateFlow()

    private val _availableDevices = MutableStateFlow<List<AudioDeviceModel>>(emptyList())
    val availableDevices: StateFlow<List<AudioDeviceModel>> = _availableDevices.asStateFlow()

    private var audioDeviceCallback: AudioDeviceCallback? = null

    init {
        refreshDevices()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            registerDeviceCallback()
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun registerDeviceCallback() {
        audioDeviceCallback = object : AudioDeviceCallback() {
            override fun onAudioDevicesAdded(addedDevices: Array<out AudioDeviceInfo>?) {
                refreshDevices()
            }

            override fun onAudioDevicesRemoved(removedDevices: Array<out AudioDeviceInfo>?) {
                refreshDevices()
            }
        }
        audioManager.registerAudioDeviceCallback(audioDeviceCallback, null)
    }

    fun refreshDevices() {
        val detected = mutableListOf<AudioDeviceModel>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
            for (dev in devices) {
                val type = when (dev.type) {
                    AudioDeviceInfo.TYPE_BLUETOOTH_A2DP,
                    AudioDeviceInfo.TYPE_BLUETOOTH_SCO,
                    AudioDeviceInfo.TYPE_HEARING_AID -> DeviceType.BLUETOOTH
                    
                    AudioDeviceInfo.TYPE_USB_DEVICE,
                    AudioDeviceInfo.TYPE_USB_HEADSET -> DeviceType.USB_DAC
                    
                    AudioDeviceInfo.TYPE_WIRED_HEADSET,
                    AudioDeviceInfo.TYPE_WIRED_HEADPHONES -> DeviceType.WIRED_HEADSET
                    
                    AudioDeviceInfo.TYPE_HDMI,
                    AudioDeviceInfo.TYPE_HDMI_ARC,
                    AudioDeviceInfo.TYPE_HDMI_EARC -> DeviceType.HDMI
                    
                    else -> DeviceType.SPEAKER
                }

                val name = dev.productName.toString().ifBlank {
                    when (type) {
                        DeviceType.BLUETOOTH -> "Bluetooth Audio Device"
                        DeviceType.USB_DAC -> "USB-C Audio DAC"
                        DeviceType.WIRED_HEADSET -> "Wired 3.5mm Headset"
                        DeviceType.HDMI -> "HDMI / External Display"
                        DeviceType.SPEAKER -> "Phone Built-in Speaker"
                    }
                }

                detected.add(
                    AudioDeviceModel(
                        id = dev.id.toString(),
                        name = name,
                        type = type,
                        isAvailable = true,
                        nativeDeviceInfo = dev
                    )
                )
            }
        } else {
            // Legacy Android Fallback (API 23)
            val isWiredOn = audioManager.isWiredHeadsetOn
            val isBtOn = audioManager.isBluetoothA2dpOn

            if (isBtOn) {
                detected.add(AudioDeviceModel("bt_legacy", "Bluetooth Audio", DeviceType.BLUETOOTH, true))
            }
            if (isWiredOn) {
                detected.add(AudioDeviceModel("wired_legacy", "Wired Headset", DeviceType.WIRED_HEADSET, true))
            }
            detected.add(AudioDeviceModel("speaker_legacy", "Phone Speaker", DeviceType.SPEAKER, true))
        }

        _availableDevices.value = detected

        if (_currentPolicy.value == RoutingPolicy.AUTO_ANDROID) {
            _activeDevice.value = computeAutoDevice(detected)
        }
    }

    private fun computeAutoDevice(devices: List<AudioDeviceModel>): AudioDeviceModel? {
        return devices.firstOrNull { it.type == DeviceType.BLUETOOTH }
            ?: devices.firstOrNull { it.type == DeviceType.USB_DAC }
            ?: devices.firstOrNull { it.type == DeviceType.WIRED_HEADSET }
            ?: devices.firstOrNull { it.type == DeviceType.HDMI }
            ?: devices.firstOrNull { it.type == DeviceType.SPEAKER }
            ?: devices.firstOrNull()
    }

    fun setPolicy(policy: RoutingPolicy) {
        _currentPolicy.value = policy
        if (policy == RoutingPolicy.AUTO_ANDROID) {
            _activeDevice.value = computeAutoDevice(_availableDevices.value)
        }
    }

    fun selectManualDevice(device: AudioDeviceModel) {
        _currentPolicy.value = RoutingPolicy.MANUAL
        _activeDevice.value = device
    }

    fun release() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && audioDeviceCallback != null) {
            audioManager.unregisterAudioDeviceCallback(audioDeviceCallback)
        }
    }
}
