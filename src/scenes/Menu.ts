import Phaser from 'phaser'

export default class Menu extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    this.add.bitmapText(w / 2, h / 2, 'gem', 'Poker Blitz', 64).setOrigin(0.5)
    this.add
      .bitmapText(w / 2, h - 100, 'gem', 'Start')
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'))
    // this.scene.start('GameScene')
  }
}
