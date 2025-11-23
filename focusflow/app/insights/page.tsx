import { getAnalytics } from '@/lib/actions'
import InsightsChart from '@/components/InsightsChart'

export default async function InsightsPage() {
  const analytics = await getAnalytics()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Your Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and behavior patterns across all cycles
        </p>
      </div>

      {analytics.totalCycles === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No data yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create some cycles and check in to see your insights
          </p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📈</span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Check-ins
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.totalCheckIns}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎯</span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Consistency Score
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.consistencyScore}%
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Average progress per cycle
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">✅</span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.completionRate}%
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Across all 7-day cycles
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🔥</span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Cycles
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.totalCycles}
              </div>
            </div>
          </div>

          {/* Chart */}
          <InsightsChart data={analytics.chartData} />

          {/* Best Performing Cycle */}
          {analytics.bestCycle && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{analytics.bestCycle.emoji}</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    🏆 Best Performing Cycle
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {analytics.bestCycle.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {analytics.bestCycle.checkInCount} check-ins
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {analytics.consistencyScore >= 80
                ? '🎉 Amazing consistency! Keep up the great work!'
                : analytics.consistencyScore >= 50
                ? '💪 You\'re making good progress. Stay focused!'
                : '🌱 Every journey starts with a single step. Keep going!'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
