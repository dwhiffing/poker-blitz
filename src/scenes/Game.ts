import Phaser from 'phaser'
import { ROUND_DELAY, ROUND_DURATION } from '../constants'
import DeckService from '../services/DeckService'
import PlayerService from '../services/PlayerService'
import Card from '../sprites/Card'
import { handToString, judgeWinner } from '../utils'

// TODO: need to add ai
// based on difficulty, ai makes a move every n seconds
// start with random move, then make ai more strategic

// TODO: need to sort/highlight each card based on hand

export default class Game extends Phaser.Scene {
  deck!: DeckService
  player!: PlayerService
  ai!: PlayerService
  selectedCard?: Card
  width: number
  allowInput: boolean
  height: number
  roundTimer: number
  numRounds: number
  difficulty: string
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
    this.numRounds = 0
    this.difficulty = ''
  }

  init(opts: any) {
    this.numRounds = opts.numRounds
    this.difficulty = opts.difficulty
  }

  create() {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height

    this.deck = new DeckService(this)
    this.deck.cards.forEach((card) =>
      card.on('pointerdown', () => this.clickCard(card)),
    )

    this.player = new PlayerService(this, 50, 50, 'Player')
    const w = this.width - 120
    const name = `${this.difficulty} CPU`
    this.ai = new PlayerService(this, w, 50, name, this.difficulty)

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
      if (this.roundTimer === 0) this.tickRoundTimer(resolve)
      this.time.addEvent({
        repeat: ROUND_DURATION,
        delay: ROUND_DELAY,
        callback: () => this.tickRoundTimer(resolve),
      })
    })
  }

  tickRoundTimer(callback: () => void) {
    if (this.roundTimer < 0) return

    if (this.roundTimer === ROUND_DURATION) {
      this.allowInput = true
      this.aiMove()
    }

    if (--this.roundTimer > -1) {
      this.timerText.text = this.roundTimer.toString()
    } else {
      this.timerText.text = ''
      this.allowInput = false
      if (this.selectedCard) {
        this.selectedCard.clearTint()
        this.selectedCard = undefined
      }
      callback()
    }
  }

  async aiMove() {
    const d = ROUND_DURATION * ROUND_DELAY
    const startWait = this.ai.config.startWait
    const endWait = this.ai.config.endWait
    await new Promise((resolve) => this.delay(d / 100, resolve))

    if (!this.allowInput) return

    const [a, b] = this.ai.getBestSwap(this.deck)
    if (a && b) {
      b.setTint(0xff0000)

      await new Promise((resolve) => this.delay(d / startWait, resolve))
      b.clearTint()
      if (!this.allowInput) return
      this.swapCards(a, b, this.ai)

      await new Promise((resolve) => this.delay(d / endWait, resolve))
      this.aiMove()
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
      this.swapCards(card, this.selectedCard, this.player)
      this.selectedCard.clearTint()
      this.selectedCard = undefined
    } else {
      this.selectedCard = card
      card.setTint(0x00ffff)
    }
  }

  swapCards(cardA: Card, cardB: Card, player: PlayerService) {
    const aIndex = this.deck.cards.indexOf(cardA)
    const bIndex = this.deck.cards.indexOf(cardB)
    const shouldSwap = aIndex !== -1 ? bIndex === -1 : bIndex !== -1
    if (!shouldSwap) return

    const a = aIndex > -1 ? cardA : cardB
    const b = aIndex > -1 ? cardB : cardA
    this.deck.cards = this.deck.cards.map((c) => (a === c ? b! : c))
    player.cards = player.cards.map((c) => (b === c ? a! : c))
    const depth = cardA.depth
    const angle = cardA.angle
    cardA.move(cardB.x, cardB.y)
    cardB.move(cardA.x, cardA.y)
    cardA.setDepth(cardB.depth)
    cardB.setDepth(depth)
    cardA.angle = cardB.angle
    cardB.angle = angle
  }

  async delay(duration: number, callback: any) {
    this.time.delayedCall(duration, callback)
  }
}

// console.log(
//   [
//     [['AC 2S 3D 4D 5S', 'AC AS 2S 3D 4D'], 1], // pair beats high card
//     [['AC AS 3D 4D 5S', 'AC AS 2S 2D 4D'], 1], // 2 pair beats pair
//     [['AC AS 3D 3D 5S', 'AC AS AS 2D 4D'], 1], // 3oak beats 2 pair
//     [['AC AS AD 3D 5S', 'AC KS QS JD TD'], 1], // straight beats 3oak
//     [['AC KS QS JD TD', '2C 3C 5C JC TC'], 1], // flush beats straight
//     [['2C 3C 5C JC TC', 'AC AD AH JD JS'], 1], // fullhouse beats flush
//     [['AC AD AH JD JS', '2C 2S 2D 2H TC'], 1], // 4oak beats fullhouse
//     [['AC AD AH AS JS', '2C 3C 4C 5C 6C'], 1], // straightflush beats 4oak
//     [['2C 3C 4C 5C 6C', 'AC KC QC JC TC'], 1], // royalflush beats straightflush

//     [['2H 2C 3S 5D AD', 'QC QS 4S 6D 7D'], 1], // tiebreaker: pair goes to higher pair
//     [['AH 2C 4S 6D 8D', 'AC QS 2S 4D 6D'], 1], // tiebreaker: high card goes to high kicker
//     [['AH KC QS JD 5D', 'AC KS QS JD 6D'], 1], // tiebreaker: high card goes to high kicker
//     [['AH AC QS 2D 3D', 'AC AS KS 2D 3D'], 1], // tiebreaker: pair goes to high kicker
//     [['AH AC KS KD 3D', 'AC AS KS KD 4D'], 1], // tiebreaker: 2 pair goes to high kicker
//     [['AH AC AS KD 3D', 'AC AS AS KD 4D'], 1], // tiebreaker: 3oak goes to high kicker
//     [['2H 3C 4S 5D 6D', '3C 4S 5S 6D 7D'], 1], // tiebreaker: straight goes to high value
//     [['2H 3H 4H 5H KH', '2C 3C 4C 5C AC'], 1], // tiebreaker: flush goes to high value
//     [['AH AC AS QC QD', 'AC AS AS KD KC'], 1], // tiebreaker: fh goes to higher house
//     [['AH AC AS AD QD', 'AC AS AS AD KC'], 1], // tiebreaker: 4oak goes to higher value
//     [['2C 3C 4C 5C 6C', '3D 4D 5D 6D 7D'], 1], // tiebreaker: straightflush goes to high value
//     [['4C 4S 4H 4D AC', '4C 4S 4H 4D AD'], -1], // tiebreaker: straightflush goes to high value
//   ].every(
//     ([hands, expectedWinner]) =>
//       judgeWinner(hands as string[]) === expectedWinner,
//   ),
// )
