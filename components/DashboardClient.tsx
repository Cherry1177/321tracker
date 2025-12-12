"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Check, Plus, Camera, Users, Calendar, Flame, X } from "lucide-react"
import GoalList from "./GoalList"
import AddGoalDialog from "./AddGoalDialog"
import FriendsPanel from "./FriendsPanel"
import StreakCalendar from "./StreakCalendar"
import AchievementGallery from "./AchievementGallery"
import ShareStoryDialog from "./ShareStoryDialog"

interface Goal {
  id: string
  title: string
  description?: string
  completions: Array<{ id: string; date: string; photoUrl?: string }>
}

interface Streak {
  date: string
  goalsCompleted: number
}

export default function DashboardClient() {
  const { data: session } = useSession()
  const [goals, setGoals] = useState<Goal[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [todayCompletions, setTodayCompletions] = useState(0)
  const [activeTab, setActiveTab] = useState<"goals" | "friends" | "calendar" | "achievements">("goals")
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showShareStory, setShowShareStory] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, streaksRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/streaks"),
      ])

      const goalsData = await goalsRes.json()
      const streaksData = await streaksRes.json()

      setGoals(goalsData)
      setStreaks(streaksData.streaks || [])
      setCurrentStreak(streaksData.currentStreak || 0)

      // Count today's completions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayCount = goalsData.reduce((count: number, goal: Goal) => {
        const hasTodayCompletion = goal.completions.some((c: any) => {
          const completionDate = new Date(c.date)
          completionDate.setHours(0, 0, 0, 0)
          return completionDate.getTime() === today.getTime()
        })
        return hasTodayCompletion ? count + 1 : count
      }, 0)
      setTodayCompletions(todayCount)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoalComplete = async (goalId: string, photoUrl?: string) => {
    try {
      await fetch(`/api/goals/${goalId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl }),
      })
      fetchData()
    } catch (error) {
      console.error("Error completing goal:", error)
    }
  }

  const handleGoalAdded = () => {
    setShowAddGoal(false)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const needsMoreGoals = todayCompletions < 3
  const strikeEarned = todayCompletions >= 3

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">321 Tracker</h1>
              <p className="text-sm text-gray-600">Welcome back, {session?.user?.name || session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{currentStreak}</div>
              <div className="text-indigo-200 text-sm flex items-center justify-center gap-1 mt-1">
                <Flame className="w-4 h-4" />
                Day Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{todayCompletions}/3</div>
              <div className="text-indigo-200 text-sm mt-1">Goals Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{goals.length}</div>
              <div className="text-indigo-200 text-sm mt-1">Total Goals</div>
            </div>
          </div>

          {/* Strike Status */}
          <div className="mt-6 text-center">
            {strikeEarned ? (
              <div className="inline-flex items-center gap-2 bg-green-500 px-6 py-3 rounded-full">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Strike Earned Today! 🔥</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-yellow-500 px-6 py-3 rounded-full">
                <span className="font-semibold">
                  {3 - todayCompletions} more goal{3 - todayCompletions !== 1 ? "s" : ""} needed for strike
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "goals", label: "Goals", icon: Check },
                { id: "friends", label: "Friends", icon: Users },
                { id: "calendar", label: "Calendar", icon: Calendar },
                { id: "achievements", label: "Achievements", icon: Camera },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "goals" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Goals</h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
              <GoalList goals={goals} onComplete={handleGoalComplete} />
            </div>
          )}

          {activeTab === "friends" && (
            <FriendsPanel onShareStory={() => setShowShareStory(true)} />
          )}

          {activeTab === "calendar" && (
            <StreakCalendar streaks={streaks} currentStreak={currentStreak} />
          )}

          {activeTab === "achievements" && (
            <AchievementGallery />
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showAddGoal && (
        <AddGoalDialog onClose={() => setShowAddGoal(false)} onSuccess={handleGoalAdded} />
      )}

      {showShareStory && (
        <ShareStoryDialog
          currentStreak={currentStreak}
          onClose={() => setShowShareStory(false)}
        />
      )}
    </div>
  )
}

