import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const completeSchema = z.object({
  photoUrl: z.string().refine(
    (val) => !val || val.startsWith('/') || val.startsWith('http'),
    { message: "Photo URL must be a valid path or URL" }
  ).optional(),
  notes: z.string().optional(),
}).passthrough()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle both Promise and direct params (Next.js 15+ compatibility)
    const resolvedParams = await Promise.resolve(params)
    const goalId = resolvedParams.id

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = completeSchema.parse(body)
    const { photoUrl, notes } = parsed

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already completed today
    const existingCompletion = await prisma.completion.findFirst({
      where: {
        goalId: goalId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Goal already completed today" },
        { status: 400 }
      )
    }

    const completion = await prisma.completion.create({
      data: {
        goalId: goalId,
        photoUrl: photoUrl || null,
        notes: notes || null,
        date: new Date(),
      }
    })

    // Update streak for today
    await updateStreak(session.user.id)

    return NextResponse.json(completion)
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

async function updateStreak(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Count completions for today
  const todayCompletions = await prisma.completion.count({
    where: {
      goal: { userId },
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  })

  // Update or create streak for today
  await prisma.streak.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      }
    },
    create: {
      userId,
      date: today,
      goalsCompleted: todayCompletions,
    },
    update: {
      goalsCompleted: todayCompletions,
    }
  })
}

