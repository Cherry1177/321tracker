"use client"

import { useState } from "react"
import { X, Share2, Flame } from "lucide-react"

interface ShareStoryDialogProps {
  currentStreak: number
  onClose: () => void
}

export default function ShareStoryDialog({ currentStreak, onClose }: ShareStoryDialogProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `🔥 I'm on a ${currentStreak} day streak with 321 Tracker! Join me and let's build better habits together! #321Tracker #HabitTracker`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My 321 Tracker Streak",
          text: shareText,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Share Your Streak</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-lg p-8 text-center text-white mb-6">
          <Flame className="w-16 h-16 mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">{currentStreak}</div>
          <div className="text-lg">Day Streak</div>
          <p className="text-sm mt-4 opacity-90">
            Keep it going! 🔥
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share Story
          </button>

          <button
            onClick={handleCopy}
            className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{shareText}</p>
        </div>
      </div>
    </div>
  )
}

