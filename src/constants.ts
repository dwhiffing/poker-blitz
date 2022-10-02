export const SUITS = ['c', 'h', 's', 'd']
export const ANIM_TIME = 150
export const ROUND_DURATION = 10
export const ROUND_DELAY = 1000
export const AI_CONFIG: Record<string, AIConfig> = {
  EASY: {
    startWait: 3,
    endWait: 1,
    cardSlice: 5,
  },
  MEDIUM: {
    startWait: 5,
    endWait: 10,
    cardSlice: 10,
  },
  HARD: {
    startWait: 8,
    endWait: 20,
    cardSlice: 19,
  },
}
export interface AIConfig {
  startWait: number
  endWait: number
  cardSlice: number
}

export const CARD_WIDTH = 120
export const CARD_HEIGHT = 168
export const PLAYER_BUFFER = 70
