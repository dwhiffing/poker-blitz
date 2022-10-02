import { chunk, takeRight } from 'lodash'
import { AIConfig, AI_CONFIG } from '../constants'
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
  label: Phaser.GameObjects.BitmapText
  config: AIConfig
  handLabels: Phaser.GameObjects.BitmapText[]
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
      .bitmapText(x + 40, y - 35, 'gem', '', 16)
      .setOrigin(0.5)
    const isRight = x > this.scene.cameras.main.width / 2
    this.handLabels = new Array(5).fill('').map((_, i) => {
      const _x = x - (isRight ? 40 : -120)
      const _y = y + 15 + i * 100
      const _o = isRight ? 1 : 0
      return this.scene.add.bitmapText(_x, _y, 'gem', '', 16).setOrigin(_o, 0.5)
    })
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
    this.label.text = `${this.name} (${winCount} wins)`
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
  evaluateHands() {
    const hands = this.getHandsSorted()

    setTimeout(() => {
      hands.forEach((hand, i) => {
        hand.forEach((card) => card.move(card.x, this.y + 20 + i * 100))
      })
    }, 10)

    const descriptions = getHandDescriptions(hands)
    this.handLabels.forEach((label, i) => {
      label.text = descriptions[i]
      label.y = this.y + 20 + i * 100
    })

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
