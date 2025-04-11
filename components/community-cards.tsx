"use client"

import type { Card } from "@/types/card"
import { CardComponent } from "./card"
import { motion } from "framer-motion"

interface CommunityCardsProps {
  cards: Card[]
  gameStatus: "setup" | "preflop" | "flop" | "turn" | "river" | "showdown"
}

export function CommunityCards({ cards, gameStatus }: CommunityCardsProps) {
  // Get stage name for display
  const getStageName = () => {
    switch (gameStatus) {
      case "preflop":
        return "Pre-Battle"
      case "flop":
        return "First Wave"
      case "turn":
        return "Reinforcements"
      case "river":
        return "Final Stand"
      case "showdown":
        return "Battle Outcome"
      default:
        return ""
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-2 font-bold">{getStageName()}</div>

      <div className="bg-purple-950/50 rounded-xl p-6 flex justify-center">
        {cards.length === 0 ? (
          <div className="text-gray-400 italic">Waiting for heroes to join the battle...</div>
        ) : (
          <div className="flex gap-2 flex-wrap justify-center">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                className="w-[80px]"
                initial={{ y: 20, opacity: 0, rotateY: 180 }}
                animate={{ y: 0, opacity: 1, rotateY: 0 }}
                transition={{ delay: index * 0.2, type: "spring" }}
              >
                <CardComponent card={card} size="medium" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
