import shuffle from 'lodash/shuffle'
import { ICard } from '../types'

export default class PlayerService {
  cards: ICard[]
  scene: Phaser.Scene
  label: Phaser.GameObjects.BitmapText
  name: string
  x: number
  y: number
  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    this.scene = scene
    this.cards = []
    this.label = this.scene.add.bitmapText(x, y + 50, 'gem', name, 16)
    this.x = x
    this.name = name
    this.y = y
  }

  addCards(cards: ICard[]) {
    this.cards.push(...cards)
  }
}
