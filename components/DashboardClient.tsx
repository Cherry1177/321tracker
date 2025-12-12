"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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
      const body: { photoUrl?: string } = {}
      if (photoUrl) {
        body.photoUrl = photoUrl
      }
      
      const res = await fetch(`/api/goals/${goalId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      
      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Failed to complete goal")
        return
      }
      
      fetchData()
    } catch (error) {
      console.error("Error completing goal:", error)
      alert("Failed to complete goal. Please try again.")
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between animate-fadeIn">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent truncate">
                321 Tracker
              </h1>
              <button
                onClick={() => {
                  if (session?.user?.id) {
                    router.push(`/profile/${session.user.id}`)
                  }
                }}
                className="text-xs sm:text-sm text-gray-600 hover:text-teal-600 truncate text-left transition-all duration-200 hover:scale-105"
              >
                Welcome back, {session?.user?.name || session?.user?.email}
              </button>
            </div>
            <button
              onClick={() => signOut()}
              className="ml-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-500 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 animate-fadeIn">
            <div className="text-center hover-scale transform transition-transform duration-200">
              <div className="text-2xl sm:text-3xl font-bold drop-shadow-lg">{currentStreak}</div>
              <div className="text-teal-100 text-xs sm:text-sm flex items-center justify-center gap-1 mt-1">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse-slow" />
                <span className="hidden sm:inline">Day Streak</span>
                <span className="sm:hidden">Streak</span>
              </div>
            </div>
            <div className="text-center hover-scale transform transition-transform duration-200">
              <div className="text-2xl sm:text-3xl font-bold drop-shadow-lg">{todayCompletions}/3</div>
              <div className="text-teal-100 text-xs sm:text-sm mt-1">Goals Today</div>
            </div>
            <div className="text-center hover-scale transform transition-transform duration-200">
              <div className="text-2xl sm:text-3xl font-bold drop-shadow-lg">{goals.length}</div>
              <div className="text-teal-100 text-xs sm:text-sm mt-1">Total Goals</div>
            </div>
          </div>

          {/* Strike Status */}
          <div className="mt-4 sm:mt-6 text-center animate-scaleIn">
            {strikeEarned ? (
              <div className="inline-flex items-center gap-2 bg-emerald-500 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-xl hover-glow animate-bounce-slow">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 success-animation" />
                <span className="text-sm sm:text-base font-semibold">Strike Earned Today! 🔥</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-amber-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg text-amber-900 hover:bg-amber-500 transition-all duration-200">
                <span className="text-xs sm:text-sm font-semibold">
                  {3 - todayCompletions} more goal{3 - todayCompletions !== 1 ? "s" : ""} needed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fadeIn">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg mb-4 sm:mb-6 overflow-hidden border border-gray-200/50">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
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
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 relative ${
                      activeTab === tab.id
                        ? "border-teal-500 text-teal-600 bg-teal-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : ''}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 animate-scaleIn">
          {activeTab === "goals" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Goals</h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2.5 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg hover-lift text-sm sm:text-base min-h-[44px] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Goal</span>
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
            <AchievementGallery isOwnProfile={true} />
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

