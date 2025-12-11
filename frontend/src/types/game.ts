import type { Letter } from '@/src/services/AudioService'

export type GridPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface IStimulus {
  position: GridPosition
  letter: Letter
}

export type ResponseType = 'position' | 'audio' | 'both' | 'none'

export interface ITrialResult {
  positionCorrect: boolean
  audioCorrect: boolean
  trialCorrect: boolean
  positionFalseAlarm: boolean
  audioFalseAlarm: boolean
  positionMiss: boolean
  audioMiss: boolean
  shardsEarned: number
  stabilityChange: number
}

export interface ITrial {
  trialNumber: number
  stimulus: IStimulus
  response: ResponseType
  hasPositionMatch: boolean
  hasAudioMatch: boolean
  result: ITrialResult
  reactionTime: number | null
  timestamp: string
}

export interface IBlock {
  blockNumber: number
  nLevel: number
  trials: ITrial[]
  accuracy: number
  shardsEarned: number
  finalStability: number
  hitSafeMode: boolean
  duration: number
}

export interface ISession {
  sessionId: string
  userId: string
  blocks: IBlock[]
  startingNLevel: number
  peakNLevel: number
  totalShards: number
  averageAccuracy: number
  startedAt: string
  endedAt: string | null
  duration: number
}

export type GamePhase =
  | 'idle'
  | 'ready'
  | 'playing'
  | 'waiting'
  | 'blockEnd'
  | 'sessionEnd'

export interface IGameState {
  phase: GamePhase
  currentSession: ISession | null
  currentBlock: IBlock | null
  currentTrial: number
  currentStability: number
  currentShards: number
  inSafeMode: boolean
  currentNLevel: number
  stimulusSequence: IStimulus[]
  trialStartTime: number | null
  responseGiven: boolean
}

export interface IUserStats {
  totalShards: number
  dailyStreak: number
  peakNLevel: number
}
