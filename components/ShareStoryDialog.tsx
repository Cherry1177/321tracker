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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto animate-scaleIn border border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Share Your Streak</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-xl p-6 sm:p-8 text-center text-white mb-4 sm:mb-6 shadow-lg hover-lift transition-all duration-300 animate-scaleIn">
          <Flame className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 animate-pulse-slow" />
          <div className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">{currentStreak}</div>
          <div className="text-base sm:text-lg font-medium">Day Streak</div>
          <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-90">
            Keep it going! 🔥
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg hover-lift min-h-[44px] font-medium"
          >
            <Share2 className="w-5 h-5" />
            Share Story
          </button>

          <button
            onClick={handleCopy}
            className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all duration-200 hover-lift min-h-[44px] font-medium"
          >
            {copied ? "✓ Copied!" : "Copy Text"}
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 break-words">{shareText}</p>
        </div>
      </div>
    </div>
  )
}

