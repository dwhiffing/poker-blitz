import Phaser from 'phaser'
import { ROUND_DURATION } from '../constants'
import DeckService from '../services/DeckService'
import PlayerService from '../services/PlayerService'
import Card from '../sprites/Card'
import { handToString, judgeWinner } from '../utils'

// TODO: need to add ai
// TODO: need to sort/highlight each card based on hand
// console.log(judgeWinner(['AH AC KS KS 3D', 'AC AS KS KD 4D']))

export default class Game extends Phaser.Scene {
  deck!: DeckService
  player!: PlayerService
  ai!: PlayerService
  selectedCard?: Card
  width: number
  allowInput: boolean
  height: number
  roundTimer: number
  roundCount!: number
  timerText!: Phaser.GameObjects.BitmapText
  newGameText!: Phaser.GameObjects.BitmapText
  winnerText!: Phaser.GameObjects.BitmapText

  constructor() {
    super('GameScene')
    this.width = 0
    this.allowInput = false
    this.height = 0
    this.roundTimer = 0
  }

  create() {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height

    this.deck = new DeckService(this)
    this.deck.cards.forEach((card) =>
      card.on('pointerdown', () => this.clickCard(card)),
    )

    this.player = new PlayerService(this, 50, 50, 'player')
    this.ai = new PlayerService(this, this.width - 120, 50, 'bob')

    this.timerText = this.add
      .bitmapText(this.width / 2, 50, 'gem', '')
      .setOrigin(0.5)
    this.winnerText = this.add
      .bitmapText(this.width / 2, 50, 'gem', '')
      .setOrigin(0.5)
    this.newGameText = this.add
      .bitmapText(this.width / 2, this.height - 50, 'gem', '')
      .setOrigin(0.5)

    this.delay(300, this.playRound.bind(this))
  }

  async playRound() {
    this.roundCount = 0
    while (this.roundCount <= 4) {
      if (this.roundCount > 0) await this.deck.shuffle()
      await this.deck.deal(5, this.player, this.roundCount)
      await this.deck.deal(5, this.ai, this.roundCount)
      await this.deck.scatter(this.roundCount)
      if (this.roundCount < 4) {
        await this.startRoundTimer()
        await this.deck.shuffle()
      }
      this.roundCount++
    }
    this.handleRoundEnd()
  }

  startRoundTimer() {
    return new Promise<void>((resolve) => {
      this.roundTimer = ROUND_DURATION
      this.timerText.text = this.roundTimer.toString()
      this.allowInput = true
      this.tickRoundTimer(resolve)
      this.time.addEvent({
        repeat: ROUND_DURATION,
        delay: 1000,
        callback: () => this.tickRoundTimer(resolve),
      })
    })
  }

  tickRoundTimer(callback: () => void) {
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

  async handleRoundEnd() {
    // check winner
    const playerHands = this.player.evaluateHands()
    const aiHands = this.ai.evaluateHands()

    const results = playerHands.map((pHand, i) => {
      const aiHand = aiHands[i]
      const hands = [handToString(pHand), handToString(aiHand)]
      const isPlayerWinner = judgeWinner(hands) === 0
      this.player.handLabels[i].setTint(isPlayerWinner ? 0x33ff33 : 0xff1111)
      this.ai.handLabels[i].setTint(isPlayerWinner ? 0xff1111 : 0x33ff33)
      return isPlayerWinner
    })

    const playerWinCount = results.reduce((sum, n) => sum + (n ? 1 : 0), 0)
    const winner = playerWinCount > 2 ? 'player' : 'bob'

    // update labels and show replay button
    this.winnerText.text = `${winner} wins!`
    this.newGameText.text = 'New game?'
    this.registry.inc(playerWinCount > 2 ? 'player-wins' : 'ai-wins')
    this.newGameText
      .setInteractive()
      .on('pointerdown', () => this.scene.restart())
  }

  clickCard(card: Card) {
    if (
      !this.allowInput ||
      this.roundCount > 4 ||
      this.ai.cards.indexOf(card) > -1
    )
      return

    if (this.selectedCard) {
      this.swapCards(card, this.selectedCard)
      this.selectedCard.clearTint()
      this.selectedCard = undefined
    } else {
      this.selectedCard = card
      card.setTint(0x00ffff)
    }
  }

  swapCards(cardA: Card, cardB: Card) {
    const aIndex = this.deck.cards.indexOf(cardA)
    const bIndex = this.deck.cards.indexOf(cardB)
    const shouldSwap = aIndex !== -1 ? bIndex === -1 : bIndex !== -1
    if (!shouldSwap) return

    const a = aIndex > -1 ? cardA : cardB
    const b = aIndex > -1 ? cardB : cardA
    this.deck.cards = this.deck.cards.map((c) => (a === c ? b! : c))
    this.player.cards = this.player.cards.map((c) => (b === c ? a! : c))
    const depth = cardA.depth
    const angle = cardA.angle
    cardA.move(cardB.x, cardB.y)
    cardB.move(cardA.x, cardA.y)
    cardA.setDepth(cardB.depth)
    cardB.setDepth(depth)
    cardA.angle = cardB.angle
    cardB.angle = angle
  }

  async delay(duration: number, callback: () => void) {
    this.time.delayedCall(duration, callback)
  }
}
