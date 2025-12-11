import type { IStimulus, GridPosition } from '@/src/types/game'
import type { Letter } from '@/src/services/AudioService'

const LETTERS: readonly Letter[] = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T']
const GRID_POSITIONS: readonly GridPosition[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const TRIALS_PER_BLOCK = 20
const MATCH_PROBABILITY = 0.25

export interface IStimulusGeneratorError {
  code: 'INVALID_N_LEVEL' | 'GENERATION_FAILED'
  message: string
}

export const StimulusGenerator = {
  generateBlock: (nLevel: number, blockNumber: number): IStimulus[] => {
    if (nLevel < 1 || nLevel > 5) {
      throw {
        code: 'INVALID_N_LEVEL',
        message: `N-level must be between 1 and 5, got ${nLevel}`,
      } as IStimulusGeneratorError
    }

    void blockNumber

    const sequence: IStimulus[] = []

    for (let i = 0; i < nLevel; i += 1) {
      sequence.push({
        position: randomChoice(GRID_POSITIONS),
        letter: randomChoice(LETTERS),
      })
    }

    for (let i = nLevel; i < TRIALS_PER_BLOCK; i += 1) {
      const shouldMatchPosition = Math.random() < MATCH_PROBABILITY
      const shouldMatchAudio = Math.random() < MATCH_PROBABILITY

      const previousStimulus = sequence[i - nLevel]

      sequence.push({
        position: shouldMatchPosition
          ? previousStimulus.position
          : randomChoiceExcept(GRID_POSITIONS, previousStimulus.position),
        letter: shouldMatchAudio
          ? previousStimulus.letter
          : randomChoiceExcept(LETTERS, previousStimulus.letter),
      })
    }

    return sequence
  },

  hasPositionMatch: (sequence: IStimulus[], trialIndex: number, nLevel: number): boolean => {
    if (trialIndex < nLevel) return false
    return sequence[trialIndex].position === sequence[trialIndex - nLevel].position
  },

  hasAudioMatch: (sequence: IStimulus[], trialIndex: number, nLevel: number): boolean => {
    if (trialIndex < nLevel) return false
    return sequence[trialIndex].letter === sequence[trialIndex - nLevel].letter
  },
}

const randomChoice = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const randomChoiceExcept = <T>(array: readonly T[], except: T): T => {
  const filtered = array.filter((item) => item !== except)
  return randomChoice(filtered)
}
