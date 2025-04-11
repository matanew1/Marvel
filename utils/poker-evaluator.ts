import type { Card } from "@/types/card"

// Simple poker hand evaluator
export function evaluateHand(cards: Card[]): number {
  // In a real implementation, this would evaluate the best 5-card poker hand
  // For this example, we'll use a simplified scoring system

  // Sort cards by value (high to low)
  const sortedCards = [...cards].sort((a, b) => b.value - a.value)

  // Check for pairs, three of a kind, etc.
  const valueCounts: Record<number, number> = {}
  for (const card of sortedCards) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1
  }

  // Get counts of each group (pairs, three of a kind, etc.)
  const counts = Object.values(valueCounts).sort((a, b) => b - a)

  // Check for flush (all same suit)
  const isFlush = cards.every((card) => card.suit === cards[0].suit)

  // Check for straight (5 cards in sequence)
  let isStraight = false
  if (sortedCards.length >= 5) {
    for (let i = 0; i <= sortedCards.length - 5; i++) {
      if (
        sortedCards[i].value === sortedCards[i + 1].value + 1 &&
        sortedCards[i + 1].value === sortedCards[i + 2].value + 1 &&
        sortedCards[i + 2].value === sortedCards[i + 3].value + 1 &&
        sortedCards[i + 3].value === sortedCards[i + 4].value + 1
      ) {
        isStraight = true
        break
      }
    }
  }

  // Evaluate hand type and return score
  // Higher score = better hand

  // Royal flush
  if (isFlush && isStraight && sortedCards[0].value === 14) {
    return 9000 + sortedCards[0].value
  }

  // Straight flush
  if (isFlush && isStraight) {
    return 8000 + sortedCards[0].value
  }

  // Four of a kind
  if (counts[0] === 4) {
    return 7000 + getKeyByValue(valueCounts, 4) * 10
  }

  // Full house
  if (counts[0] === 3 && counts[1] === 2) {
    return 6000 + getKeyByValue(valueCounts, 3) * 10 + getKeyByValue(valueCounts, 2)
  }

  // Flush
  if (isFlush) {
    return 5000 + sortedCards[0].value
  }

  // Straight
  if (isStraight) {
    return 4000 + sortedCards[0].value
  }

  // Three of a kind
  if (counts[0] === 3) {
    return 3000 + getKeyByValue(valueCounts, 3) * 10
  }

  // Two pair
  if (counts[0] === 2 && counts[1] === 2) {
    const firstPair = getKeyByValue(valueCounts, 2, true)
    const secondPair = getKeyByValue(valueCounts, 2, false, firstPair)
    return 2000 + Math.max(firstPair, secondPair) * 10 + Math.min(firstPair, secondPair)
  }

  // One pair
  if (counts[0] === 2) {
    return 1000 + getKeyByValue(valueCounts, 2) * 10
  }

  // High card
  return sortedCards[0].value
}

// Helper function to get key by value
function getKeyByValue(object: Record<number, number>, value: number, findFirst = true, skipKey?: number): number {
  const keys = Object.keys(object)
    .map(Number)
    .filter((key) => {
      if (skipKey !== undefined && key === skipKey) return false
      return object[key] === value
    })

  if (keys.length === 0) return 0

  return findFirst ? Math.max(...keys) : Math.min(...keys)
}
