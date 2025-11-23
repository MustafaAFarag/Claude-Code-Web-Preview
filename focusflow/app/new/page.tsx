import NewCycleForm from '@/components/NewCycleForm'

export default function NewCyclePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Create a New Habit Cycle
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Start a new 7-day cycle to track and build your habit
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <NewCycleForm />
      </div>
    </div>
  )
}
