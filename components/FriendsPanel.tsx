"use client"

import { useState, useEffect } from "react"
import { UserPlus, Check, X, Share2 } from "lucide-react"

interface Friend {
  id: string
  name?: string
  email: string
  image?: string
}

interface FriendsPanelProps {
  onShareStory: () => void
}

export default function FriendsPanel({ onShareStory }: FriendsPanelProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])
  const [friendEmail, setFriendEmail] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends")
      const data = await res.json()

      // Extract unique friends from friendships
      const friendList: Friend[] = []
      data.friendships?.forEach((friendship: any) => {
        if (friendship.friend) {
          friendList.push(friendship.friend)
        }
      })

      setFriends(friendList)
      setSentRequests(data.sentRequests || [])
      setReceivedRequests(data.receivedRequests || [])
    } catch (error) {
      console.error("Error fetching friends:", error)
    }
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: friendEmail }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Failed to send request")
      } else {
        setFriendEmail("")
        fetchFriends()
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      if (res.ok) {
        fetchFriends()
      }
    } catch (error) {
      alert("Failed to accept request")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Friends & Accountability</h2>
        <button
          onClick={onShareStory}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Streak Story
        </button>
      </div>

      {/* Add Friend */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Add Friend</h3>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="Enter friend's email"
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            Send Request
          </button>
        </form>
      </div>

      {/* Received Requests */}
      {receivedRequests.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Friend Requests</h3>
          <div className="space-y-2">
            {receivedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{request.sender.name || request.sender.email}</p>
                  <p className="text-sm text-gray-600">{request.sender.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Your Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="text-gray-500 text-sm">No friends yet. Add some accountability partners!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  {(friend.name || friend.email)[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{friend.name || friend.email}</p>
                  <p className="text-sm text-gray-600">{friend.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

