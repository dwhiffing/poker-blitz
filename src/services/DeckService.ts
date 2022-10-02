import shuffle from 'lodash/shuffle'
import { ANIM_TIME, CARD_WIDTH, CARD_HEIGHT, PLAYER_BUFFER } from '../constants'
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
        PLAYER_BUFFER + CARD_HEIGHT / 2,
        i % 13,
        Math.floor(i / 13),
      )
      this.scene.add.existing(card)
      return card
    })
    this.cards = shuffle(this.cards)
  }

  deal(count: number, target: PlayerService, index: number) {
    return new Promise<void>((resolve) => {
      for (let i = 0; i < count; i++) {
        if (this.cards.length > 0) {
          const card = this.cards.shift()!
          target.addCards([card])
          this.scene.time.delayedCall(i * ANIM_TIME, () => {
            card.toggle(target.name === 'Player')
            const x =
              target.x +
              (target.name === 'Player' ? CARD_WIDTH / 2 : CARD_WIDTH * -1.5) +
              i * (CARD_WIDTH / 4)
            const y =
              target.y +
              CARD_HEIGHT * 0.75 +
              index * (CARD_HEIGHT + PLAYER_BUFFER)
            card.move(x, y)
            this.scene.time.delayedCall(ANIM_TIME * 2, () =>
              this.scene.sound.play('deal'),
            )
            card.setDepth(i)
          })
        }
      }
      this.scene.time.delayedCall(count * ANIM_TIME, resolve)
    })
  }

  shuffle() {
    const w = this.scene.cameras.main.width
    this.cards = shuffle(this.cards)
    return new Promise<void>((resolve) => {
      for (let i = 0; i < this.cards.length; i++) {
        const card = this.cards[i]
        this.scene.time.delayedCall(i * (ANIM_TIME / 20), () => {
          if (i % 25 === 0)
            this.scene.time.delayedCall(Math.floor(i / 20) * 200, () =>
              this.scene.sound.play('shuffle'),
            )
          card.move(w / 2, PLAYER_BUFFER + CARD_HEIGHT / 2, 0)
          card.setDepth(i)
          card.toggle(false)
        })
      }
      this.scene.time.delayedCall(this.cards.length * (ANIM_TIME / 15), resolve)
    })
  }

  scatter(round: number) {
    const w = this.scene.cameras.main.width
    const h = this.scene.cameras.main.height
    const rnd = (n: number, n2: number) => Phaser.Math.RND.integerInRange(n, n2)
    return new Promise<void>((resolve) => {
      for (let i = 0; i < this.cards.length; i++) {
        const card = this.cards[i]
        this.scene.time.delayedCall(i * (ANIM_TIME / 4), () => {
          let baseW = 350 + round * 50
          let baseH = 350 + round * 50
          if (i % 3 === 0) this.scene.sound.play('player-swap')
          card.move(rnd(baseW, w - baseW), rnd(baseH, h - baseH), rnd(1, 350))
          card.setDepth(i)
          card.toggle(true)
        })
      }
      this.scene.time.delayedCall(this.cards.length * (ANIM_TIME / 2), resolve)
    })
  }
}
