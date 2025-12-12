import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const requestSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { email } = requestSchema.parse(body)

    const receiver = await prisma.user.findUnique({
      where: { email }
    })

    if (!receiver) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (receiver.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot add yourself" },
        { status: 400 }
      )
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: receiver.id },
          { user1Id: receiver.id, user2Id: session.user.id }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json(
        { error: "Already friends" },
        { status: 400 }
      )
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: session.user.id }
        ],
        status: "pending"
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "Friend request already exists" },
        { status: 400 }
      )
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: receiver.id,
      },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    return NextResponse.json(friendRequest)
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

