import Phaser from 'phaser'

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#218514',
  scale: {
    width: 1500,
    height: 1500,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}
