import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import prisma from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const email = result.data.email.toLowerCase().trim()
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token } },
      create: { identifier: email, token, expires, type: 'password_reset' },
      update: { expires, type: 'password_reset' },
    })

    // In production: send email with reset link
    console.log('Password reset token for', email, ':', token)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
