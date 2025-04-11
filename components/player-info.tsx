"use client"

import type { Player } from "@/types/player"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { CardComponent } from "./card"
import { Badge } from "@/components/ui/badge"

interface PlayerInfoProps {
  player: Player
  gamePhase: "deal" | "bet1" | "powers" | "swap" | "bet2" | "showdown"
  currentPlayer: number
  showCards: boolean
  handRanking?: { name: string; rank: number }
  onSelectPlayer?: () => void
}

export function PlayerInfo({
  player,
  gamePhase,
  currentPlayer,
  showCards,
  handRanking,
  onSelectPlayer,
}: PlayerInfoProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Is it this player's turn?
  const isPlayerTurn = currentPlayer === player.id

  // Get team counts for team bonus display
  const getTeamCounts = () => {
    const teams: Record<string, number> = {}

    player.hand.forEach((card) => {
      teams[card.team] = (teams[card.team] || 0) + 1
    })

    return Object.entries(teams)
      .filter(([_, count]) => count >= 3)
      .map(([team, count]) => ({ team, count }))
  }

  const teamBonuses = getTeamCounts()

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 p-3 rounded-lg ${player.folded ? "opacity-50" : ""} 
        ${isPlayerTurn ? "bg-yellow-900/40 ring-2 ring-yellow-500" : "bg-black/30"}
        ${onSelectPlayer ? "cursor-pointer hover:bg-purple-900/40" : ""}
      `}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onSelectPlayer}
      whileHover={onSelectPlayer ? { scale: 1.05 } : {}}
    >
      <div className="flex items-center gap-2">
        <Avatar className={`h-10 w-10 border-2 ${isPlayerTurn ? "border-yellow-500" : "border-gray-700"}`}>
          <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${getInitials(player.name)}`} alt={player.name} />
          <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
        </Avatar>

        <div>
          <div className="text-sm font-bold">{player.name}</div>
          <div className="flex items-center gap-2 text-xs">
            {player.folded ? (
              <span className="text-red-400">Folded</span>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
                Chips: {player.chips}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Team bonuses */}
      {teamBonuses.length > 0 && (
        <div className="flex gap-1 mt-1">
          {teamBonuses.map(({ team, count }) => (
            <Badge
              key={team}
              variant="outline"
              className="text-xs py-0 px-1.5 bg-purple-900/60 border-purple-500 text-white"
            >
              {team} {count}
            </Badge>
          ))}
        </div>
      )}

      {/* Player's cards */}
      <div className="flex gap-1 mt-1">
        {player.hand.map((card, index) => (
          <div key={index}>
            <CardComponent card={card} size="small" faceDown={!showCards} />
          </div>
        ))}
      </div>

      {/* Show hand ranking at showdown */}
      {gamePhase === "showdown" && handRanking && !player.folded && (
        <div className="text-xs font-bold mt-1 bg-yellow-600/80 px-2 py-0.5 rounded-full">{handRanking.name}</div>
      )}

      {/* Power usage indicator */}
      {gamePhase === "powers" && (
        <div className={`text-xs ${player.usedPower ? "text-gray-400" : "text-green-400"}`}>
          {player.usedPower ? "Power Used" : "Power Available"}
        </div>
      )}
    </motion.div>
  )
}
