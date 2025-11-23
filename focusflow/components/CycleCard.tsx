import { calculateStreak, hasCheckedInToday } from '@/lib/utils'
import ProgressBar from './ProgressBar'
import CheckInWidget from './CheckInWidget'

interface CycleCardProps {
  cycle: {
    id: string
    name: string
    description: string | null
    emoji: string
    checkIns: { date: Date | string }[]
  }
}

export default function CycleCard({ cycle }: CycleCardProps) {
  const streak = calculateStreak(cycle.checkIns)
  const checkedInToday = hasCheckedInToday(cycle.checkIns)
  const progress = Math.min(7, cycle.checkIns.length)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-4xl" role="img" aria-label={cycle.name}>
            {cycle.emoji}
          </span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {cycle.name}
            </h3>
            {cycle.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {cycle.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ProgressBar current={progress} total={7} />
        <CheckInWidget
          cycleId={cycle.id}
          hasCheckedInToday={checkedInToday}
          currentStreak={streak}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Total check-ins</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {cycle.checkIns.length}
          </span>
        </div>
      </div>
    </div>
  )
}
