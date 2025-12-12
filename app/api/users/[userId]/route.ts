import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle both Promise and direct params (Next.js 15+ compatibility)
    const resolvedParams = await Promise.resolve(params)
    const userId = resolvedParams.userId

    // Check if users are friends or if it's the same user
    const isOwnProfile = userId === session.user.id
    
    if (!isOwnProfile) {
      // Check if they are friends
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { user1Id: session.user.id, user2Id: userId },
            { user1Id: userId, user2Id: session.user.id }
          ]
        }
      })

      if (!friendship) {
        return NextResponse.json(
          { error: "You can only view friends' profiles" },
          { status: 403 }
        )
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

