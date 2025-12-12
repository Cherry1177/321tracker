"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Flame } from "lucide-react"
import Image from "next/image"

interface User {
  id: string
  name?: string
  email: string
  image?: string
}

interface Achievement {
  id: string
  photoUrl: string
  caption?: string
  date: string
}

interface Streak {
  date: string
  goalsCompleted: number
}

interface ProfileClientProps {
  userId: string
  currentUserId: string
}

export default function ProfileClient({ userId, currentUserId }: ProfileClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const isOwnProfile = userId === currentUserId

  useEffect(() => {
    fetchProfileData()
  }, [userId])

  const fetchProfileData = async () => {
    try {
      const [userRes, achievementsRes, streaksRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/achievements?userId=${userId}`),
        fetch(`/api/streaks?userId=${userId}`),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        setAchievements(achievementsData)
      }

      if (streaksRes.ok) {
        const streaksData = await streaksRes.json()
        setCurrentStreak(streaksData.currentStreak || 0)
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <button
            onClick={() => router.back()}
            className="text-teal-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {user.name || user.email}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Stats */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{currentStreak}</div>
              <div className="text-teal-100 text-xs sm:text-sm flex items-center justify-center gap-1 mt-1">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                Day Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{achievements.length}</div>
              <div className="text-teal-100 text-xs sm:text-sm mt-1">Achievements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Achievement Gallery
            </h2>
            {isOwnProfile && (
              <button
                onClick={() => router.push("/dashboard?tab=achievements")}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Manage
              </button>
            )}
          </div>

          {achievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>
                {isOwnProfile
                  ? "No achievements yet. Share your first achievement!"
                  : "No achievements shared yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={achievement.photoUrl}
                      alt={achievement.caption || "Achievement"}
                      fill
                      className="object-cover"
                    />
                    {achievement.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs sm:text-sm line-clamp-2">
                            {achievement.caption}
                          </p>
                          <p className="text-white/80 text-xs mt-1">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {!achievement.caption && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

