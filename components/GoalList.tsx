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
      // Validate file type before uploading
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      const allowedExtensions = ['.png', '.jpg', '.jpeg']
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        alert("Please select a PNG or JPG image file")
        setUploading(null)
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || "Failed to upload photo")
        setUploading(null)
        return
      }

      if (data.photoUrl) {
        onComplete(goalId, data.photoUrl)
      } else {
        alert("Upload failed: No photo URL returned")
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("Failed to upload photo. Please try again.")
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
      {goals.map((goal, index) => {
        const completed = isCompletedToday(goal)
        const lastCompletion = goal.completions[0]

        return (
          <div
            key={goal.id}
            className={`stagger-item border-2 rounded-xl p-4 transition-all duration-300 hover-lift ${
              completed
                ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md"
                : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-md"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
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
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-fadeIn">
                    <Check className="w-4 h-4 success-animation" />
                    <span className="font-semibold">Completed today ✨</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2.5 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover-lift min-h-[44px] text-sm sm:text-base font-medium">
                      <Camera className="w-4 h-4" />
                      <span className="hidden sm:inline">{uploading === goal.id ? "Uploading..." : "Complete with Photo"}</span>
                      <span className="sm:hidden">{uploading === goal.id ? "Uploading..." : "Photo"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
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
                      className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-all duration-200 hover-lift min-h-[44px] text-sm sm:text-base font-medium"
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

