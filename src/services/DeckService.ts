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
      const card = new Card(
        this.scene,
        this.scene.cameras.main.width / 2,
        50,
        i % 13,
        Math.floor(i / 13),
      )
      // card.setFrame(`${card.value + 1}${SUITS[card.suit]}.png`)
      this.scene.add.existing(card)
      return card
    })
    this.cards = shuffle(this.cards)
  }

  deal(count: number, target: PlayerService) {
    return new Promise<void>((resolve) => {
      for (let i = 0; i < count; i++) {
        if (this.cards.length > 0) {
          const card = this.cards.shift()!
          target.addCards([card])
          this.scene.time.delayedCall(i * ANIM_TIME, () => {
            card.move(target.x + i * 15, target.y + 20)
            card.setDepth(i)
            card.toggle()
          })
        }
      }
      this.scene.time.delayedCall(count * ANIM_TIME, resolve)
    })
  }

  scatter() {
    const w = this.scene.cameras.main.width
    const h = this.scene.cameras.main.height
    const rnd = (n: number, n2: number) => Phaser.Math.RND.integerInRange(n, n2)
    return new Promise<void>((resolve) => {
      for (let i = 0; i < this.cards.length; i++) {
        const card = this.cards[i]
        this.scene.time.delayedCall(i * 50, () => {
          card.move(rnd(250, w - 250), rnd(200, h - 150))
          card.setAngle(rnd(1, 350))
          card.setDepth(i)
          card.toggle()
        })
      }
      this.scene.time.delayedCall(this.cards.length * 50, resolve)
    })
  }
}
