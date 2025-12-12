"use client"

import { useState, useEffect } from "react"
import { Camera, Upload, X } from "lucide-react"
import Image from "next/image"

interface Achievement {
  id: string
  photoUrl: string
  caption?: string
  date: string
}

export default function AchievementGallery() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState("")

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/achievements")
      const data = await res.json()
      setAchievements(data)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (uploadData.photoUrl) {
        const achievementRes = await fetch("/api/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoUrl: uploadData.photoUrl,
            caption: caption || undefined,
          }),
        })

        if (achievementRes.ok) {
          setShowUpload(false)
          setCaption("")
          fetchAchievements()
        }
      }
    } catch (error) {
      alert("Failed to upload achievement")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Achievement Gallery</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Share Achievement
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No achievements yet. Share your first achievement!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm">{achievement.caption}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(achievement.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Achievement</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file)
                    }
                  }}
                  disabled={uploading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="What did you achieve?"
                />
              </div>

              {uploading && (
                <p className="text-sm text-gray-600">Uploading...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

