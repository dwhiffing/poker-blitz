import Phaser from 'phaser'
import { FONT_NAME } from '../constants'

const ROUND_COUNTS = [1, 3, 5]
const DIFFICULTY = ['EASY', 'MEDIUM', 'HARD']

export default class Menu extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    let helpTextIndex = 0
    let isShowingPlayOptions = false
    let roundCountIndex = 0
    let difficultyIndex = 0

    this.registry.set('player-wins', 0)
    this.registry.set('ai-wins', 0)

    // title
    this.add
      .text(w / 2, 200, 'Poker Blitz')
      .setOrigin(0.5)
      .setFontFamily(FONT_NAME)
      .setFontSize(100)

    // play option stuff
    const roundCountHeading = this.add
      .text(w / 2, h / 2 - 160, 'Num Rounds:')
      .setOrigin(0.5)
      .setAlpha(0)
      .setFontFamily(FONT_NAME)
      .setFontSize(60)
      .setInteractive()
    const roundCountButtons = new Array(3).fill('').map((_, i) =>
      this.add
        .text(w / 2 + (i - 1) * 150, h / 2 - 60, ROUND_COUNTS[i].toString())
        .setOrigin(0.5)
        .setFontSize(60)
        .setFontFamily(FONT_NAME)
        .setAlpha(0)
        .setInteractive()
        .on('pointerdown', () => {
          roundCountIndex = i
          roundCountButtons.forEach((b) => b.clearTint())
          roundCountButtons[i].setTint(0xff0000)
        }),
    )
    const difficultyHeading = this.add
      .text(w / 2, h / 2 + 60, 'CPU Level:')
      .setOrigin(0.5)
      .setAlpha(0)
      .setFontFamily(FONT_NAME)
      .setFontSize(60)
      .setInteractive()
    const difficultyButtons = new Array(3).fill('').map((_, i) =>
      this.add
        .text(w / 2 + (i - 1) * 300, h / 2 + 160, DIFFICULTY[i])
        .setOrigin(0.5)
        .setFontFamily(FONT_NAME)
        .setFontSize(60)
        .setAlpha(0)
        .setInteractive()
        .on('pointerdown', () => {
          difficultyIndex = i
          difficultyButtons.forEach((b) => b.clearTint())
          difficultyButtons[i].setTint(0xff0000)
        }),
    )
    roundCountButtons[0].setTint(0xff0000)
    difficultyButtons[0].setTint(0xff0000)
    const showPlayOptions = () => {
      if (isShowingPlayOptions) return
      isShowingPlayOptions = true
      const buttons = [...roundCountButtons, ...difficultyButtons]
      buttons.forEach((b) => b.setAlpha(1))
      roundCountHeading.setAlpha(1)
      difficultyHeading.setAlpha(1)
      playButton.text = ''
      helpText.text = ''
      helpButton.text = 'Start'
    }

    // help stuff
    const onClickTopButton = () => {
      showPlayOptions()
    }
    const onClickBottomButton = () => {
      if (isShowingPlayOptions) {
        this.registry.set('num-rounds', ROUND_COUNTS[roundCountIndex])
        this.scene.start('GameScene', {
          numRounds: ROUND_COUNTS[roundCountIndex],
          difficulty: DIFFICULTY[difficultyIndex],
        })
      } else {
        if (helpTextIndex < HELP_TEXT.length) {
          playButton.text = ''
          helpButton.text = 'Next'
          helpText.text = HELP_TEXT[helpTextIndex++]
          if (helpTextIndex === HELP_TEXT.length) helpButton.text = 'Play'
        } else {
          showPlayOptions()
        }
      }
    }

    const helpText = this.add
      .text(w / 2, h / 2, '')
      .setOrigin(0.5)
      .setFontFamily(FONT_NAME)
      .setFontSize(60)
      .setAlign('center')
      .setLineSpacing(10)

    const playButton = this.add
      .text(w / 2, h - 300, 'Play')
      .setOrigin(0.5)
      .setFontFamily(FONT_NAME)
      .setFontSize(64)
      .setInteractive()
      .on('pointerdown', onClickTopButton)

    const helpButton = this.add
      .text(w / 2, h - 200, 'Help')
      .setOrigin(0.5)
      .setFontFamily(FONT_NAME)
      .setFontSize(64)
      .setInteractive()
      .on('pointerdown', onClickBottomButton)
    // this.scene.start('GameScene')
  }
}

const HELP_TEXT = [
  `Poker Blitz is a 2 player card game
where you rush to build poker hands`,
  `Each round, players are dealt 5 cards
and the rest are scattered face up`,
  `Players have 10 seconds to swap their
cards with the ones on the table`,
  `Every 10 seconds, a new round will
begin until only 2 cards remain`,
  `The player with the strongest hands wins`,
]
