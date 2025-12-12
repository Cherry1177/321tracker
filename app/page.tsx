import { redirect } from "next/navigation"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">321 Tracker</h1>
        <p className="text-gray-600 mb-8">
          Complete 3 goals a day. Build your streak. Share your journey.
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors shadow-md"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block w-full bg-white text-teal-600 py-3 rounded-lg font-semibold border-2 border-teal-500 hover:bg-teal-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
