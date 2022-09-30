import shuffle from 'lodash/shuffle'
import { ANIM_TIME, SUITS } from '../constants'
import Card from '../sprites/Card'
import PlayerService from './PlayerService'

export default class DeckService {
  cards: Card[]
  scene: Phaser.Scene
  constructor(scene: Phaser.Scene) {
    this.scene = scene

    this.cards = new Array(52).fill(0).map((_: any, i: number) => {
      const card = new Card(this.scene, 50, 50, i % 13, Math.floor(i / 13))
      // card.setFrame(`${card.value + 1}${SUITS[card.suit]}.png`)
      this.scene.add.existing(card)
      return card
    })
    this.cards = shuffle(this.cards)
  }

  deal(count: number, target: PlayerService) {
    for (let i = 0; i < count; i++) {
      if (this.cards.length > 0) {
        const card = this.cards.shift()!
        target.addCards([card])
        this.scene.time.delayedCall(i * ANIM_TIME, () => {
          card.move(target.x + i * 15, target.y)
          card.setDepth(i)
        })
      }
    }
  }
}
