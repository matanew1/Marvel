import type { Card } from "@/types/card"

// Evaluate hand based on Marvel character attributes
export function evaluateHand(cards: Card[]): number {
  // Sort cards by power (high to low)
  const sortedByPower = [...cards].sort((a, b) => b.power - a.power)

  // Sort cards by life (high to low)
  const sortedByLife = [...cards].sort((a, b) => b.life - a.life)

  // Calculate total power and life
  const totalPower = cards.reduce((sum, card) => sum + card.power, 0)
  const totalLife = cards.reduce((sum, card) => sum + card.life, 0)

  // Calculate average energy cost
  const avgEnergy = cards.reduce((sum, card) => sum + card.energy, 0) / cards.length

  // Check for synergies (cards with abilities)
  const cardsWithAbilities = cards.filter((card) => card.ability).length

  // Check for high-value cards (power > 5)
  const highPowerCards = cards.filter((card) => card.power > 5).length

  // Check for tank cards (life > 5)
  const tankCards = cards.filter((card) => card.life > 5).length

  // Calculate a score based on various factors
  let score = 0

  // Base score from total power and life
  score += totalPower * 10
  score += totalLife * 5

  // Bonus for high power cards
  score += highPowerCards * 50

  // Bonus for tank cards
  score += tankCards * 30

  // Bonus for cards with abilities
  score += cardsWithAbilities * 40

  // Efficiency bonus (higher power/energy ratio is better)
  const efficiency =
    totalPower /
    Math.max(
      1,
      cards.reduce((sum, card) => sum + card.energy, 0),
    )
  score += efficiency * 20

  // Bonus for balanced team (good mix of power and life)
  const balance = Math.min(totalPower, totalLife) / Math.max(totalPower, totalLife)
  score += balance * 100

  // Synergy bonus for having multiple cards with abilities
  if (cardsWithAbilities >= 3) {
    score += 200
  } else if (cardsWithAbilities >= 2) {
    score += 100
  }

  // Special combinations
  // Check for "Avengers" combo (Iron Man, Captain America, Thor, Hulk)
  const avengersNames = ["Iron Man", "Captain America", "Thor", "Hulk"]
  const hasAvengers = avengersNames.every((name) => cards.some((card) => card.name.includes(name)))

  if (hasAvengers) {
    score += 500 // Big bonus for Avengers combo
  }

  // Check for "Guardians" combo (Star-Lord, Gamora, Groot, Rocket Raccoon, Drax)
  const guardiansNames = ["Star-Lord", "Gamora", "Groot", "Rocket Raccoon", "Drax"]
  const guardiansCount = guardiansNames.filter((name) => cards.some((card) => card.name.includes(name))).length

  if (guardiansCount >= 3) {
    score += guardiansCount * 100 // Bonus scales with number of Guardians
  }

  return Math.round(score)
}
