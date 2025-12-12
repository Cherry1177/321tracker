import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      },
      include: {
        user1: {
          select: { id: true, name: true, email: true, image: true }
        },
        user2: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    // Transform friendships to include the friend (not the current user)
    const transformedFriendships = friendships.map(friendship => ({
      ...friendship,
      friend: friendship.user1Id === session.user.id ? friendship.user2 : friendship.user1
    }))

    // Get pending friend requests
    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: session.user.id,
        status: "pending"
      },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: session.user.id,
        status: "pending"
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    return NextResponse.json({
      friendships: transformedFriendships,
      sentRequests,
      receivedRequests,
      currentUserId: session.user.id
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

