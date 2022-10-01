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
  timerText?: Phaser.GameObjects.BitmapText
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
    this.timerText = this.add
      .bitmapText(this.width / 2, 50, 'gem', '')
      .setOrigin(0.5)
  }

  async delay(duration: number, callback: () => void) {
    this.time.delayedCall(duration, callback)
  }

  async dealCards() {
    let roundCount = 0
    while (roundCount <= 4) {
      if (roundCount > 0) await this.deck.shuffle()
      await this.deck.deal(5, this.player, roundCount)
      await this.deck.deal(5, this.ai, roundCount)
      await this.deck.scatter(roundCount)
      if (roundCount < 4) {
        await this.startTimer()
        await this.deck.shuffle()
      }
      roundCount++
      console.log('end round')
    }
    console.log('end game')
    // TODO: score player hands, shuffle deck, deal 5 more cards to players
    // TODO: add scoring system
    // need to read poker hands
    // score text next to each hand and score total
  }

  startTimer() {
    return new Promise<void>((resolve) => {
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
            timerText.text = ''
            resolve()
          }
        },
      })
    })
  }

  clickCard(card: Card) {
    // only allow clicking if round is active
    // reset selected card when round ends
    if (this.selectedCard) {
      if (
        this.deck.cards.indexOf(card) > -1 &&
        this.deck.cards.indexOf(this.selectedCard!) === -1
      ) {
        this.deck.cards = this.deck.cards.map((c) =>
          card === c ? this.selectedCard! : c,
        )
        this.player.cards = this.player.cards.map((c) =>
          this.selectedCard === c ? card! : c,
        )
      }
      if (
        this.deck.cards.indexOf(this.selectedCard) > -1 &&
        this.deck.cards.indexOf(card!) === -1
      ) {
        this.deck.cards = this.deck.cards.map((c) =>
          this.selectedCard === c ? card! : c,
        )
        this.player.cards = this.player.cards.map((c) =>
          card === c ? this.selectedCard! : c,
        )
      }

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
      // need to check if cards are player/deck and swap if needed
    } else {
      this.selectedCard = card
      card.setTint(0x00ffff)
    }
  }
}
