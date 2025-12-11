import { create } from 'zustand'
import { AudioService } from '@/src/services/AudioService'
import type { Volume } from '@/src/services/AudioService'

export interface IAudioState {
  volume: Volume
  isMuted: boolean
  isPreloaded: boolean
}

export interface IAudioActions {
  setVolume: (volume: Volume) => Promise<void>
  toggleMute: () => Promise<void>
  initializeAudio: () => Promise<void>
}

export type AudioStore = IAudioState & IAudioActions

export const useAudioStore = create<AudioStore>((set, get) => ({
  volume: 1,
  isMuted: false,
  isPreloaded: false,
  setVolume: async (volume: Volume) => {
    await AudioService.setVolume(volume)
    set({ volume, isMuted: volume === 0 })
  },
  toggleMute: async () => {
    const { isMuted, volume } = get()
    const nextVolume = isMuted ? (volume === 0 ? 1 : volume) : 0
    await AudioService.setVolume(nextVolume)
    set({ isMuted: !isMuted, volume: nextVolume })
  },
  initializeAudio: async () => {
    const currentVolume = AudioService.getVolume()
    set({
      volume: currentVolume,
      isMuted: currentVolume === 0,
      isPreloaded: AudioService.isPreloaded(),
    })
  },
}))
