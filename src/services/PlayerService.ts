import { chunk, takeRight } from 'lodash'
import {
  AIConfig,
  AI_CONFIG,
  CARD_HEIGHT,
  CARD_WIDTH,
  FONT_NAME,
  PLAYER_BUFFER,
} from '../constants'
import Card from '../sprites/Card'
import {
  getHandDescriptions,
  getBestHand,
  handToString,
  judgeWinner,
} from '../utils'
import DeckService from './DeckService'

export default class PlayerService {
  cards: Card[]
  scene: Phaser.Scene
  label: Phaser.GameObjects.Text
  config: AIConfig
  handLabels: Phaser.GameObjects.Text[]
  name: string
  x: number
  y: number

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    difficulty?: string,
  ) {
    this.scene = scene
    this.cards = []
    this.config = AI_CONFIG[(difficulty || 'EASY') as string]
    this.label = this.scene.add
      .text(x, y - 10, '', { fontSize: '52px' })
      .setFontFamily(FONT_NAME)
    const isRight = x > this.scene.cameras.main.width / 2
    this.label.setOrigin(isRight ? 1 : 0, 0.5)
    this.handLabels = new Array(5).fill('').map((_, i) =>
      this.scene.add
        .text(x, 0, '', { fontSize: '32px' })
        .setFontFamily(FONT_NAME)
        .setOrigin(isRight ? 1 : 0, 0.5),
    )
    this.x = x
    this.name = name
    this.y = y
    this.updateWinCount()
  }

  updateWinCount() {
    const winCount =
      this.scene.registry.get(
        this.name === 'Player' ? 'player-wins' : 'ai-wins',
      ) || 0
    this.label.text = `${this.name} (${winCount})`
  }

  addCards(cards: Card[]) {
    this.cards.push(...cards)
  }

  getHands() {
    return chunk(this.cards, 5)
  }

  getHandsSorted() {
    return this.getHands().sort((a, b) =>
      judgeWinner([handToString(a), handToString(b)]) === 0 ? -1 : 1,
    )
  }

  updateHandDescriptions(hands = this.getHands()) {
    const descriptions = getHandDescriptions(hands)
    this.handLabels.forEach((label, i) => {
      label.text = descriptions[i]
      label.y = this.y + CARD_HEIGHT * 1.4 + i * (CARD_HEIGHT + PLAYER_BUFFER)
    })
  }

  evaluateHands() {
    const hands = this.getHandsSorted()

    setTimeout(() => {
      hands.forEach((hand, i) => {
        hand.forEach((card) =>
          card.move(
            card.x,
            this.y + CARD_HEIGHT * 0.75 + i * (CARD_HEIGHT + PLAYER_BUFFER),
          ),
        )
      })
    }, 10)

    this.updateHandDescriptions(hands)

    return hands
  }

  getBestSwap(deck: DeckService) {
    const hands = this.getHandsSorted()
    const worstHand = hands[hands.length - 1]
    const bestSwaps = worstHand.map((aiCard, i, aiHand) => {
      const allSwaps = takeRight(deck.cards, this.config.cardSlice).map(
        (card) => [card, aiHand.map((c) => (c === aiCard ? card : c))],
      )
      const bestSwap = getBestHand(allSwaps.map((c) => c[1]) as Card[][])
      return [aiCard, allSwaps.find((_c) => _c[1] === bestSwap)]
    }) as [Card, [Card, Card[]]][]

    const bestSwap = getBestHand(bestSwaps.map((c) => c[1][1]))
    const bestSwapCards = bestSwaps.find((c) => c[1][1] === bestSwap)!
    const isTie =
      judgeWinner([
        handToString(worstHand),
        handToString(bestSwapCards[1][1]),
      ]) === -1
    if (isTie) return []
    return [bestSwapCards[0], bestSwapCards[1][0]]
  }
}
