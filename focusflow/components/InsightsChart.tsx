interface ChartData {
  day: string
  count: number
}

interface InsightsChartProps {
  data: ChartData[]
}

export default function InsightsChart({ data }: InsightsChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const chartHeight = 200
  const barWidth = 40

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
        Check-ins Over Time (Last 7 Days)
      </h3>

      <div className="flex items-end justify-around gap-2" style={{ height: chartHeight }}>
        {data.map((item, index) => {
          const barHeight = maxCount > 0 ? (item.count / maxCount) * (chartHeight - 40) : 0

          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center justify-end flex-1 w-full">
                {item.count > 0 && (
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {item.count}
                  </div>
                )}
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all duration-500 ease-out hover:from-blue-600 hover:to-purple-700"
                  style={{
                    height: `${barHeight}px`,
                    maxWidth: `${barWidth}px`,
                    minHeight: item.count > 0 ? '8px' : '0px',
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {item.day}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
