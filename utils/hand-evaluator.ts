import type { Card } from "@/types/card"

// Evaluate a hand of Marvel character cards
export function evaluateHand(hand: Card[]): { rank: number; name: string } {
  // Sort cards by power (high to low)
  const sortedByPower = [...hand].sort((a, b) => b.power - a.power)

  // Count occurrences of each power level
  const powerCounts: Record<number, number> = {}
  for (const card of hand) {
    powerCounts[card.power] = (powerCounts[card.power] || 0) + 1
  }

  // Count occurrences of each team
  const teamCounts: Record<string, number> = {}
  for (const card of hand) {
    teamCounts[card.team] = (teamCounts[card.team] || 0) + 1
  }

  // Check for INFINITY GAUNTLET (5 cards with different power levels, all from Villains team)
  const hasInfinityGauntlet = Object.keys(powerCounts).length === 5 && teamCounts["Villains"] === 5

  if (hasInfinityGauntlet) {
    return { rank: 9, name: "INFINITY GAUNTLET" }
  }

  // Check for SUPER TEAM (5 cards from the same team)
  const hasSuperTeam = Object.values(teamCounts).some((count) => count === 5)

  if (hasSuperTeam) {
    return { rank: 8, name: "SUPER TEAM" }
  }

  // Check for POWER FIVE (5 cards with consecutive power levels)
  const powerLevels = Object.keys(powerCounts)
    .map(Number)
    .sort((a, b) => a - b)
  const hasPowerFive = powerLevels.length === 5 && powerLevels[4] - powerLevels[0] === 4

  if (hasPowerFive) {
    return { rank: 7, name: "POWER FIVE" }
  }

  // Check for FANTASTIC FOUR (4 cards with the same power level)
  const hasFantasticFour = Object.values(powerCounts).some((count) => count === 4)

  if (hasFantasticFour) {
    return { rank: 6, name: "FANTASTIC FOUR" }
  }

  // Check for CIVIL WAR (3 of one power level + 2 of another power level)
  const powerCountValues = Object.values(powerCounts)
  const hasCivilWar = powerCountValues.length === 2 && powerCountValues.includes(3) && powerCountValues.includes(2)

  if (hasCivilWar) {
    return { rank: 5, name: "CIVIL WAR" }
  }

  // Check for TEAM-UP (3 cards with the same power level)
  const hasTeamUp = Object.values(powerCounts).some((count) => count === 3)

  if (hasTeamUp) {
    return { rank: 4, name: "TEAM-UP" }
  }

  // Check for DYNAMIC DUO (2 pairs of matching power levels)
  const pairs = Object.values(powerCounts).filter((count) => count === 2)
  const hasDynamicDuo = pairs.length === 2

  if (hasDynamicDuo) {
    return { rank: 3, name: "DYNAMIC DUO" }
  }

  // Check for HERO PAIR (2 cards with the same power level)
  const hasHeroPair = Object.values(powerCounts).some((count) => count === 2)

  if (hasHeroPair) {
    return { rank: 2, name: "HERO PAIR" }
  }

  // HIGH POWER (just the highest power card)
  return { rank: 1, name: "HIGH POWER" }
}
