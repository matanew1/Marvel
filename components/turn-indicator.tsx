"use client"

import type { Player } from "@/types/player"
import { motion } from "framer-motion"

interface TurnIndicatorProps {
  currentPlayer: Player
  gameStatus: "setup" | "preflop" | "flop" | "turn" | "river" | "showdown"
  pot: number
  currentBet: number
}

export function TurnIndicator({ currentPlayer, gameStatus, pot, currentBet }: TurnIndicatorProps) {
  return (
    <motion.div
      className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="text-sm font-medium">
        {gameStatus !== "showdown" ? `${currentPlayer.name}'s Turn` : "Battle Complete"}
      </div>
      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
      <div className="text-sm">Total Power: {pot}</div>

      {gameStatus !== "showdown" && (
        <>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="text-sm">Current Commitment: {currentBet}</div>
        </>
      )}

      <div
        className={`w-2 h-2 rounded-full 
          ${gameStatus !== "showdown" ? "animate-pulse" : ""}
          ${currentPlayer.id === 1 || currentPlayer.id === 2 ? "bg-blue-500" : "bg-red-500"}
        `}
      ></div>
    </motion.div>
  )
}
