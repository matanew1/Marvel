import type { Card } from "./card"

export interface Player {
  id: number
  name: string
  chips: number
  bet: number
  hand: Card[]
  usedPower: boolean
  folded: boolean
}
