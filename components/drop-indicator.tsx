"use client"

import { motion } from "framer-motion"

export function DropIndicator() {
  return (
    <motion.div
      className="absolute inset-0 border-2 border-dashed border-yellow-400 rounded-lg bg-yellow-400/10 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-black/70 px-2 py-1 rounded text-xs font-medium text-yellow-400">Drop to play card</div>
    </motion.div>
  )
}
