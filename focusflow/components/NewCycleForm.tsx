'use client'

import { createCycle } from '@/lib/actions'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const EMOJI_OPTIONS = [
  '🎯', '💪', '🧘', '📚', '🏃', '🎨', '💤', '🥗',
  '💧', '🌅', '🎵', '✍️', '🧠', '❤️', '🌟', '🔥'
]

export default function NewCycleForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedEmoji, setSelectedEmoji] = useState('🎯')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('emoji', selectedEmoji)

    startTransition(async () => {
      const result = await createCycle(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push('/')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="emoji" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Choose an Emoji
        </label>
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(emoji)}
              className={`text-3xl p-3 rounded-lg transition-all duration-200 ${
                selectedEmoji === emoji
                  ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-110'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Habit Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={50}
          placeholder="e.g., Morning meditation"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={200}
          placeholder="What do you want to achieve?"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          {isPending ? 'Creating...' : 'Create Cycle'}
        </button>
      </div>
    </form>
  )
}
