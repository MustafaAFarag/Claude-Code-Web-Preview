'use client'

import { checkInToday } from '@/lib/actions'
import { useState, useTransition } from 'react'

interface CheckInWidgetProps {
  cycleId: string
  hasCheckedInToday: boolean
  currentStreak: number
}

export default function CheckInWidget({
  cycleId,
  hasCheckedInToday,
  currentStreak,
}: CheckInWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCheckIn = () => {
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await checkInToday(cycleId)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(true)
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={isPending || hasCheckedInToday}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          hasCheckedInToday
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 cursor-not-allowed'
            : isPending
            ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-wait'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:scale-95'
        }`}
      >
        {hasCheckedInToday
          ? '✓ Checked in today'
          : isPending
          ? 'Checking in...'
          : 'Mark Today as Completed'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
          ✓ Successfully checked in!
        </div>
      )}
    </div>
  )
}
