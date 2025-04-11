"use client"

import { useState } from "react"
import type { Card } from "@/types/card"
import type { Player } from "@/types/player"
import { CardComponent } from "./card"
import { motion } from "framer-motion"
import { DropIndicator } from "./drop-indicator"

interface GameBoardProps {
  board: Card[][]
  laneScores: {
    team1: number[]
    team2: number[]
  }
  onPlayCard: (card: Card, laneIndex: number) => void
  currentPlayer: Player
  gameStatus: "setup" | "playing" | "finished"
}

export function GameBoard({ board, laneScores, onPlayCard, currentPlayer, gameStatus }: GameBoardProps) {
  const [activeLane, setActiveLane] = useState<number | null>(null)
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)

  // Handle drag start
  const handleDragStart = (card: Card) => {
    setDraggedCard(card)
  }

  // Handle drag over lane
  const handleDragOver = (laneIndex: number) => {
    setActiveLane(laneIndex)
  }

  // Handle drag end
  const handleDragEnd = () => {
    if (draggedCard && activeLane !== null) {
      onPlayCard(draggedCard, activeLane)
    }

    setDraggedCard(null)
    setActiveLane(null)
  }

  // Determine lane winner
  const getLaneWinner = (laneIndex: number) => {
    const team1Score = laneScores.team1[laneIndex]
    const team2Score = laneScores.team2[laneIndex]

    if (team1Score > team2Score) return 1
    if (team2Score > team1Score) return 2
    return 0 // Tie
  }

  return (
    <div className="grid grid-cols-3 gap-2 h-full">
      {board.map((lane, laneIndex) => (
        <motion.div
          key={laneIndex}
          className={`relative flex flex-col bg-black/30 rounded-lg p-2 h-full
            ${activeLane === laneIndex ? "border-2 border-yellow-400" : "border border-gray-700"}
          `}
          onDragOver={(e) => {
            e.preventDefault()
            handleDragOver(laneIndex)
          }}
          onDragLeave={() => setActiveLane(null)}
          onDrop={handleDragEnd}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: laneIndex * 0.1 }}
        >
          {/* Lane title */}
          <div className="text-center mb-2 font-bold text-sm">Lane {laneIndex + 1}</div>

          {/* Team 2 cards (top) */}
          <div className="flex-1 flex flex-col items-center gap-1 mb-2">
            {lane
              .filter((card) => {
                const player = currentPlayer.id === card.playerId ? currentPlayer : undefined
                return player?.team === 2
              })
              .map((card) => (
                <div key={card.id} className="w-full max-w-[80px]">
                  <CardComponent card={card} size="small" />
                </div>
              ))}
          </div>

          {/* Lane scores */}
          <div className="flex justify-between items-center py-1 px-2 bg-black/50 rounded mb-2">
            <div className={`font-bold ${getLaneWinner(laneIndex) === 1 ? "text-green-400" : ""}`}>
              {laneScores.team1[laneIndex]}
            </div>
            <div className="text-xs">vs</div>
            <div className={`font-bold ${getLaneWinner(laneIndex) === 2 ? "text-green-400" : ""}`}>
              {laneScores.team2[laneIndex]}
            </div>
          </div>

          {/* Team 1 cards (bottom) */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {lane
              .filter((card) => {
                const player = currentPlayer.id === card.playerId ? currentPlayer : undefined
                return player?.team === 1
              })
              .map((card) => (
                <div key={card.id} className="w-full max-w-[80px]">
                  <CardComponent card={card} size="small" />
                </div>
              ))}
          </div>

          {/* Drop indicator */}
          {activeLane === laneIndex && <DropIndicator />}

          {/* Lane status for finished game */}
          {gameStatus === "finished" && (
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-lg
              ${getLaneWinner(laneIndex) === 1 ? "bg-blue-500/30" : ""}
              ${getLaneWinner(laneIndex) === 2 ? "bg-red-500/30" : ""}
              ${getLaneWinner(laneIndex) === 0 ? "bg-gray-500/30" : ""}
            `}
            >
              <div className="bg-black/70 px-3 py-1 rounded-full text-sm font-bold">
                {getLaneWinner(laneIndex) === 1 ? "Team 1 Wins" : ""}
                {getLaneWinner(laneIndex) === 2 ? "Team 2 Wins" : ""}
                {getLaneWinner(laneIndex) === 0 ? "Tie" : ""}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
