// Type for a single CheckIn
export type CheckIn = {
  id: string
  cycleId: string
  date: Date
  createdAt: Date
}

// Type for a Cycle
export type Cycle = {
  id: string
  name: string
  description: string | null
  emoji: string
  createdAt: Date
  updatedAt: Date
}

// Type for a Cycle with its CheckIns
export type CycleWithCheckIns = Cycle & {
  checkIns: CheckIn[]
}
