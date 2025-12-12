import { redirect } from "next/navigation"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <DashboardClient />
}

