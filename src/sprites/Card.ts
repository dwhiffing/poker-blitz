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
    super(scene, x, y, 'cards', 52)
    this.suit = suit
    this.value = value
    this.setInteractive()
    this.setDisplaySize(120, 168)
  }

  create() {}

  toggle(state: boolean = this.frame.name === '52') {
    if (state) {
      this.setFrame(this.value + this.suit * 13)
    } else {
      this.setFrame(52)
    }
  }

  move(x: number, y: number, angle: number = 0) {
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      angle,
      ease: Phaser.Math.Easing.Quadratic.Out,
      duration: ANIM_TIME * 3,
    })
  }
}
