"use client"

import { useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { Flame } from "lucide-react"

interface Streak {
  date: string
  goalsCompleted: number
}

interface StreakCalendarProps {
  streaks: Streak[]
  currentStreak: number
}

export default function StreakCalendar({ streaks, currentStreak }: StreakCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getStreakForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return streaks.find((s) => {
      const streakDate = new Date(s.date).toISOString().split("T")[0]
      return streakDate === dateStr
    })
  }

  const tileClassName = ({ date }: { date: Date }) => {
    const streak = getStreakForDate(date)
    if (streak) {
      if (streak.goalsCompleted >= 3) {
        return "bg-green-500 text-white font-bold"
      } else if (streak.goalsCompleted > 0) {
        return "bg-yellow-500 text-white"
      }
    }
    return ""
  }

  const tileContent = ({ date }: { date: Date }) => {
    const streak = getStreakForDate(date)
    if (streak && streak.goalsCompleted >= 3) {
      return <Flame className="w-4 h-4 mx-auto mt-1" />
    }
    return null
  }

  const selectedStreak = selectedDate ? getStreakForDate(selectedDate) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Streak Calendar</h2>
        <div className="flex items-center gap-2 text-indigo-600">
          <Flame className="w-5 h-5" />
          <span className="font-semibold">{currentStreak} day streak</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            tileClassName={tileClassName}
            tileContent={tileContent}
            className="w-full border-0 rounded-lg shadow-sm"
          />
        </div>

        {selectedDate && selectedStreak && (
          <div className="md:w-64 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Goals Completed:</span>
                <span className="font-semibold">{selectedStreak.goalsCompleted}/3</span>
              </div>
              {selectedStreak.goalsCompleted >= 3 ? (
                <div className="flex items-center gap-2 text-green-600 mt-3">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">Strike earned!</span>
                </div>
              ) : (
                <div className="text-yellow-600 text-sm mt-3">
                  {3 - selectedStreak.goalsCompleted} more needed for strike
                </div>
              )}
            </div>
          </div>
        )}

        {selectedDate && !selectedStreak && (
          <div className="md:w-64 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p className="text-gray-600 text-sm">No activity recorded for this day.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>3+ goals (Strike earned)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>1-2 goals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>No activity</span>
          </div>
        </div>
      </div>
    </div>
  )
}

