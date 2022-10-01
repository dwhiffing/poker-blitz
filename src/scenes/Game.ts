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
  constructor() {
    super('GameScene')
  }

  create() {
    this.deck = new DeckService(this)
    this.deck.cards.forEach((card) =>
      card.on('pointerdown', () => this.clickCard(card)),
    )
    this.player = new PlayerService(this, 200, 50, 'player')
    this.ai = new PlayerService(this, 400, 50, 'bob')
    this.dealCards()
  }

  dealCards() {
    this.deck.deal(5, this.player)
    this.time.delayedCall(ANIM_TIME * 5, () => {
      this.deck.deal(5, this.ai)
    })
    this.time.delayedCall(ANIM_TIME * 10, () => {
      this.deck.scatter()
    })

    // TODO: allow moving and swapping of cards in between rounds
    // TODO: add scoring system

    this.time.delayedCall(ANIM_TIME * 60, () => {
      const timerText = this.add.bitmapText(300, 50, 'gem', '')
      let time = 10
      timerText.text = time.toString()

      this.time.addEvent({
        repeat: 10,
        delay: 1000,
        callback: () => {
          if (time-- > -1) {
            timerText.text = time.toString()
          } else {
            // TODO: score player hands, shuffle deck, deal 5 more cards to players
          }
        },
      })
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
