import Link from 'next/link'
import { getAllCycles } from '@/lib/actions'
import CycleCard from '@/components/CycleCard'

export default async function Home() {
  const cycles = await getAllCycles()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your Habit Cycles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your 7-day habit cycles and build consistency
          </p>
        </div>
        <Link
          href="/new"
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 active:scale-95"
        >
          <span className="text-xl">➕</span>
          <span>New Cycle</span>
        </Link>
      </div>

      {cycles.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No cycles yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first habit cycle to start tracking your progress
          </p>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Create Your First Cycle
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))}
        </div>
      )}
    </div>
  )
}
