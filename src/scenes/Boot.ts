import Phaser from 'phaser'

export default class Boot extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    const progress = this.add.graphics()
    const { width, height } = this.sys.game.config

    this.load.on('progress', (value: number) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(0, +height / 2, +width * value, 60)
    })

    this.load.bitmapFont('gem', 'assets/gem.png', 'assets/gem.xml')
    this.load.image('logo', 'assets/phaser3-logo.png')
    this.load.atlas('cards', 'assets/cards.png', 'assets/cards.json')

    this.load.on('complete', () => {
      progress.destroy()
      this.scene.start('MenuScene')
    })
  }

  create() {
    const logo = this.add.image(400, 70, 'logo')

    this.tweens.add({
      targets: logo,
      y: 350,
      duration: 1500,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }
}
