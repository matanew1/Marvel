"use client"

import type { Player } from "@/types/player"
import { motion } from "framer-motion"

interface GameHeaderProps {
  gamePhase: "deal" | "bet1" | "powers" | "swap" | "bet2" | "showdown"
  pot: number
  currentPlayer: Player
  message: string
}

export function GameHeader({ gamePhase, pot, currentPlayer, message }: GameHeaderProps) {
  // Get phase name
  const getPhaseName = () => {
    switch (gamePhase) {
      case "deal":
        return "Dealing Cards"
      case "bet1":
        return "First Betting Round"
      case "powers":
        return "Hero Powers"
      case "swap":
        return "Card Swap"
      case "bet2":
        return "Final Betting"
      case "showdown":
        return "Showdown"
      default:
        return ""
    }
  }

  return (
    <header className="p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <motion.h1
          className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          MARVEL BATTLE POKER
        </motion.h1>

        <motion.div
          className="flex items-center gap-3 bg-black/50 px-3 py-1.5 rounded-lg"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="text-sm font-medium">{getPhaseName()}</div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="text-sm font-bold">Pot: {pot}</div>
        </motion.div>
      </div>

      {/* Game message */}
      <motion.div
        className="bg-black/30 backdrop-blur-sm text-center py-2 rounded-lg text-white"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={message} // Re-animate when message changes
      >
        {message}
      </motion.div>
    </header>
  )
}
