import Phaser from 'phaser'
import DeckService from '../services/DeckService'
import PlayerService from '../services/PlayerService'
import Card from '../sprites/Card'

export default class Game extends Phaser.Scene {
  deck!: DeckService
  player!: PlayerService
  ai!: PlayerService
  selectedCard?: Card
  width: number
  allowInput: boolean
  height: number
  timerText?: Phaser.GameObjects.BitmapText
  constructor() {
    super('GameScene')
    this.width = 0
    this.allowInput = false
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
      this.allowInput = true
      this.time.addEvent({
        repeat: 10,
        delay: 1000,
        callback: () => {
          if (--time > -1) {
            timerText.text = time.toString()
          } else {
            timerText.text = ''
            if (this.selectedCard) {
              this.selectedCard.clearTint()
              this.selectedCard = undefined
              this.allowInput = false
            }
            resolve()
          }
        },
      })
    })
  }

  clickCard(card: Card) {
    if (!this.allowInput) return
    if (this.selectedCard) {
      const aIndex = this.deck.cards.indexOf(card)
      const bIndex = this.deck.cards.indexOf(this.selectedCard)
      const shouldSwap = aIndex !== -1 ? bIndex === -1 : bIndex !== -1
      if (shouldSwap) {
        const a = aIndex > -1 ? card : this.selectedCard
        const b = aIndex > -1 ? this.selectedCard : card
        this.deck.cards = this.deck.cards.map((c) => (a === c ? b! : c))
        this.player.cards = this.player.cards.map((c) => (b === c ? a! : c))
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
