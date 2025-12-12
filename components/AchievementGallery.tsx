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

interface AchievementGalleryProps {
  isOwnProfile?: boolean
}

export default function AchievementGallery({ isOwnProfile = true }: AchievementGalleryProps) {
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
      // Validate file type before uploading
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      const allowedExtensions = ['.png', '.jpg', '.jpeg']
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        alert("Please select a PNG or JPG image file")
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      
      if (!uploadRes.ok) {
        alert(uploadData.error || "Failed to upload photo")
        setUploading(false)
        return
      }

      if (uploadData.photoUrl) {
        const achievementRes = await fetch("/api/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoUrl: uploadData.photoUrl,
            caption: caption || undefined,
          }),
        })

        if (!achievementRes.ok) {
          const error = await achievementRes.json()
          alert(error.error || "Failed to save achievement")
        } else {
          setShowUpload(false)
          setCaption("")
          fetchAchievements()
        }
      } else {
        alert("Upload failed: No photo URL returned")
      }
    } catch (error) {
      console.error("Error uploading achievement:", error)
      alert("Failed to upload achievement. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Achievement Gallery</h2>
        {isOwnProfile && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2.5 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg hover-lift min-h-[44px] text-sm sm:text-base font-medium"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Share Achievement</span>
            <span className="sm:hidden">Share</span>
          </button>
        )}
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No achievements yet. Share your first achievement!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div 
              key={achievement.id} 
              className="relative group stagger-item hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                <Image
                  src={achievement.photoUrl}
                  alt={achievement.caption || "Achievement"}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {achievement.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">{achievement.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {new Date(achievement.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto animate-scaleIn border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Achievement</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                    accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }}
                    disabled={uploading}
                    className="w-full min-h-[44px] text-base"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

