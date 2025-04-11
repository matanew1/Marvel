class SoundEffects {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private muted = false

  constructor() {
    // Pre-load common sounds
    this.preload("card", "/sounds/card-flip.mp3")
    this.preload("chip", "/sounds/chip-sound.mp3")
    this.preload("win", "/sounds/win-sound.mp3")
    this.preload("power", "/sounds/power-sound.mp3")
    this.preload("deal", "/sounds/deal-sound.mp3")
  }

  preload(name: string, src: string) {
    const audio = new Audio()
    audio.src = src
    audio.preload = "auto"
    this.sounds.set(name, audio)
  }

  play(name: string, volume = 0.5) {
    if (this.muted) return

    const sound = this.sounds.get(name)
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement
      clone.volume = volume
      clone.play().catch(() => {
        // Ignore errors from browsers that block autoplay
      })
    } else {
      console.warn(`Sound "${name}" not found`)
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
  }

  isMuted() {
    return this.muted
  }
}

// Create a singleton instance
const soundEffects = typeof window !== "undefined" ? new SoundEffects() : null

export default soundEffects
