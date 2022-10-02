import Phaser from 'phaser'
import { ANIM_TIME, SUITS } from '../constants'

export default class Card extends Phaser.GameObjects.Sprite {
  suit: number
  value: number
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    value: number,
    suit: number,
  ) {
    super(scene, x, y, 'cards', 'bgblue.png')
    this.suit = suit
    this.value = value
    this.setInteractive()
  }

  create() {}

  toggle(state: boolean = this.frame.name === 'bgblue.png') {
    if (state) {
      this.setFrame(`${this.value + 1}${SUITS[this.suit]}.png`)
    } else {
      this.setFrame(`bgblue.png`)
    }
  }

  move(x: number, y: number) {
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      duration: ANIM_TIME * 2,
    })
  }
}
