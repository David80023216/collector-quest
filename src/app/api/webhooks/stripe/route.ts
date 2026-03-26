import { NextRequest, NextResponse } from 'next/server'
import { updateSubscription } from '@/lib/subscription'
import { SubscriptionStatus } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  // In production: validate the webhook signature with Stripe
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

  try {
    const event = JSON.parse(body)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const userId = sub.metadata?.userId
        if (!userId) break

        await updateSubscription(userId, {
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items?.data?.[0]?.price?.id ?? '',
          status: sub.status as SubscriptionStatus,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const userId = sub.metadata?.userId
        if (!userId) break

        await updateSubscription(userId, {
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items?.data?.[0]?.price?.id ?? '',
          status: SubscriptionStatus.CANCELLED,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: false,
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
