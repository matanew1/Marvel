"use client"

import type { Player } from "@/types/player"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface PowerUsageProps {
  player: Player
  selectedCards: number[]
  powerTarget: number | null
  onUseHeroPower: (targetId?: number) => void
  onSkipPower: () => void
}

export function PowerUsage({ player, selectedCards, powerTarget, onUseHeroPower, onSkipPower }: PowerUsageProps) {
  // Get the character's power from the first card (simplified)
  const character = player.hand[0]
  if (!character) return null

  // Get power description
  const getPowerDescription = () => {
    switch (character.name) {
      case "Iron Man":
        return "Look at another player's hand"
      case "Captain America":
        return "Block another player's power"
      case "Thor":
        return "Force a player to discard a card (select their card)"
      case "Hulk":
        return "Trade cards with the deck (select cards to swap)"
      case "Spider-Man":
        return "Steal 10 chips from another player"
      case "Doctor Strange":
        return "Swap a card with any player (select your card, then theirs)"
      default:
        return `Use ${character.name}'s special power`
    }
  }

  // Check if power is ready to use
  const isPowerReady = () => {
    if (player.usedPower) return false

    switch (character.name) {
      case "Iron Man":
      case "Captain America":
      case "Spider-Man":
        return powerTarget !== null
      case "Thor":
        return powerTarget !== null && selectedCards.length === 1
      case "Hulk":
        return selectedCards.length > 0
      case "Doctor Strange":
        return powerTarget !== null && selectedCards.length === 2
      default:
        return true
    }
  }

  // Get instruction text
  const getInstructionText = () => {
    switch (character.name) {
      case "Iron Man":
      case "Captain America":
      case "Spider-Man":
        return "Select a player to target"
      case "Thor":
        return powerTarget === null ? "Select a player to target" : "Select a card to discard"
      case "Hulk":
        return "Select cards to swap with the deck"
      case "Doctor Strange":
        return powerTarget === null ? "Select your card, then select a player" : "Select opponent's card to swap"
      default:
        return "Use your power"
    }
  }

  // Handle use power button click
  const handleUsePower = () => {
    onUseHeroPower(powerTarget || undefined)
  }

  return (
    <motion.div
      className="mx-auto max-w-md bg-black/60 backdrop-blur-sm rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">Hero Power</h3>
        <div className="text-sm font-medium bg-gradient-to-r from-yellow-500 to-red-500 text-white px-2 py-0.5 rounded-full">
          {character.name}
        </div>
      </div>

      <div className="mb-4 text-sm">
        <div className="font-medium mb-1">Power:</div>
        <div className="bg-purple-900/40 p-2 rounded-md">{getPowerDescription()}</div>
      </div>

      <div className="text-sm text-gray-300 mb-4">{getInstructionText()}</div>

      <div className="flex justify-center gap-3">
        <Button
          onClick={handleUsePower}
          disabled={!isPowerReady()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Use Power
        </Button>

        <Button variant="outline" onClick={onSkipPower}>
          Skip
        </Button>
      </div>
    </motion.div>
  )
}
