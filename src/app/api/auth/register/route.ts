import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json({ success: true, user })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
