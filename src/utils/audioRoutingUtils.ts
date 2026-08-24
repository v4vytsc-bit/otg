import { AudioOutputDevice, AudioRoutingPolicy, AudioRoutingState } from '../types';

export const DEFAULT_AUDIO_DEVICES: AudioOutputDevice[] = [
  {
    id: 'speaker_internal',
    name: 'Phone Built-in Stereo Speaker',
    type: 'speaker',
    isAvailable: true,
    sampleRate: '48 kHz • Dual Dynamic',
  },
  {
    id: 'bt_earbuds_tws',
    name: 'Sony WH-1000XM5 / LDAC TWS (Bluetooth)',
    type: 'bluetooth',
    isAvailable: true,
    isBluetooth: true,
    batteryPercent: 85,
    sampleRate: '96 kHz / 24-bit Hi-Res LDAC',
  },
  {
    id: 'usb_c_dac',
    name: 'USB-C Lossless Audio DAC / OTG Dongle',
    type: 'usb_dac',
    isAvailable: false,
    sampleRate: '192 kHz / 32-bit Direct Stream',
  },
  {
    id: 'wired_headset_35',
    name: 'Wired 3.5mm Headphone Jack (CTIA)',
    type: 'wired_headset',
    isAvailable: false,
    sampleRate: '48 kHz Stereo Output',
  },
  {
    id: 'hdmi_cast',
    name: 'HDMI / Google Cast Display Audio',
    type: 'hdmi',
    isAvailable: false,
    sampleRate: 'Dolby Digital Plus 5.1ch',
  },
];

// Android Standard Audio Priority hierarchy:
// 1. Bluetooth A2DP/LE Audio (Highest convenience)
// 2. USB Type-C Audio DAC
// 3. Wired Headset / 3.5mm Aux
// 4. Built-in Internal Speaker (Default fallback)
export function computeAutoAudioDevice(devices: AudioOutputDevice[]): AudioOutputDevice {
  // 1. Check available Bluetooth
  const bt = devices.find((d) => d.isAvailable && d.type === 'bluetooth');
  if (bt) return bt;

  // 2. Check available USB DAC
  const usb = devices.find((d) => d.isAvailable && d.type === 'usb_dac');
  if (usb) return usb;

  // 3. Check available Wired Headset
  const wired = devices.find((d) => d.isAvailable && d.type === 'wired_headset');
  if (wired) return wired;

  // 4. Check HDMI
  const hdmi = devices.find((d) => d.isAvailable && d.type === 'hdmi');
  if (hdmi) return hdmi;

  // 5. Fallback to Speaker
  const speaker = devices.find((d) => d.type === 'speaker');
  return speaker || devices[0] || DEFAULT_AUDIO_DEVICES[0];
}

// Storage helpers
const STORAGE_KEY_POLICY = 'vlc_audio_routing_policy';
const STORAGE_KEY_SELECTED = 'vlc_audio_routing_selected_id';
const STORAGE_KEY_DEVICES = 'vlc_audio_devices_state';

export function loadAudioRoutingConfig(): AudioRoutingState {
  let policy: AudioRoutingPolicy = 'auto_android';
  let devices = DEFAULT_AUDIO_DEVICES;

  if (typeof window !== 'undefined') {
    try {
      const savedPolicy = localStorage.getItem(STORAGE_KEY_POLICY);
      if (savedPolicy === 'manual' || savedPolicy === 'auto_android') {
        policy = savedPolicy;
      }

      const savedDevs = localStorage.getItem(STORAGE_KEY_DEVICES);
      if (savedDevs) {
        devices = JSON.parse(savedDevs);
      }
    } catch (e) {
      console.debug('Error loading audio config', e);
    }
  }

  const autoSelected = computeAutoAudioDevice(devices);
  const activeId = policy === 'auto_android' 
    ? autoSelected.id 
    : (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_SELECTED)) || autoSelected.id;

  return {
    policy,
    activeDeviceId: activeId,
    availableDevices: devices,
    autoSelectedDevice: autoSelected,
  };
}

export function saveAudioRoutingConfig(state: { policy: AudioRoutingPolicy; activeDeviceId: string; availableDevices?: AudioOutputDevice[] }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_POLICY, state.policy);
    localStorage.setItem(STORAGE_KEY_SELECTED, state.activeDeviceId);
    if (state.availableDevices) {
      localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(state.availableDevices));
    }
  } catch (e) {
    console.debug('Error saving audio config', e);
  }
}

// Route audio element sink ID (supported in Chrome, Edge, Android Chrome)
export async function applyAudioSinkToElement(
  mediaElement: HTMLMediaElement | null,
  device: AudioOutputDevice
): Promise<boolean> {
  if (!mediaElement) return false;

  // Check if browser supports setSinkId
  if (typeof (mediaElement as any).setSinkId === 'function') {
    try {
      const sinkId = device.rawSinkId || (device.id === 'speaker_internal' ? 'default' : '');
      if (sinkId) {
        await (mediaElement as any).setSinkId(sinkId);
        return true;
      }
    } catch (err) {
      console.debug('setSinkId failed or not permitted:', err);
    }
  }
  return false;
}

// Fetch real hardware audio output devices if permission is granted
export async function fetchHardwareAudioOutputs(): Promise<AudioOutputDevice[]> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return DEFAULT_AUDIO_DEVICES;
  }

  try {
    const rawDevices = await navigator.mediaDevices.enumerateDevices();
    const audioOutputs = rawDevices.filter((d) => d.kind === 'audiooutput');

    if (audioOutputs.length === 0) {
      return DEFAULT_AUDIO_DEVICES;
    }

    // Merge real devices with our categorized representations
    const merged: AudioOutputDevice[] = audioOutputs.map((d, index) => {
      const label = d.label || `Audio Output ${index + 1}`;
      const isBt = /bluetooth|wireless|airpod|wh-|buds|tws|headset/i.test(label);
      const isUsb = /usb|dac|type-c|dongle/i.test(label);
      const isHeadphone = /headphone|wired|3.5mm/i.test(label);
      const isHdmi = /hdmi|display|tv|cast/i.test(label);

      let type: AudioOutputDevice['type'] = 'speaker';
      if (isBt) type = 'bluetooth';
      else if (isUsb) type = 'usb_dac';
      else if (isHeadphone) type = 'wired_headset';
      else if (isHdmi) type = 'hdmi';

      return {
        id: d.deviceId || `device_${index}`,
        name: label,
        type,
        isAvailable: true,
        isBluetooth: isBt,
        batteryPercent: isBt ? 90 : undefined,
        rawSinkId: d.deviceId,
        sampleRate: isUsb ? '192 kHz / 24-bit' : isBt ? '96 kHz LDAC' : '48 kHz Stereo',
      };
    });

    return merged.length > 0 ? merged : DEFAULT_AUDIO_DEVICES;
  } catch (err) {
    console.debug('Could not enumerate audio devices:', err);
    return DEFAULT_AUDIO_DEVICES;
  }
}
