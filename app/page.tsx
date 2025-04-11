"use client"

import { useState, useEffect, useCallback } from "react"
import { PlayerHand } from "@/components/player-hand"
import { PlayerInfo } from "@/components/player-info"
import { GameHeader } from "@/components/game-header"
import { GameTable } from "@/components/game-table"
import { PowerUsage } from "@/components/power-usage"
import { AudioPlayer } from "@/components/audio-player"
import { CardAnimation } from "@/components/card-animation"
import { ParticleEffects } from "@/components/particle-effects"
import type { Card } from "@/types/card"
import type { Player } from "@/types/player"
import { marvelDeck } from "@/data/cards"
import { evaluateHand } from "@/utils/hand-evaluator"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import soundEffects from "@/utils/sound-effects"

export default function GameDashboard() {
  // Game state
  const [gamePhase, setGamePhase] = useState<"deal" | "bet1" | "powers" | "swap" | "bet2" | "showdown">("deal")
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "You", chips: 500, bet: 0, hand: [], usedPower: false, folded: false },
    { id: 2, name: "Captain Marvel", chips: 500, bet: 0, hand: [], usedPower: false, folded: false },
    { id: 3, name: "Black Panther", chips: 500, bet: 0, hand: [], usedPower: false, folded: false },
    { id: 4, name: "Star-Lord", chips: 500, bet: 0, hand: [], usedPower: false, folded: false },
  ])
  const [currentPlayer, setCurrentPlayer] = useState<number>(1)
  const [deck, setDeck] = useState<Card[]>([])
  const [pot, setPot] = useState<number>(0)
  const [currentBet, setCurrentBet] = useState<number>(0)
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [powerTarget, setPowerTarget] = useState<number | null>(null)
  const [message, setMessage] = useState<string>("")
  const [handRankings, setHandRankings] = useState<{ id: number; name: string; rank: number }[]>([])

  // Animation states
  const [showDealAnimation, setShowDealAnimation] = useState(false)
  const [showParticles, setShowParticles] = useState<"win" | "power" | "showdown" | null>(null)
  const [dealtCards, setDealtCards] = useState<Card[]>([])

  // Initialize game
  useEffect(() => {
    if (gamePhase === "deal") {
      // Shuffle deck
      const shuffledDeck = [...marvelDeck].sort(() => Math.random() - 0.5)
      setDeck(shuffledDeck)

      // Prepare for deal animation - ensure we have valid cards
      const dealCards = shuffledDeck.slice(0, 20) // 5 cards for each of 4 players
      setDealtCards(dealCards || [])
      setShowDealAnimation(true)
      soundEffects?.play("deal")
    }
  }, [gamePhase])

  // Handle deal animation completion
  const handleDealComplete = useCallback(() => {
    setShowDealAnimation(false)

    // Deal 5 cards to each player
    const updatedPlayers = players.map((player, index) => {
      const startIdx = index * 5
      const hand = dealtCards.slice(startIdx, startIdx + 5).filter((card) => card !== undefined)
      return {
        ...player,
        hand,
        bet: 0,
        usedPower: false,
        folded: false,
      }
    })

    setPlayers(updatedPlayers)
    setDeck((prev) => prev.slice(20)) // Remove dealt cards from deck
    setGamePhase("bet1")
    setCurrentPlayer(1)
    setPot(0)
    setCurrentBet(0)
    setMessage("First betting round - place your bets!")
  }, [dealtCards, players])

  // Handle betting action
  const handleBet = (action: "check" | "bet" | "call" | "fold", amount?: number) => {
    const player = players.find((p) => p.id === currentPlayer)
    if (!player) return

    let updatedPlayers = [...players]
    let updatedPot = pot
    let updatedBet = currentBet

    switch (action) {
      case "check":
        if (currentBet > 0) return // Can't check if there's a bet
        break

      case "bet":
        if (!amount || amount <= 0) return

        // Update player's chips and bet
        updatedPlayers = players.map((p) => {
          if (p.id === currentPlayer) {
            return {
              ...p,
              chips: p.chips - amount,
              bet: p.bet + amount,
            }
          }
          return p
        })

        // Update pot and current bet
        updatedPot += amount
        updatedBet = Math.max(updatedBet, player.bet + amount)
        setMessage(`${player.name} bets ${amount} chips`)
        break

      case "call":
        const callAmount = currentBet - player.bet

        // Update player's chips and bet
        updatedPlayers = players.map((p) => {
          if (p.id === currentPlayer) {
            return {
              ...p,
              chips: p.chips - callAmount,
              bet: currentBet,
            }
          }
          return p
        })

        // Update pot
        updatedPot += callAmount
        setMessage(`${player.name} calls ${callAmount} chips`)
        break

      case "fold":
        // Mark player as folded
        updatedPlayers = players.map((p) => {
          if (p.id === currentPlayer) {
            return {
              ...p,
              folded: true,
            }
          }
          return p
        })
        setMessage(`${player.name} folds`)
        break
    }

    // Update state
    setPlayers(updatedPlayers)
    setPot(updatedPot)
    setCurrentBet(updatedBet)

    // Move to next player or phase
    moveToNextPlayerOrPhase(updatedPlayers, updatedBet)
  }

  // Move to next player or phase
  const moveToNextPlayerOrPhase = (updatedPlayers: Player[], updatedBet: number) => {
    // Check if betting round is complete
    const activePlayers = updatedPlayers.filter((p) => !p.folded)

    // If only one player remains, they win
    if (activePlayers.length === 1) {
      const winner = activePlayers[0]
      const finalPlayers = updatedPlayers.map((p) => {
        if (p.id === winner.id) {
          return {
            ...p,
            chips: p.chips + pot,
          }
        }
        return p
      })

      setPlayers(finalPlayers)
      setMessage(`${winner.name} wins ${pot} chips!`)
      setShowParticles("win")
      soundEffects?.play("win")
      setGamePhase("showdown")
      return
    }

    // Check if all active players have equal bets
    const allEqual = activePlayers.every((p) => p.bet === updatedBet)

    if (allEqual && activePlayers.every((p) => p.bet > 0 || currentPlayer !== p.id)) {
      // Move to next phase
      if (gamePhase === "bet1") {
        setGamePhase("powers")
        setCurrentPlayer(1)
        setMessage("Hero Power phase - use your character's special ability!")

        // Reset bets for next round
        const resetPlayers = updatedPlayers.map((p) => ({
          ...p,
          bet: 0,
        }))
        setPlayers(resetPlayers)
        setCurrentBet(0)
      } else if (gamePhase === "bet2") {
        // Evaluate hands and determine winner
        evaluateWinner(updatedPlayers)
      }
      return
    }

    // Find next active player
    let nextPlayer = currentPlayer
    do {
      nextPlayer = (nextPlayer % players.length) + 1
    } while (updatedPlayers.find((p) => p.id === nextPlayer)?.folded)

    setCurrentPlayer(nextPlayer)
  }

  // Handle hero power usage
  const useHeroPowerInner = useCallback(
    (targetPlayerId?: number) => {
      const player = players.find((p) => p.id === currentPlayer)
      if (!player || player.usedPower) return

      // Get the character's power from the first card (simplified)
      const character = player.hand[0]
      if (!character) return

      let updatedPlayers = [...players]
      const updatedDeck = [...deck]
      let powerMessage = ""

      // Some powers require a target
      if (powerTarget === null && needsTarget(character.name)) {
        setPowerTarget(targetPlayerId || 0)
        return
      }

      // Play power sound
      soundEffects?.play("power")
      setShowParticles("power")

      // Execute power based on character
      switch (character.name) {
        case "Iron Man":
          // Look at someone's hand
          if (targetPlayerId) {
            powerMessage = `${player.name} uses Iron Man's power to see ${players.find((p) => p.id === targetPlayerId)?.name}'s hand!`
          }
          break

        case "Captain America":
          // Block another player's power
          if (targetPlayerId) {
            updatedPlayers = players.map((p) => {
              if (p.id === targetPlayerId) {
                return {
                  ...p,
                  usedPower: true,
                }
              }
              return p
            })
            powerMessage = `${player.name} uses Captain America's power to block ${players.find((p) => p.id === targetPlayerId)?.name}'s power!`
          }
          break

        case "Thor":
          // Force discard
          if (targetPlayerId && selectedCards.length === 1) {
            const targetPlayer = players.find((p) => p.id === targetPlayerId)
            if (targetPlayer) {
              const cardIndex = selectedCards[0]
              const newCard = updatedDeck.pop()

              if (newCard) {
                const updatedHand = [...targetPlayer.hand]
                updatedHand.splice(cardIndex, 1, newCard)

                updatedPlayers = players.map((p) => {
                  if (p.id === targetPlayerId) {
                    return {
                      ...p,
                      hand: updatedHand,
                    }
                  }
                  return p
                })

                powerMessage = `${player.name} uses Thor's power to force ${targetPlayer.name} to discard a card!`
              }
            }
          }
          break

        case "Hulk":
          // Trade cards with deck
          if (selectedCards.length > 0) {
            const newCards = updatedDeck.splice(0, selectedCards.length)
            const playerHand = [...player.hand]

            selectedCards.forEach((cardIndex, i) => {
              if (newCards[i]) {
                playerHand[cardIndex] = newCards[i]
              }
            })

            updatedPlayers = players.map((p) => {
              if (p.id === currentPlayer) {
                return {
                  ...p,
                  hand: playerHand,
                }
              }
              return p
            })

            powerMessage = `${player.name} uses Hulk's power to swap ${selectedCards.length} cards!`
          }
          break

        case "Spider-Man":
          // Steal chips
          if (targetPlayerId) {
            const targetPlayer = players.find((p) => p.id === targetPlayerId)
            if (targetPlayer) {
              const stealAmount = Math.min(10, targetPlayer.chips)

              updatedPlayers = players.map((p) => {
                if (p.id === currentPlayer) {
                  return {
                    ...p,
                    chips: p.chips + stealAmount,
                  }
                }
                if (p.id === targetPlayerId) {
                  return {
                    ...p,
                    chips: p.chips - stealAmount,
                  }
                }
                return p
              })

              powerMessage = `${player.name} uses Spider-Man's power to steal ${stealAmount} chips from ${targetPlayer.name}!`
            }
          }
          break

        case "Doctor Strange":
          // Swap a card with any player
          if (targetPlayerId && selectedCards.length === 2) {
            const targetPlayer = players.find((p) => p.id === targetPlayerId)
            if (targetPlayer) {
              const playerCardIndex = selectedCards[0]
              const targetCardIndex = selectedCards[1]

              const playerHand = [...player.hand]
              const targetHand = [...targetPlayer.hand]

              // Swap cards
              const temp = playerHand[playerCardIndex]
              playerHand[playerCardIndex] = targetHand[targetCardIndex]
              targetHand[targetCardIndex] = temp

              updatedPlayers = players.map((p) => {
                if (p.id === currentPlayer) {
                  return {
                    ...p,
                    hand: playerHand,
                  }
                }
                if (p.id === targetPlayerId) {
                  return {
                    ...p,
                    hand: targetHand,
                  }
                }
                return p
              })

              powerMessage = `${player.name} uses Doctor Strange's power to swap cards with ${targetPlayer.name}!`
            }
          }
          break

        default:
          // Generic power
          powerMessage = `${player.name} uses ${character.name}'s power!`
      }

      // Mark power as used
      updatedPlayers = updatedPlayers.map((p) => {
        if (p.id === currentPlayer) {
          return {
            ...p,
            usedPower: true,
          }
        }
        return p
      })

      // Update state
      setPlayers(updatedPlayers)
      setDeck(updatedDeck)
      setMessage(powerMessage)
      setPowerTarget(null)
      setSelectedCards([])

      // Move to next player
      let nextPlayer = currentPlayer
      do {
        nextPlayer = (nextPlayer % players.length) + 1

        // If we've gone through all players, move to next phase
        if (nextPlayer === 1) {
          setGamePhase("swap")
          setMessage("Card swap phase - select up to 3 cards to discard")
          return
        }
      } while (updatedPlayers.find((p) => p.id === nextPlayer)?.folded)

      setCurrentPlayer(nextPlayer)
    },
    [currentPlayer, deck, players, powerTarget, selectedCards],
  )

  const useHeroPower = useCallback(
    (playerId: number | undefined) => {
      if (gamePhase === "powers" && currentPlayer === 1) {
        useHeroPowerInner(playerId)
      }
    },
    [currentPlayer, gamePhase, useHeroPowerInner],
  )

  // Check if a power needs a target
  const needsTarget = (characterName: string): boolean => {
    return ["Iron Man", "Captain America", "Thor", "Spider-Man", "Doctor Strange"].includes(characterName)
  }

  // Handle card selection (for swapping or power usage)
  const handleCardSelect = (cardIndex: number) => {
    if (gamePhase !== "swap" && gamePhase !== "powers") return

    if (selectedCards.includes(cardIndex)) {
      setSelectedCards(selectedCards.filter((i) => i !== cardIndex))
    } else {
      // Limit to 3 cards for swap phase
      if (gamePhase === "swap" && selectedCards.length >= 3) return

      setSelectedCards([...selectedCards, cardIndex])
    }
  }

  // Handle card swapping
  const handleSwapCards = () => {
    if (gamePhase !== "swap" || selectedCards.length === 0) return

    const player = players.find((p) => p.id === currentPlayer)
    if (!player) return

    // Draw new cards from deck
    const newCards = deck.slice(0, selectedCards.length)
    const updatedDeck = deck.slice(selectedCards.length)

    // Replace selected cards
    const updatedHand = [...player.hand]
    selectedCards.forEach((cardIndex, i) => {
      if (newCards[i]) {
        updatedHand[cardIndex] = newCards[i]
      }
    })

    // Update player's hand
    const updatedPlayers = players.map((p) => {
      if (p.id === currentPlayer) {
        return {
          ...p,
          hand: updatedHand,
        }
      }
      return p
    })

    // Update state
    setPlayers(updatedPlayers)
    setDeck(updatedDeck)
    setSelectedCards([])
    setMessage(`${player.name} swapped ${selectedCards.length} cards`)

    // Move to next player or phase
    let nextPlayer = currentPlayer
    do {
      nextPlayer = (nextPlayer % players.length) + 1

      // If we've gone through all players, move to next phase
      if (nextPlayer === 1) {
        setGamePhase("bet2")
        setMessage("Final betting round!")
        return
      }
    } while (updatedPlayers.find((p) => p.id === nextPlayer)?.folded)

    setCurrentPlayer(nextPlayer)
  }

  // Skip power usage
  const skipPower = () => {
    if (gamePhase !== "powers") return

    const player = players.find((p) => p.id === currentPlayer)
    if (!player) return

    // Mark power as used
    const updatedPlayers = players.map((p) => {
      if (p.id === currentPlayer) {
        return {
          ...p,
          usedPower: true,
        }
      }
      return p
    })

    setPlayers(updatedPlayers)
    setMessage(`${player.name} skips using their power`)

    // Move to next player or phase
    let nextPlayer = currentPlayer
    do {
      nextPlayer = (nextPlayer % players.length) + 1

      // If we've gone through all players, move to next phase
      if (nextPlayer === 1) {
        setGamePhase("swap")
        setMessage("Card swap phase - select up to 3 cards to discard")
        return
      }
    } while (updatedPlayers.find((p) => p.id === nextPlayer)?.folded)

    setCurrentPlayer(nextPlayer)
  }

  // Handle card drag
  const handleCardDrag = (card: Card) => {
    if (gamePhase === "powers" && currentPlayer === 1) {
      // Find the card index in the player's hand
      const player = players.find((p) => p.id === 1)
      if (!player) return

      const cardIndex = player.hand.findIndex((c) => c.id === card.id)
      if (cardIndex !== -1) {
        handleCardSelect(cardIndex)
        useHeroPower(undefined)
      }
    }
  }

  // Evaluate winner at showdown
  const evaluateWinner = (currentPlayers: Player[]) => {
    // Only evaluate non-folded players
    const activePlayers = currentPlayers.filter((p) => !p.folded)

    // Evaluate each player's hand
    const evaluations = activePlayers.map((player) => {
      const { rank, name } = evaluateHand(player.hand)
      return {
        id: player.id,
        rank,
        name,
      }
    })

    // Find highest rank
    const highestRank = Math.max(...evaluations.map((e) => e.rank))
    const winners = evaluations.filter((e) => e.rank === highestRank)

    // Split pot among winners
    const winAmount = Math.floor(pot / winners.length)

    const finalPlayers = currentPlayers.map((player) => {
      if (winners.some((w) => w.id === player.id)) {
        return {
          ...player,
          chips: player.chips + winAmount,
        }
      }
      return player
    })

    // Update state
    setPlayers(finalPlayers)
    setHandRankings(evaluations)

    // Create message
    if (winners.length === 1) {
      const winner = finalPlayers.find((p) => p.id === winners[0].id)
      setMessage(`${winner?.name} wins with ${winners[0].name}! (${winAmount} chips)`)
    } else {
      const winnerNames = winners.map((w) => finalPlayers.find((p) => p.id === w.id)?.name).join(" and ")
      setMessage(`Tie between ${winnerNames} with ${winners[0].name}! (${winAmount} chips each)`)
    }

    // Show win animation
    setShowParticles("showdown")
    soundEffects?.play("win")
    setGamePhase("showdown")
  }

  // Start a new game
  const startNewGame = () => {
    setGamePhase("deal")
  }

  // Get the current player object
  const activePlayer = players.find((p) => p.id === currentPlayer) || players[0]

  const handleHeroPowerClick = useCallback(
    (playerId: number | undefined) => {
      if (powerTarget === null && gamePhase === "powers" && currentPlayer === 1) {
        useHeroPower(playerId)
      }
    },
    [currentPlayer, gamePhase, powerTarget, useHeroPower],
  )

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-red-900 to-purple-900 text-white overflow-hidden">
      {/* Background music */}
      <AudioPlayer src="/sounds/background-music.mp3" />

      {/* Game header */}
      <GameHeader gamePhase={gamePhase} pot={pot} currentPlayer={activePlayer} message={message} />

      {/* Opponents */}
      <div className="flex justify-around p-2">
        {players
          .filter((p) => p.id !== 1) // Filter out the human player
          .map((player) => (
            <PlayerInfo
              key={player.id}
              player={player}
              gamePhase={gamePhase}
              currentPlayer={currentPlayer}
              showCards={gamePhase === "showdown"}
              handRanking={handRankings.find((r) => r.id === player.id)}
              onSelectPlayer={() => handleHeroPowerClick(player.id)}
            />
          ))}
      </div>

      {/* Game table */}
      <GameTable gamePhase={gamePhase} pot={pot} onCardDrop={handleCardDrag} />

      {/* Power usage UI (only shown during power phase) */}
      {gamePhase === "powers" && currentPlayer === 1 && (
        <PowerUsage
          player={players[0]}
          selectedCards={selectedCards}
          powerTarget={powerTarget}
          onUseHeroPower={useHeroPower}
          onSkipPower={skipPower}
        />
      )}

      {/* Player's hand and actions */}
      <div className="p-4">
        <PlayerHand
          player={players[0]}
          gamePhase={gamePhase}
          currentPlayer={currentPlayer}
          currentBet={currentBet}
          selectedCards={selectedCards}
          handRanking={handRankings.find((r) => r.id === 1)}
          onSelectCard={handleCardSelect}
          onBet={handleBet}
          onSwapCards={handleSwapCards}
          onDragCard={handleCardDrag}
        />
      </div>

      {/* New game button (only shown at showdown) */}
      {gamePhase === "showdown" && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            size="lg"
            onClick={startNewGame}
            className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold"
          >
            Play Again
          </Button>
        </motion.div>
      )}

      {/* Deal animation */}
      <AnimatePresence>
        {showDealAnimation && <CardAnimation cards={dealtCards} onComplete={handleDealComplete} />}
      </AnimatePresence>

      {/* Particle effects */}
      <AnimatePresence>
        {showParticles && <ParticleEffects type={showParticles} onComplete={() => setShowParticles(null)} />}
      </AnimatePresence>
    </div>
  )
}
