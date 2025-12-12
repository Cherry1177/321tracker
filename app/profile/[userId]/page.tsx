import { redirect } from "next/navigation"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import ProfileClient from "@/components/ProfileClient"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }> | { userId: string }
}) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  // Handle both Promise and direct params (Next.js 15+ compatibility)
  const resolvedParams = await Promise.resolve(params)
  const userId = resolvedParams.userId

  return <ProfileClient userId={userId} currentUserId={session.user.id} />
}

