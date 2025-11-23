'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'
import type { CycleWithCheckIns } from './types'

// Cycle Actions
export async function createCycle(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const emoji = formData.get('emoji') as string

  if (!name || name.trim() === '') {
    return { error: 'Name is required' }
  }

  try {
    await prisma.cycle.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        emoji: emoji || '🎯',
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creating cycle:', error)
    return { error: 'Failed to create cycle' }
  }
}

export async function getAllCycles(): Promise<CycleWithCheckIns[]> {
  try {
    const cycles = await prisma.cycle.findMany({
      include: {
        checkIns: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return cycles as CycleWithCheckIns[]
  } catch (error) {
    console.error('Error fetching cycles:', error)
    return []
  }
}

export async function getCycleById(id: string) {
  try {
    return await prisma.cycle.findUnique({
      where: { id },
      include: {
        checkIns: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching cycle:', error)
    return null
  }
}

// Check-in Actions
export async function checkInToday(cycleId: string) {
  try {
    // Get today's date at midnight (local time)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already checked in today
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        cycleId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    if (existingCheckIn) {
      return { error: 'Already checked in today' }
    }

    await prisma.checkIn.create({
      data: {
        cycleId,
        date: today,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error checking in:', error)
    return { error: 'Failed to check in' }
  }
}

// Analytics Actions
export async function getAnalytics() {
  try {
    const cycles = await prisma.cycle.findMany({
      include: {
        checkIns: true,
      },
    })

    const totalCheckIns = cycles.reduce((sum: number, cycle: CycleWithCheckIns) => sum + cycle.checkIns.length, 0)

    // Calculate streak consistency score (0-100)
    // Based on average check-ins per cycle relative to 7 days
    const avgCheckInsPerCycle = cycles.length > 0 ? totalCheckIns / cycles.length : 0
    const consistencyScore = Math.min(100, Math.round((avgCheckInsPerCycle / 7) * 100))

    // Calculate completion rate
    const totalPossibleCheckIns = cycles.length * 7
    const completionRate = totalPossibleCheckIns > 0
      ? Math.round((totalCheckIns / totalPossibleCheckIns) * 100)
      : 0

    // Find best performing cycle
    const bestCycle = cycles.reduce((best: CycleWithCheckIns, current: CycleWithCheckIns) => {
      const currentRate = current.checkIns.length
      const bestRate = best?.checkIns.length || 0
      return currentRate > bestRate ? current : best
    }, cycles[0])

    // Prepare data for chart (last 7 days)
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      date.setHours(0, 0, 0, 0)

      const checkInsOnDay = cycles.reduce((count: number, cycle: CycleWithCheckIns) => {
        const checkInsForDay = cycle.checkIns.filter(checkIn => {
          const checkInDate = new Date(checkIn.date)
          checkInDate.setHours(0, 0, 0, 0)
          return checkInDate.getTime() === date.getTime()
        }).length
        return count + checkInsForDay
      }, 0)

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: checkInsOnDay,
      }
    })

    return {
      totalCheckIns,
      consistencyScore,
      completionRate,
      bestCycle: bestCycle ? {
        name: bestCycle.name,
        emoji: bestCycle.emoji,
        checkInCount: bestCycle.checkIns.length,
      } : null,
      chartData,
      totalCycles: cycles.length,
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return {
      totalCheckIns: 0,
      consistencyScore: 0,
      completionRate: 0,
      bestCycle: null,
      chartData: [],
      totalCycles: 0,
    }
  }
}

