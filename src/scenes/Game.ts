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
    this.time.delayedCall(ANIM_TIME * 10, () => {
      deck.scatter()
    })

    this.time.delayedCall(ANIM_TIME * 60, () => {
      const timerText = this.add.bitmapText(300, 50, 'gem', '')
      let time = 10
      timerText.text = time.toString()
      this.time.addEvent({
        repeat: 10,
        delay: 1000,
        callback: () => {
          time--
          if (time > -1) {
            timerText.text = time.toString()
          } else {
            // score player hands, shuffle deck, deal 5 more cards to players
          }
        },
      })
    })
  }
}
