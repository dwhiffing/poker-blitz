import Phaser from 'phaser'

export default class Menu extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    this.scene.start('GameScene')
  }
}
