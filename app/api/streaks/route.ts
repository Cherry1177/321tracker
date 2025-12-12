import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || session.user.id

    // Get streaks for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const streaks = await prisma.streak.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { date: "desc" }
    })

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)

      const streak = streaks.find(s => {
        const sDate = new Date(s.date)
        sDate.setHours(0, 0, 0, 0)
        return sDate.getTime() === checkDate.getTime() && s.goalsCompleted >= 3
      })

      if (streak) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }

    return NextResponse.json({
      streaks,
      currentStreak,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

