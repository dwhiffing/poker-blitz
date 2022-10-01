import { chunk } from 'lodash'
import Card from '../sprites/Card'
import { getHandDescriptions, handToString, judgeWinner } from '../utils'

export default class PlayerService {
  cards: Card[]
  scene: Phaser.Scene
  label: Phaser.GameObjects.BitmapText
  handLabels: Phaser.GameObjects.BitmapText[]
  name: string
  x: number
  y: number

  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    this.scene = scene
    this.cards = []
    const winCount =
      this.scene.registry.get(name === 'player' ? 'player-wins' : 'ai-wins') ||
      0
    const labelText = `${name} (${winCount} wins)`
    this.label = this.scene.add
      .bitmapText(x + 40, y - 35, 'gem', labelText, 16)
      .setOrigin(0.5)
    const isRight = x > this.scene.cameras.main.width / 2
    this.handLabels = new Array(5).fill('').map((_, i) => {
      const _x = x - (isRight ? 40 : -120)
      const _y = y + 15 + i * 100
      const _o = isRight ? 1 : 0
      return this.scene.add.bitmapText(_x, _y, 'gem', '', 16).setOrigin(_o, 0.5)
    })
    this.x = x
    this.name = name
    this.y = y
  }

  addCards(cards: Card[]) {
    this.cards.push(...cards)
  }

  getHands() {
    return chunk(this.cards, 5)
  }

  evaluateHands() {
    const hands = this.getHands().sort((a, b) =>
      judgeWinner([handToString(a), handToString(b)]) === 0 ? -1 : 1,
    )

    setTimeout(() => {
      hands.forEach((hand, i) => {
        hand.forEach((card) => card.move(card.x, this.y + 20 + i * 100))
      })
    }, 10)

    const descriptions = getHandDescriptions(hands)
    this.handLabels.forEach((label, i) => {
      label.text = descriptions[i]
      label.y = this.y + 20 + i * 100
    })

    return hands
  }
}
