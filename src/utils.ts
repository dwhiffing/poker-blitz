import _ from 'lodash'
import { ICard } from './types'

const CARD_VALUES = 'A23456789TJQK'.split('')
const SUIT_VALUES = 'CHSD'.split('')
const CARD_ORDER = 'AKQJT98765432'.split('')
const getValueIndex = (value: any) => CARD_ORDER.indexOf(value)

const countCards = (indexToCount: number, hand: string) =>
  _.countBy(hand.split(' '), indexToCount)

const countValues = _.curry(countCards)(0)
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
  const isStraight = sortedCards.every((card, index, cards) => {
    if (index === 4) return true
    return cards[index + 1] === CARD_ORDER[CARD_ORDER.indexOf(card) + 1]
  })
  return isStraight ? sortedCards[0] : false
}

const hasStraightFlush = (hand: string) => hasFlush(hand) && hasStraight(hand)
const hasRoyalFlush = (hand: string) => hasStraightFlush(hand) === 'A'

export const getHandStrength = (hand: string): number =>
  (_.find(_.range(bestHands.length) as number[], (bestHandsIndex) =>
    bestHands[bestHandsIndex](hand),
  ) as number) || 9

export const judgeWinner = (players: string[]) => {
  const handStrengths = players.map(getHandStrength) as number[]
  if (handStrengths[0] !== handStrengths[1]) {
    return handStrengths.indexOf(_.min(handStrengths)!)
  }
  // TODO: tie breakers could be better
  const tiebreakers = (
    (
      players
        .map(bestHands[handStrengths[0]] as () => void)
        .map((t) => (!Array.isArray(t) ? [t] : t)) as string[][]
    ).map((hand: string[]) => hand.map(getValueIndex) as number[]) as number[][]
  ).map((h) => h[0])

  return tiebreakers.indexOf(_.min(tiebreakers)!)
}

export const handToString = (hand: ICard[]): string =>
  hand.map((card) => cardToString(card)).join(' ')

export const cardToString = (card: ICard): string =>
  CARD_VALUES[card.value] + SUIT_VALUES[card.suit]

export const getHandStrengths = (hands: ICard[][]) =>
  hands.map(handToString).map((c) => HAND_NAMES[getHandStrength(c)])

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

export const HAND_NAMES = [
  'royal flush',
  'straight flush',
  'four of a kind',
  'full house',
  'flush',
  'straight',
  '3 of a kind',
  '2 pair',
  'pair',
  'high card',
]
