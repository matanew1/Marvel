"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
}

export function AudioPlayer({ src, autoPlay = true }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [volume, setVolume] = useState(0.5)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio

    // Play if autoPlay is true
    if (autoPlay) {
      // Need to handle autoplay restrictions
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, set state to reflect this
          setIsPlaying(false)
        })
      }
    }

    // Cleanup
    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [src, autoPlay])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {
          // Play was prevented
          setIsPlaying(false)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <div
        className={`bg-black/60 backdrop-blur-sm rounded-full p-1.5 transition-all duration-300 flex items-center ${
          showVolumeControl ? "w-36" : "w-10"
        }`}
        onMouseEnter={() => setShowVolumeControl(true)}
        onMouseLeave={() => setShowVolumeControl(false)}
      >
        {showVolumeControl && (
          <div className="w-20 mx-2">
            <Slider
              value={[volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full bg-purple-800/50 hover:bg-purple-700/50 text-white"
          onClick={togglePlay}
        >
          {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
