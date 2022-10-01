import { chunk } from 'lodash'
import Phaser from 'phaser'
import { ROUND_DURATION } from '../constants'
import DeckService from '../services/DeckService'
import PlayerService from '../services/PlayerService'
import Card from '../sprites/Card'
import { handToString, judgeWinner } from '../utils'

export default class Game extends Phaser.Scene {
  deck!: DeckService
  player!: PlayerService
  ai!: PlayerService
  selectedCard?: Card
  width: number
  allowInput: boolean
  height: number
  roundTimer: number
  timerText!: Phaser.GameObjects.BitmapText
  constructor() {
    super('GameScene')
    this.width = 0
    this.allowInput = false
    this.height = 0
    this.roundTimer = 0
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
    }

    const playerHands = this.player.evaluateHands()
    const aiHands = this.ai.evaluateHands()
    playerHands.forEach((pHand, i) => {
      const aiHand = aiHands[i]
      const hands = [handToString(pHand), handToString(aiHand)]
      const isPlayerWinner = judgeWinner(hands) === 0
      this.player.handLabels[i].setTint(isPlayerWinner ? 0x33ff33 : 0xff1111)
      this.ai.handLabels[i].setTint(isPlayerWinner ? 0xff1111 : 0x33ff33)
    })
  }

  startTimer() {
    return new Promise<void>((resolve) => {
      this.roundTimer = ROUND_DURATION
      this.timerText.text = this.roundTimer.toString()
      this.allowInput = true
      this.tickTimer(resolve)
      this.time.addEvent({
        repeat: ROUND_DURATION,
        delay: 1000,
        callback: () => this.tickTimer(resolve),
      })
    })
  }

  tickTimer(callback: () => void) {
    if (--this.roundTimer > -1) {
      this.timerText.text = this.roundTimer.toString()
    } else {
      this.timerText.text = ''
      if (this.selectedCard) {
        this.selectedCard.clearTint()
        this.selectedCard = undefined
        this.allowInput = false
      }
      callback()
    }
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
    } else {
      this.selectedCard = card
      card.setTint(0x00ffff)
    }
  }
}
