"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ParticleEffectsProps {
  type: "win" | "power" | "showdown"
  duration?: number
  onComplete?: () => void
}

export function ParticleEffects({ type, duration = 2000, onComplete }: ParticleEffectsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const particleCount = type === "win" ? 100 : type === "showdown" ? 50 : 30

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")

      // Set particle styles based on type
      particle.style.position = "absolute"
      particle.style.width = `${Math.random() * 10 + 5}px`
      particle.style.height = particle.style.width

      if (type === "win") {
        particle.style.backgroundColor = ["#FFD700", "#FFA500", "#FF4500"][Math.floor(Math.random() * 3)]
        particle.style.borderRadius = "50%"
      } else if (type === "power") {
        particle.style.backgroundColor = ["#4B0082", "#8A2BE2", "#9400D3"][Math.floor(Math.random() * 3)]
        particle.style.borderRadius = "2px"
      } else {
        particle.style.backgroundColor = ["#DC143C", "#B22222", "#8B0000"][Math.floor(Math.random() * 3)]
        particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px"
      }

      // Random starting position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      // Add to container
      container.appendChild(particle)

      // Animate
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 300 + 50
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = elapsed / duration

        if (progress < 1) {
          const x = Number.parseFloat(particle.style.left) + (Math.cos(angle) * speed * progress) / 100
          const y =
            Number.parseFloat(particle.style.top) +
            (Math.sin(angle) * speed * progress) / 100 -
            (type === "win" ? 200 * Math.pow(progress, 2) : 0)

          particle.style.left = `${x}%`
          particle.style.top = `${y}%`
          particle.style.opacity = (1 - progress).toString()

          requestAnimationFrame(animate)
        } else {
          particle.remove()
        }
      }

      requestAnimationFrame(animate)
    }

    // Cleanup
    const timer = setTimeout(() => {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      onComplete?.()
    }, duration)

    return () => {
      clearTimeout(timer)
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }, [type, duration, onComplete])

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )
}
