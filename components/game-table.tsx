"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import type { Card } from "@/types/card"

interface GameTableProps {
  gamePhase: "deal" | "bet1" | "powers" | "swap" | "bet2" | "showdown"
  pot: number
  onCardDrop?: (card: Card) => void
}

export function GameTable({ gamePhase, pot, onCardDrop }: GameTableProps) {
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [chipAnimation, setChipAnimation] = useState(false)

  // Animate chips when pot changes
  if (pot > 0 && !chipAnimation) {
    setChipAnimation(true)
    setTimeout(() => setChipAnimation(false), 2000)
  }

  return (
    <motion.div
      className="flex-1 p-4 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`w-full max-w-2xl h-40 bg-gradient-to-b from-green-900 to-green-950 rounded-3xl border-4 ${
          isDropTarget ? "border-yellow-400 shadow-yellow-400/20" : "border-green-800"
        } shadow-xl flex items-center justify-center relative overflow-hidden`}
        animate={{
          boxShadow: isDropTarget ? "0 0 20px 5px rgba(250, 204, 21, 0.3)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (gamePhase === "powers" && onCardDrop) {
            setIsDropTarget(true)
          }
        }}
        onDragLeave={() => setIsDropTarget(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDropTarget(false)
          // The actual drop handling is in the card component
        }}
      >
        {/* Table pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_20%,_#000_20%,_#000_80%,_transparent_80%,_transparent)] bg-[length:20px_20px]"></div>
        </div>

        {/* Marvel logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="text-4xl font-black tracking-wider bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            MARVEL
          </div>
        </div>

        {/* Drop indicator */}
        {isDropTarget && (
          <motion.div
            className="absolute inset-0 border-2 border-dashed border-yellow-400 bg-yellow-400/10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black/70 px-3 py-1.5 rounded-lg text-yellow-400 font-medium">Drop to use power</div>
          </motion.div>
        )}

        {/* Chip animation */}
        {chipAnimation && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 border-yellow-300 shadow-lg"
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: "50%",
                  y: "50%",
                  scale: 1,
                  opacity: [0, 1, 1, 0],
                  transition: {
                    duration: 1.5,
                    times: [0, 0.3, 0.7, 1],
                    delay: i * 0.05,
                  },
                }}
              />
            ))}
          </div>
        )}

        {/* Pot display */}
        {pot > 0 && (
          <motion.div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1 rounded-full"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={pot} // Re-animate when pot changes
          >
            <span className="font-bold text-yellow-400">{pot} Chips</span>
          </motion.div>
        )}

        {/* Phase indicator */}
        <motion.div
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          key={gamePhase} // Re-animate when phase changes
        >
          {gamePhase === "bet1" && "First Betting Round"}
          {gamePhase === "powers" && "Hero Powers Phase"}
          {gamePhase === "swap" && "Card Swap Phase"}
          {gamePhase === "bet2" && "Final Betting Round"}
          {gamePhase === "showdown" && "Showdown!"}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
