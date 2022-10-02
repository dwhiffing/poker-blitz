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

    this.load.audio('deal', 'assets/deal.mp3')
    this.load.audio('cpu-swap', 'assets/cpu-swap.mp3')
    this.load.audio('cpu-look', 'assets/cpu-look.mp3')
    this.load.audio('game-end', 'assets/game-end.mp3')
    this.load.audio('player-swap', 'assets/player-swap.mp3')
    this.load.audio('shuffle', 'assets/shuffle.mp3')
    this.load.audio('tick', 'assets/tick.mp3')
    this.load.audio('scatter', 'assets/scatter.mp3')
    this.load.image('logo', 'assets/phaser3-logo.png')
    this.load.spritesheet('icons', 'assets/icons.png', {
      frameHeight: 50,
      frameWidth: 49,
    })
    this.load.spritesheet('cards', 'assets/cards.png', {
      frameHeight: 336,
      frameWidth: 240,
    })

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
