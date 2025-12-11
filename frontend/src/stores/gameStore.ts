import { create } from 'zustand'
import { AudioService } from '@/src/services/AudioService'
import { StimulusGenerator } from '@/src/services/StimulusGenerator'
import type {
  IGameState,
  ISession,
  IBlock,
  ITrial,
  ITrialResult,
  ResponseType,
} from '@/src/types/game'

const STARTING_N_LEVEL = 2
const STARTING_STABILITY = 100
const TRIALS_PER_BLOCK = 20
const TRIAL_DURATION_MS = 2500
const FIXATION_DURATION_MS = 500

export interface IGameActions {
  startSession: (userId: string) => void
  startBlock: () => void
  handleResponse: (response: ResponseType) => void
  nextTrial: () => void
  endBlock: () => void
  continueToNextBlock: () => void
  quitSession: () => void
  reset: () => void
}

export type GameStore = IGameState & IGameActions

const DEFAULT_GAME_STATE: IGameState = {
  phase: 'idle',
  currentSession: null,
  currentBlock: null,
  currentTrial: 0,
  currentStability: STARTING_STABILITY,
  currentShards: 0,
  inSafeMode: false,
  currentNLevel: STARTING_N_LEVEL,
  stimulusSequence: [],
  trialStartTime: null,
  responseGiven: false,
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...DEFAULT_GAME_STATE,

  startSession: (userId: string) => {
    const session: ISession = {
      sessionId: `session_${Date.now()}`,
      userId,
      blocks: [],
      startingNLevel: STARTING_N_LEVEL,
      peakNLevel: STARTING_N_LEVEL,
      totalShards: 0,
      averageAccuracy: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
      duration: 0,
    }

    set({
      currentSession: session,
      currentNLevel: STARTING_N_LEVEL,
      phase: 'ready',
    })

    get().startBlock()
  },

  startBlock: () => {
    const { currentSession, currentNLevel } = get()
    if (!currentSession) return

    const blockNumber = currentSession.blocks.length + 1
    const sequence = StimulusGenerator.generateBlock(currentNLevel, blockNumber)

    const block: IBlock = {
      blockNumber,
      nLevel: currentNLevel,
      trials: [],
      accuracy: 0,
      shardsEarned: 0,
      finalStability: STARTING_STABILITY,
      hitSafeMode: false,
      duration: 0,
    }

    set({
      currentBlock: block,
      stimulusSequence: sequence,
      currentTrial: 0,
      currentStability: STARTING_STABILITY,
      currentShards: 0,
      inSafeMode: false,
      phase: 'ready',
    })

    setTimeout(() => {
      get().nextTrial()
    }, 1000)
  },

  nextTrial: async () => {
    const { currentTrial, stimulusSequence, phase } = get()

    if (phase === 'blockEnd' || phase === 'sessionEnd') {
      return
    }

    if (currentTrial >= TRIALS_PER_BLOCK) {
      get().endBlock()
      return
    }

    const trialIndex = currentTrial
    const stimulus = stimulusSequence[trialIndex]

    await AudioService.playLetter(stimulus.letter)

    set({
      currentTrial: currentTrial + 1,
      trialStartTime: Date.now(),
      responseGiven: false,
      phase: 'playing',
    })

    setTimeout(() => {
      const state = get()
      if (!state.responseGiven && state.phase === 'playing') {
        get().handleResponse('none')
      }
    }, TRIAL_DURATION_MS)
  },

  handleResponse: (response: ResponseType) => {
    const {
      currentTrial,
      currentBlock,
      stimulusSequence,
      currentNLevel,
      trialStartTime,
      currentStability,
      currentShards,
      inSafeMode,
      responseGiven,
    } = get()

    if (responseGiven || !currentBlock) return

    const trialIndex = currentTrial - 1
    const stimulus = stimulusSequence[trialIndex]

    const hasPositionMatch = StimulusGenerator.hasPositionMatch(stimulusSequence, trialIndex, currentNLevel)
    const hasAudioMatch = StimulusGenerator.hasAudioMatch(stimulusSequence, trialIndex, currentNLevel)

    const userPressedPosition = response === 'position' || response === 'both'
    const userPressedAudio = response === 'audio' || response === 'both'

    const positionCorrect = userPressedPosition === hasPositionMatch
    const audioCorrect = userPressedAudio === hasAudioMatch
    const trialCorrect = positionCorrect && audioCorrect

    const positionFalseAlarm = userPressedPosition && !hasPositionMatch
    const audioFalseAlarm = userPressedAudio && !hasAudioMatch
    const positionMiss = !userPressedPosition && hasPositionMatch
    const audioMiss = !userPressedAudio && hasAudioMatch

    let stabilityChange = 0
    if (positionFalseAlarm || audioFalseAlarm) {
      stabilityChange = -15
    } else if (positionMiss || audioMiss) {
      stabilityChange = -10
    }

    const newStability = Math.max(0, currentStability + stabilityChange)
    const nowInSafeMode = newStability === 0

    const shardsEarned = trialCorrect && !inSafeMode && !nowInSafeMode ? 1 : 0

    const result: ITrialResult = {
      positionCorrect,
      audioCorrect,
      trialCorrect,
      positionFalseAlarm,
      audioFalseAlarm,
      positionMiss,
      audioMiss,
      shardsEarned,
      stabilityChange,
    }

    const reactionTime = trialStartTime ? Date.now() - trialStartTime : null

    const trial: ITrial = {
      trialNumber: currentTrial,
      stimulus,
      response,
      hasPositionMatch,
      hasAudioMatch,
      result,
      reactionTime,
      timestamp: new Date().toISOString(),
    }

    currentBlock.trials.push(trial)

    set({
      currentBlock,
      currentStability: newStability,
      currentShards: currentShards + shardsEarned,
      inSafeMode: nowInSafeMode || inSafeMode,
      responseGiven: true,
      phase: 'waiting',
    })

    setTimeout(() => {
      get().nextTrial()
    }, FIXATION_DURATION_MS)
  },

  endBlock: () => {
    const { currentBlock, currentSession, currentStability, currentShards, inSafeMode } = get()
    if (!currentBlock || !currentSession) return

    const totalTrials = currentBlock.trials.length
    const correctTrials = currentBlock.trials.filter((t) => t.result.trialCorrect).length
    const accuracy = totalTrials > 0 ? (correctTrials / totalTrials) * 100 : 0

    currentBlock.accuracy = accuracy
    currentBlock.shardsEarned = currentShards
    currentBlock.finalStability = currentStability
    currentBlock.hitSafeMode = inSafeMode

    currentSession.blocks.push(currentBlock)
    currentSession.totalShards += currentShards

    let nextNLevel = currentBlock.nLevel
    if (accuracy >= 80) {
      nextNLevel = Math.min(5, currentBlock.nLevel + 1)
    } else if (accuracy <= 60) {
      nextNLevel = Math.max(1, currentBlock.nLevel - 1)
    }

    currentSession.peakNLevel = Math.max(currentSession.peakNLevel, nextNLevel)

    set({
      currentSession,
      currentNLevel: nextNLevel,
      phase: 'blockEnd',
    })
  },

  continueToNextBlock: () => {
    get().startBlock()
  },

  quitSession: () => {
    const { currentSession } = get()
    if (!currentSession) return

    currentSession.endedAt = new Date().toISOString()
    const startTime = new Date(currentSession.startedAt).getTime()
    const endTime = new Date(currentSession.endedAt).getTime()
    currentSession.duration = endTime - startTime

    const totalAccuracy = currentSession.blocks.reduce((sum, block) => sum + block.accuracy, 0)
    currentSession.averageAccuracy =
      currentSession.blocks.length > 0 ? totalAccuracy / currentSession.blocks.length : 0

    set({
      phase: 'sessionEnd',
      currentSession,
    })
  },

  reset: () => {
    set(DEFAULT_GAME_STATE)
  },
}))
