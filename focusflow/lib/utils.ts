// Helper function to calculate current streak for a cycle
export function calculateStreak(checkIns: { date: Date | string }[]): number {
  if (checkIns.length === 0) return 0

  const sortedCheckIns = checkIns
    .map(c => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedCheckIns.length; i++) {
    const checkInDate = new Date(sortedCheckIns[i])
    checkInDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - streak)
    expectedDate.setHours(0, 0, 0, 0)

    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Helper to check if checked in today
export function hasCheckedInToday(checkIns: { date: Date | string }[]): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return checkIns.some(checkIn => {
    const checkInDate = new Date(checkIn.date)
    checkInDate.setHours(0, 0, 0, 0)
    return checkInDate.getTime() === today.getTime()
  })
}
