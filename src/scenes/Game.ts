import Phaser from 'phaser'
import { ANIM_TIME } from '../constants'
import DeckService from '../services/DeckService'
import PlayerService from '../services/PlayerService'
import Card from '../sprites/Card'

export default class Game extends Phaser.Scene {
  deck!: DeckService
  player!: PlayerService
  ai!: PlayerService
  selectedCard?: Card
  width: number
  height: number
  constructor() {
    super('GameScene')
    this.width = 0
    this.height = 0
  }

  create() {
    this.deck = new DeckService(this)
    this.width = this.cameras.main.width
    this.height = this.cameras.main.width
    this.deck.cards.forEach((card) =>
      card.on('pointerdown', () => this.clickCard(card)),
    )
    this.player = new PlayerService(this, 50, 50, 'player')
    this.ai = new PlayerService(this, this.width - 110, 50, 'bob')
    this.dealCards()
  }

  async delay(duration: number, callback: () => void) {
    this.time.delayedCall(duration, callback)
  }

  async dealCards() {
    await this.deck.deal(5, this.player)
    await this.deck.deal(5, this.ai)
    await this.deck.scatter()
    this.startTimer()
    // TODO: add scoring system
  }

  startTimer() {
    const timerText = this.add
      .bitmapText(this.width / 2, 50, 'gem', '')
      .setOrigin(0.5)
    let time = 10
    timerText.text = time.toString()

    this.time.addEvent({
      repeat: 10,
      delay: 1000,
      callback: () => {
        if (--time > -1) {
          timerText.text = time.toString()
        } else {
          // TODO: score player hands, shuffle deck, deal 5 more cards to players
        }
      },
    })
  }

  clickCard(card: Card) {
    if (this.selectedCard) {
      this.selectedCard.clearTint()
      this.selectedCard.move(card.x, card.y)
      let depth = card.depth
      let angle = card.angle
      card.setDepth(this.selectedCard.depth)
      card.angle = this.selectedCard.angle
      this.selectedCard.angle = angle
      this.selectedCard.setDepth(depth)
      card.move(this.selectedCard.x, this.selectedCard.y)
      this.selectedCard = undefined
    } else {
      this.selectedCard = card
      card.setTint(0x00ffff)
    }
  }
}
