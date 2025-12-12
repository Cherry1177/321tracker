import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const acceptSchema = z.object({
  requestId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { requestId } = acceptSchema.parse(body)

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    })

    if (!friendRequest) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      )
    }

    if (friendRequest.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Create friendship
    const user1Id = friendRequest.senderId < friendRequest.receiverId
      ? friendRequest.senderId
      : friendRequest.receiverId
    const user2Id = friendRequest.senderId < friendRequest.receiverId
      ? friendRequest.receiverId
      : friendRequest.senderId

    await prisma.friendship.create({
      data: {
        user1Id,
        user2Id,
      }
    })

    // Update request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "accepted" }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

