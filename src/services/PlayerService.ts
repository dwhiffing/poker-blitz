import { chunk } from 'lodash'
import shuffle from 'lodash/shuffle'
import { ICard } from '../types'
import { getHandStrengths } from '../utils'

export default class PlayerService {
  cards: ICard[]
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

  addCards(cards: ICard[]) {
    this.cards.push(...cards)
  }

  getHands() {
    return chunk(this.cards, 5)
  }

  evaluateHands() {
    const hands = getHandStrengths(this.getHands())
    this.handLabels.forEach((label, i) => (label.text = hands[i]))
    return this.getHands()
  }
}
