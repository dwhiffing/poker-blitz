import Phaser from 'phaser'
import { ANIM_TIME } from '../constants'
import DeckService from '../services/DeckService'
import PlayerService from '../services/PlayerService'

export default class Game extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  create() {
    const deck = new DeckService(this)
    const player = new PlayerService(this, 200, 50, 'player')
    const ai = new PlayerService(this, 400, 50, 'bob')
    deck.deal(5, player)
    this.time.delayedCall(ANIM_TIME * 5, () => {
      deck.deal(5, ai)
    })
  }
}

const SUITS = ['c', 's', 'h', 'd']
