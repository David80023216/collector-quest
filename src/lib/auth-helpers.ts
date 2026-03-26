import { getServerSession as nextAuthGetServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  return session
}

export async function requireAdmin() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required")
  }

  return session
}

export async function getCurrentUser() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  return user
}
