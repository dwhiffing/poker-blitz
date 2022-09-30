import Phaser from 'phaser'
import config from './config'
import BootScene from './scenes/Boot'
import GameScene from './scenes/Game'
import MenuScene from './scenes/Menu'

new Phaser.Game(
  Object.assign(config, {
    scene: [BootScene, MenuScene, GameScene],
  }),
)
