import _ from 'lodash'
import { ICard } from './types'

export const CARD_VALUES = 'A23456789TJQK'.split('')
const SUIT_VALUES = 'CHSD'.split('')

const CARD_ORDER = 'AKQJT98765432'.split('')
const getValueIndex = (value: any) => CARD_ORDER.indexOf(value)

const countCards = (indexToCount: number, hand: string) =>
  _.countBy(hand.split(' '), indexToCount)

export const countValues = _.curry(countCards)(0)
const countSuits = _.curry(countCards)(1)

const sortCards = (hand: string) =>
  _.sortBy(Object.keys(countValues(hand)), getValueIndex)

const hasAKind = (count: number, hand: string) =>
  _.findKey(countValues(hand), _.curry(_.eq)(count))

const hasPair = _.curry(hasAKind)(2)
const hasThreeOfAKind = _.curry(hasAKind)(3)
const hasFourOfAKind = _.curry(hasAKind)(4)
const highestCard = (hand: string) =>
  sortCards(hand).filter((value) => value !== hasPair(hand))

const hasTwoPairs = (hand: string) => {
  const values = countValues(hand)
  const leftPair = _.findKey(values, _.curry(_.eq)(2))
  const rightPair = _.findLastKey(values, _.curry(_.eq)(2))
  if (leftPair && rightPair && leftPair !== rightPair) {
    return sortCards(leftPair + ' ' + rightPair)
  }
}

const hasFlush = (hand: string) =>
  _.findKey(countSuits(hand), _.eq.bind(null, 5))

const hasFullHouse = (hand: string) => {
  const values = countValues(hand)
  if (_.findKey(values, _.eq.bind(null, 2))) {
    return _.findKey(values, _.eq.bind(null, 3))
  }
}

const hasStraight = (hand: string) => {
  const sortedCards = highestCard(hand)
  const isStraight =
    sortedCards.length === 5 &&
    sortedCards.every((card, index, cards) => {
      if (index === 4) return true
      return cards[index + 1] === CARD_ORDER[CARD_ORDER.indexOf(card) + 1]
    })
  return isStraight ? sortedCards[0] : false
}

const hasStraightFlush = (hand: string) => hasFlush(hand) && hasStraight(hand)
const hasRoyalFlush = (hand: string) => hasStraightFlush(hand) === 'A'

export const getHandStrength = (hand: string): number =>
  _.find(_.range(bestHands.length) as number[], (bestHandsIndex) =>
    bestHands[bestHandsIndex](hand),
  ) as number

export const judgeWinner = (players: string[]) => {
  const handStrengths = players.map(getHandStrength) as number[]
  if (handStrengths[0] !== handStrengths[1]) {
    return handStrengths.indexOf(_.min(handStrengths)!)
  }

  // see who has higher value hand
  const tiebreakers = players
    .map(bestHands[handStrengths[0]] as () => void)
    .map(getValueIndex)
  if (
    tiebreakers[0] !== -1 &&
    tiebreakers[1] !== -1 &&
    tiebreakers[0] !== tiebreakers[1]
  ) {
    return tiebreakers.indexOf(_.min(tiebreakers)!)
  }

  // if hands are the same, check remaining cards for kickers
  const tiebreakerKickers = players
    .map(sortCards)
    .map((h) => h.map(getValueIndex))

  // if hands are exactly the same, it's a tie, return -1
  if (_.isEqual(tiebreakerKickers[0], tiebreakerKickers[1])) return -1

  return tiebreakerKickers.indexOf(_.min(tiebreakerKickers)!)
}

export const handToString = (hand: ICard[]): string =>
  hand.map((card) => cardToString(card)).join(' ')

export const cardToString = (card: ICard): string =>
  CARD_VALUES[card.value] + SUIT_VALUES[card.suit]

export const getHandDescriptions = (hands: ICard[][]) =>
  hands.map((c) => HAND_DESCRIBERS[getHandStrength(handToString(c))](c))

export const getBestHand = (hands: ICard[][]) =>
  hands.sort((a, b) =>
    judgeWinner([handToString(a), handToString(b)]) === 0 ? -1 : 1,
  )[0]

const bestHands = [
  hasRoyalFlush,
  hasStraightFlush,
  hasFourOfAKind,
  hasFullHouse,
  hasFlush,
  hasStraight,
  hasThreeOfAKind,
  hasTwoPairs,
  hasPair,
  highestCard,
]

const highLabel = (h: ICard[]) => {
  const value = h
    .map((c) => [c.value, getValueIndex(CARD_VALUES[c.value])])
    .sort((a, b) => a[1] - b[1])[0]
  return CARD_LABELS[value[0]]
}

const pairLabel = (h: ICard[], n: number = 2) =>
  Object.entries(countValues(handToString(h)))
    .filter(([_, v]) => v === n)
    .map((c) => CARD_VALUES.indexOf(c[0]))
    .map((v) => CARD_LABELS[v] + 's')
    .join(' and ')

const HAND_DESCRIBERS = [
  () => 'Royal Flush',
  (h: ICard[]) => `Straight Flush (${highLabel(h)} high)`,
  (h: ICard[]) => `4 of a Kind (${pairLabel(h, 4)})`,
  (h: ICard[]) => `Full house (${pairLabel(h, 3)} and ${pairLabel(h, 2)})`,
  (h: ICard[]) => `Flush (${highLabel(h)} high)`,
  (h: ICard[]) => `Straight (${highLabel(h)} high)`,
  (h: ICard[]) => `3 of a Kind (${pairLabel(h, 3)})`,
  (h: ICard[]) => `2 Pair (${pairLabel(h)})`,
  (h: ICard[]) => `Pair of ${pairLabel(h)}`,
  (h: ICard[]) => `High card (${highLabel(h)})`,
]

const CARD_LABELS = [
  'Ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Jack',
  'Queen',
  'King',
]
