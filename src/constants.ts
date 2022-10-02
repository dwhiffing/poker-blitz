export const SUITS = ['c', 'h', 's', 'd']
export const ANIM_TIME = 150
export const ROUND_DURATION = 10
export const ROUND_DELAY = 1000
export const AI_CONFIG: Record<string, AIConfig> = {
  EASY: {
    startWait: 4,
    endWait: 2,
    cardSlice: 5,
  },
  MEDIUM: {
    startWait: 6,
    endWait: 5,
    cardSlice: 10,
  },
  HARD: {
    startWait: 6,
    endWait: 10,
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
export const FONT_NAME = 'Arial'
