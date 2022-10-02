import Phaser from 'phaser'
import { FONT_NAME } from '../constants'
import DeckService from '../services/DeckService'

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

    const deck = new DeckService(this)
    deck.scatter(2)

    this.registry.set('player-wins', 0)
    this.registry.set('ai-wins', 0)

    // title
    this.add
      .text(w / 2, 150, 'Poker Blitz')
      .setOrigin(0.5)
      .setFontFamily(FONT_NAME)
      .setFontSize(100)
    this.add
      .text(w / 2, 250, 'By Dan Whiffing')
      .setOrigin(0.5)
      .setFontFamily(FONT_NAME)
      .setFontSize(32)

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
        .setColor('#ffffff55')
        .on('pointerdown', () => {
          roundCountIndex = i
          roundCountButtons.forEach((b) => b.setColor('#ffffff55'))
          roundCountButtons[i].setColor('#ffffff')
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
        .setColor('#ffffff55')
        .on('pointerdown', () => {
          difficultyIndex = i
          difficultyButtons.forEach((b) => b.setColor('#ffffff55'))
          difficultyButtons[i].setColor('#ffffff')
        }),
    )
    roundCountButtons[0].setColor('#ffffff')
    difficultyButtons[0].setColor('#ffffff')
    const showPlayOptions = () => {
      if (isShowingPlayOptions) return
      deck.cards.forEach((c) => c.setAlpha(0))
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
      this.sound.play('tick')
      showPlayOptions()
    }
    let hasStarted = false
    const onClickBottomButton = () => {
      if (isShowingPlayOptions) {
        if (hasStarted) return
        this.registry.set('num-rounds', ROUND_COUNTS[roundCountIndex])
        this.sound.play('game-end')
        hasStarted = true
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene', {
            numRounds: ROUND_COUNTS[roundCountIndex],
            difficulty: DIFFICULTY[difficultyIndex],
          })
        })
      } else {
        deck.cards.forEach((c) => c.setAlpha(0))
        this.sound.play('tick')
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
      .text(w / 2, h - 250, 'Play')
      .setOrigin(0.5)
      .setFontFamily(FONT_NAME)
      .setFontSize(64)
      .setInteractive()
      .on('pointerdown', onClickTopButton)

    const muteButton = this.add
      .sprite(w, h, 'icons', 1)
      .setOrigin(1.2, 1.2)
      .setInteractive()
      .on('pointerdown', () => {
        this.sound.mute = !this.sound.mute
        window.localStorage.setItem(
          'poker-blitz-mute',
          this.sound.mute ? '0' : '1',
        )
        muteButton.setFrame(this.sound.mute ? 1 : 0)
      })
    if (window.localStorage.getItem('poker-blitz-mute') === '1') {
      muteButton.emit('pointerdown')
    }

    const helpButton = this.add
      .text(w / 2, h - 150, 'Help')
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
where you rush to make poker hands.`,
  `Each round, players are dealt 5 cards
and the rest are scattered face up`,
  `Players have 10 seconds to swap their
cards with the ones on the table.
You can swap from any of your hands.`,
  `Click any one of your cards, then a
card in the center to swap.`,
  `You will play against the computer.
The card they will swap with is highlighted
for a moment before they swap.`,
  `Every 10 seconds, a new round will
begin until only 2 cards remain.
Players don't swap in the last round.`,
  `The player with the strongest 5 hands wins`,
]
