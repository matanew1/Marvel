"use client"

import { motion } from "framer-motion"
import { CardComponent } from "./card"
import { useEffect, useState } from "react"
import type { Card } from "@/types/card"
import soundEffects from "@/utils/sound-effects"

interface CardAnimationProps {
  cards: Card[]
  onComplete?: () => void
}

export function CardAnimation({ cards = [], onComplete }: CardAnimationProps) {
  const [visibleCards, setVisibleCards] = useState<Card[]>([])

  useEffect(() => {
    if (!cards || cards.length === 0) {
      // If no cards, complete immediately
      onComplete?.()
      return
    }

    // Filter out any undefined cards
    const validCards = cards.filter((card) => card && typeof card === "object" && card.id !== undefined)

    // Animate cards appearing one by one
    let index = 0
    const interval = setInterval(() => {
      if (index < validCards.length) {
        setVisibleCards((prev) => [...prev, validCards[index]])
        soundEffects?.play("card", 0.3)
        index++
      } else {
        clearInterval(interval)
        onComplete?.()
      }
    }, 200)

    return () => clearInterval(interval)
  }, [cards, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full max-w-2xl max-h-96">
        {visibleCards.map((card, index) => (
          <motion.div
            key={`card-animation-${card?.id || index}`}
            className="absolute"
            initial={{
              x: Math.random() * 100 - 50,
              y: -300,
              rotate: Math.random() * 20 - 10,
              opacity: 0,
            }}
            animate={{
              x: (index - (visibleCards.length - 1) / 2) * 60,
              y: 0,
              rotate: (index - (visibleCards.length - 1) / 2) * 5,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: index * 0.1,
            }}
          >
            {card && <CardComponent card={card} size="large" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
