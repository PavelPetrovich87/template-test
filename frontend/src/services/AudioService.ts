import { Audio } from 'expo-av'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Letter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

export class AudioServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'LOAD_FAILED' | 'PLAY_FAILED' | 'PRELOAD_FAILED',
    public readonly letter?: Letter
  ) {
    super(message)
    this.name = 'AudioServiceError'
  }
}

export interface IPreloadResult {
  loaded: Letter[]
  failed: Letter[]
}

interface IAudioServiceState {
  isPreloaded: boolean
  volume: number
  currentSound: Audio.Sound | null
  sounds: Map<Letter, Audio.Sound>
}

export type Volume = number

const VOLUME_STORAGE_KEY = '@neural_breach:audio_volume'
const DEFAULT_VOLUME = 1
const MAX_RETRY_ATTEMPTS = 2

export const AudioService = (() => {
  const state: IAudioServiceState = {
    isPreloaded: false,
    volume: DEFAULT_VOLUME,
    currentSound: null,
    sounds: new Map<Letter, Audio.Sound>(),
  }

  const initializeAudioMode = async (): Promise<void> => {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    })
  }

  const loadVolumeFromStorage = async (): Promise<number> => {
    try {
      const storedVolume = await AsyncStorage.getItem(VOLUME_STORAGE_KEY)
      if (storedVolume !== null) {
        const parsed = Number.parseFloat(storedVolume)
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          return parsed
        }
      }
    } catch (error) {
      console.warn('Failed to load stored volume', error)
    }

    return DEFAULT_VOLUME
  }

  const saveVolumeToStorage = async (volume: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(VOLUME_STORAGE_KEY, volume.toString())
    } catch (error) {
      console.warn('Failed to save volume preference', error)
    }
  }

  const getLetterSoundPath = (letter: Letter): number => {
    const soundMap: Record<Letter, number> = {
      A: require('../../assets/sounds/A.mp3'),
      B: require('../../assets/sounds/B.mp3'),
      C: require('../../assets/sounds/C.mp3'),
      D: require('../../assets/sounds/D.mp3'),
      E: require('../../assets/sounds/E.mp3'),
      F: require('../../assets/sounds/F.mp3'),
      G: require('../../assets/sounds/G.mp3'),
      H: require('../../assets/sounds/H.mp3'),
      I: require('../../assets/sounds/I.mp3'),
      J: require('../../assets/sounds/J.mp3'),
      K: require('../../assets/sounds/K.mp3'),
      L: require('../../assets/sounds/L.mp3'),
      M: require('../../assets/sounds/M.mp3'),
      N: require('../../assets/sounds/N.mp3'),
      O: require('../../assets/sounds/O.mp3'),
      P: require('../../assets/sounds/P.mp3'),
      Q: require('../../assets/sounds/Q.mp3'),
      R: require('../../assets/sounds/R.mp3'),
      S: require('../../assets/sounds/S.mp3'),
      T: require('../../assets/sounds/T.mp3'),
      U: require('../../assets/sounds/U.mp3'),
      V: require('../../assets/sounds/V.mp3'),
      W: require('../../assets/sounds/W.mp3'),
      X: require('../../assets/sounds/X.mp3'),
      Y: require('../../assets/sounds/Y.mp3'),
      Z: require('../../assets/sounds/Z.mp3'),
    }
    return soundMap[letter]
  }

  const preloadSounds = async (): Promise<IPreloadResult> => {
    if (state.isPreloaded) {
      return {
        loaded: Array.from(state.sounds.keys()),
        failed: [],
      }
    }

    await initializeAudioMode()

    const storedVolume = await loadVolumeFromStorage()
    state.volume = storedVolume

    const letters: Letter[] = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ]

    const results = await Promise.allSettled(
      letters.map(async (letter) => {
        try {
          const sound = new Audio.Sound()
          await sound.loadAsync(getLetterSoundPath(letter), {
            shouldPlay: false,
            volume: state.volume,
          })
          state.sounds.set(letter, sound)
          return { letter, success: true }
        } catch (error) {
          console.error(`Failed to load sound for letter ${letter}`, error)
          return { letter, success: false }
        }
      })
    )

    const loaded: Letter[] = []
    const failed: Letter[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        loaded.push(letters[index])
      } else {
        failed.push(letters[index])
      }
    })

    if (loaded.length === 0) {
      throw new AudioServiceError('Failed to preload any letter sounds', 'PRELOAD_FAILED')
    }

    state.isPreloaded = true
    return { loaded, failed }
  }

  const playLetter = async (letter: Letter, retryCount?: number): Promise<void> => {
    const attemptCount = typeof retryCount === 'number' ? retryCount : 0

    if (!state.isPreloaded) {
      throw new AudioServiceError('Sounds not preloaded. Call preloadSounds() first.', 'PLAY_FAILED', letter)
    }

    const sound = state.sounds.get(letter)

    if (!sound) {
      if (attemptCount < MAX_RETRY_ATTEMPTS) {
        try {
          const newSound = new Audio.Sound()
          await newSound.loadAsync(getLetterSoundPath(letter), {
            shouldPlay: false,
            volume: state.volume,
          })
          state.sounds.set(letter, newSound)
          return playLetter(letter, attemptCount + 1)
        } catch (error) {
          console.error(`Load retry ${attemptCount + 1} for letter ${letter}`, error)
          return playLetter(letter, attemptCount + 1)
        }
      }

      throw new AudioServiceError(
        `Sound for letter ${letter} not available after ${MAX_RETRY_ATTEMPTS} retries`,
        'PLAY_FAILED',
        letter
      )
    }

    try {
      if (state.currentSound) {
        await state.currentSound.stopAsync()
        await state.currentSound.setPositionAsync(0)
      }

      await sound.replayAsync()
      state.currentSound = sound
    } catch (error) {
      if (attemptCount < MAX_RETRY_ATTEMPTS) {
        console.warn(`Retry ${attemptCount + 1}/${MAX_RETRY_ATTEMPTS} for letter ${letter}`)
        return playLetter(letter, attemptCount + 1)
      }

      throw new AudioServiceError(
        `Failed to play sound for letter ${letter} after ${MAX_RETRY_ATTEMPTS} attempts`,
        'PLAY_FAILED',
        letter
      )
    }
  }

  const setVolume = async (volume: Volume): Promise<void> => {
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0.0 and 1.0')
    }

    state.volume = volume
    await saveVolumeToStorage(volume)

    const updatePromises = Array.from(state.sounds.values()).map((sound) =>
      sound.setVolumeAsync(volume).catch((error) => {
        console.warn('Failed to update volume for sound', error)
      })
    )

    await Promise.all(updatePromises)
  }

  const getVolume = (): Volume => {
    return state.volume
  }

  const isPreloaded = (): boolean => {
    return state.isPreloaded
  }

  const unloadSounds = async (): Promise<void> => {
    const unloadPromises = Array.from(state.sounds.values()).map((sound) =>
      sound.unloadAsync().catch((error) => {
        console.warn('Failed to unload sound', error)
      })
    )

    await Promise.all(unloadPromises)
    state.sounds.clear()
    state.isPreloaded = false
    state.currentSound = null
  }

  return {
    preloadSounds,
    playLetter,
    setVolume,
    getVolume,
    isPreloaded,
    unloadSounds,
  }
})()
