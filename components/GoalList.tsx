"use client"

import { useState } from "react"
import { Check, Camera, Upload } from "lucide-react"
import Image from "next/image"

interface Goal {
  id: string
  title: string
  description?: string
  completions: Array<{ id: string; date: string; photoUrl?: string }>
}

interface GoalListProps {
  goals: Goal[]
  onComplete: (goalId: string, photoUrl?: string) => void
}

export default function GoalList({ goals, onComplete }: GoalListProps) {
  const [uploading, setUploading] = useState<string | null>(null)

  const isCompletedToday = (goal: Goal) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return goal.completions.some((c) => {
      const completionDate = new Date(c.date)
      completionDate.setHours(0, 0, 0, 0)
      return completionDate.getTime() === today.getTime()
    })
  }

  const handleFileUpload = async (goalId: string, file: File) => {
    setUploading(goalId)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.photoUrl) {
        onComplete(goalId, data.photoUrl)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("Failed to upload photo")
    } finally {
      setUploading(null)
    }
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No goals yet. Add your first goal to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const completed = isCompletedToday(goal)
        const lastCompletion = goal.completions[0]

        return (
          <div
            key={goal.id}
            className={`border-2 rounded-lg p-4 transition-all ${
              completed
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                )}

                {lastCompletion?.photoUrl && (
                  <div className="mt-3 mb-3">
                    <Image
                      src={lastCompletion.photoUrl}
                      alt="Achievement"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}

                {completed ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Completed today
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                      <Camera className="w-4 h-4" />
                      {uploading === goal.id ? "Uploading..." : "Complete with Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(goal.id, file)
                          }
                        }}
                        disabled={uploading === goal.id}
                      />
                    </label>
                    <button
                      onClick={() => onComplete(goal.id)}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

