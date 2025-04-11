"use client"

import type { Card as CardType } from "@/types/card"
import { motion, useMotionValue, useTransform } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface CardProps {
  card: CardType
  size?: "small" | "medium" | "large"
  selected?: boolean
  onClick?: () => void
  faceDown?: boolean
  draggable?: boolean
  onDragEnd?: (card: CardType) => void
}

export function CardComponent({
  card,
  size = "medium",
  selected = false,
  onClick,
  faceDown = false,
  draggable = false,
  onDragEnd,
}: CardProps) {
  const [isDragging, setIsDragging] = useState(false)

  // Motion values for drag
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-100, 0, 100], [-10, 0, 10])

  // Size classes
  const sizeClasses = {
    small: "w-[60px] h-[84px] text-xs",
    medium: "w-[80px] h-[112px] text-sm",
    large: "w-[100px] h-[140px]",
  }

  // Get team color
  const getTeamColor = () => {
    switch (card.team) {
      case "Avengers":
        return "from-blue-600 to-blue-800 border-blue-400"
      case "X-Men":
        return "from-yellow-600 to-yellow-800 border-yellow-400"
      case "Guardians":
        return "from-purple-600 to-purple-800 border-purple-400"
      case "Villains":
        return "from-red-600 to-red-800 border-red-400"
      case "Mystic":
        return "from-green-600 to-green-800 border-green-400"
      default:
        return "from-gray-600 to-gray-800 border-gray-400"
    }
  }

  // Get power level color
  const getPowerColor = () => {
    if (card.power >= 8) return "bg-red-600"
    if (card.power >= 5) return "bg-orange-500"
    return "bg-yellow-500"
  }

  // Handle drag end
  const handleDragEnd = () => {
    if (onDragEnd && isDragging) {
      onDragEnd(card)
    }
    setIsDragging(false)
  }

  return (
    <motion.div
      className={cn(
        sizeClasses[size],
        "relative rounded-lg overflow-hidden select-none",
        selected && "ring-4 ring-yellow-400 transform -translate-y-2",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "z-50",
      )}
      whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.2 } }}
      animate={selected ? { y: -10, scale: 1.05 } : { y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={!draggable ? onClick : undefined}
      style={{ x, y, rotate, zIndex: isDragging ? 50 : 1 }}
      drag={draggable}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.7}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.1, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
    >
      {faceDown ? (
        // Card back
        <div className="absolute inset-0 bg-gradient-to-b from-red-800 to-red-950 border-2 border-red-700 rounded-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-lg border-2 border-red-600 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=60&width=60&text=M"
                alt="Marvel"
                width={60}
                height={60}
                className="opacity-70"
              />
            </div>
          </div>
        </div>
      ) : (
        // Card front
        <div className={`absolute inset-0 bg-gradient-to-b ${getTeamColor()} border-2 rounded-lg shadow-lg`}>
          {/* Card image */}
          <div className="absolute inset-0 opacity-60">
            <Image
              src={`/placeholder.svg?height=140&width=100&text=${card.name}`}
              alt={card.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Card content overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col">
            {/* Card name */}
            <div className="text-center font-bold text-white text-xs px-1 py-0.5 bg-black/60 truncate">{card.name}</div>

            {/* Card power level */}
            <div
              className={`absolute top-1 left-1 ${getPowerColor()} rounded-full w-5 h-5 flex items-center justify-center font-bold text-white text-xs`}
            >
              {card.power}
            </div>

            {/* Card team */}
            <div className="absolute bottom-1 left-1 right-1 text-center text-xs font-medium text-white bg-black/60 rounded-sm truncate">
              {card.team}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
