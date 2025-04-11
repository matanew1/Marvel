"use client"

import type { Player } from "@/types/player"
import { CardComponent } from "./card"
import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { Card } from "@/types/card"
import soundEffects from "@/utils/sound-effects"

interface PlayerHandProps {
  player: Player
  gamePhase: "deal" | "bet1" | "powers" | "swap" | "bet2" | "showdown"
  currentPlayer: number
  currentBet: number
  selectedCards: number[]
  handRanking?: { name: string; rank: number }
  onSelectCard: (index: number) => void
  onBet: (action: "check" | "bet" | "call" | "fold", amount?: number) => void
  onSwapCards: () => void
  onDragCard?: (card: Card) => void
}

export function PlayerHand({
  player,
  gamePhase,
  currentPlayer,
  currentBet,
  selectedCards,
  handRanking,
  onSelectCard,
  onBet,
  onSwapCards,
  onDragCard,
}: PlayerHandProps) {
  const [betAmount, setBetAmount] = useState<number>(currentBet > 0 ? currentBet * 2 : 10)
  const [animateChips, setAnimateChips] = useState(false)

  // Calculate how much the player needs to call
  const amountToCall = currentBet - player.bet

  // Determine if it's player's turn
  const isPlayerTurn = currentPlayer === player.id

  // Determine if player can take betting actions
  const canBet = (gamePhase === "bet1" || gamePhase === "bet2") && isPlayerTurn && !player.folded

  // Determine if player can swap cards
  const canSwap = gamePhase === "swap" && isPlayerTurn && selectedCards.length > 0

  // Determine if cards are draggable
  const cardsAreDraggable = gamePhase === "powers" && isPlayerTurn

  // Handle betting with animation
  const handleBet = (action: "check" | "bet" | "call" | "fold", amount?: number) => {
    if (action === "bet" || action === "call") {
      soundEffects?.play("chip")
      setAnimateChips(true)
      setTimeout(() => {
        setAnimateChips(false)
        onBet(action, amount)
      }, 500)
    } else {
      onBet(action, amount)
    }
  }

  // Handle card drag end
  const handleCardDragEnd = (card: Card) => {
    if (onDragCard) {
      soundEffects?.play("card")
      onDragCard(card)
    }
  }

  // Handle swap with sound
  const handleSwap = () => {
    soundEffects?.play("card")
    onSwapCards()
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden">
      {/* Chip animation */}
      {animateChips && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 border-yellow-300 shadow-lg"
              initial={{
                x: "50%",
                y: "100%",
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 80 + 10}%`,
                y: `${Math.random() * 50 + 25}%`,
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">Your Hand</h3>
          {handRanking && (
            <div className="bg-yellow-600/80 text-white px-2 py-0.5 rounded-full text-sm font-medium">
              {handRanking.name}
            </div>
          )}
        </div>
        <div className="text-sm bg-purple-900/60 px-2 py-1 rounded-full">Chips: {player.chips}</div>
      </div>

      {/* Cards */}
      <motion.div className="flex justify-center gap-3 py-3 min-h-[160px]" layout>
        {player.hand.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            layout
          >
            <CardComponent
              card={card}
              size="large"
              selected={selectedCards.includes(index)}
              onClick={() =>
                (gamePhase === "swap" || (gamePhase === "powers" && !cardsAreDraggable)) && isPlayerTurn
                  ? onSelectCard(index)
                  : undefined
              }
              draggable={cardsAreDraggable}
              onDragEnd={cardsAreDraggable ? handleCardDragEnd : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Betting controls */}
      {canBet && (
        <motion.div
          className="mt-4 flex flex-wrap gap-3 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Fold button */}
          <Button variant="destructive" onClick={() => handleBet("fold")} className="font-medium">
            Fold
          </Button>

          {/* Check/Call button */}
          {amountToCall === 0 ? (
            <Button variant="secondary" onClick={() => handleBet("check")} className="font-medium">
              Check
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => handleBet("call")} className="font-medium">
              Call {amountToCall}
            </Button>
          )}

          {/* Bet/Raise controls */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Slider
              value={[betAmount]}
              min={currentBet > 0 ? currentBet * 2 : 5}
              max={player.chips}
              step={5}
              onValueChange={(value) => setBetAmount(value[0])}
              className="w-32"
            />
            <Input
              type="number"
              min={currentBet > 0 ? currentBet * 2 : 5}
              max={player.chips}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-16 bg-black/30 text-white"
            />
            <Button
              variant="default"
              onClick={() => handleBet("bet", betAmount)}
              disabled={betAmount <= currentBet && currentBet > 0}
              className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 font-medium"
            >
              {currentBet > 0 ? "Raise" : "Bet"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Card swap controls */}
      {canSwap && (
        <motion.div className="mt-4 flex justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            onClick={handleSwap}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium"
          >
            Swap {selectedCards.length} Card{selectedCards.length !== 1 ? "s" : ""}
          </Button>
        </motion.div>
      )}

      {/* Waiting message */}
      {!isPlayerTurn && gamePhase !== "showdown" && (
        <div className="mt-4 text-center text-gray-300 italic">Waiting for other players...</div>
      )}
    </div>
  )
}
