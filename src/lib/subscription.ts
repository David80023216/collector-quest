import prisma from './prisma'
import { SubscriptionStatus, UserPlan } from '@prisma/client'

/**
 * Check if a user has an active PRO subscription.
 */
export async function isProUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })

  return user?.plan === UserPlan.PRO
}

/**
 * Get full subscription info for a user.
 * Returns null if the user has no subscription record.
 */
export async function getSubscriptionInfo(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return {
      hasSubscription: false,
      status: null,
      plan: UserPlan.FREE,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    }
  }

  return {
    hasSubscription: true,
    status: subscription.status,
    plan: subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIALING
      ? UserPlan.PRO
      : UserPlan.FREE,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    stripeCustomerId: subscription.stripeCustomerId,
  }
}

/**
 * Create or update a subscription for a user.
 * Typically called from the Stripe webhook handler.
 */
export async function updateSubscription(
  userId: string,
  data: {
    stripeCustomerId: string
    stripeSubscriptionId: string
    stripePriceId: string
    status: SubscriptionStatus
    currentPeriodStart: Date
    currentPeriodEnd: Date
    cancelAtPeriodEnd?: boolean
  }
) {
  const isActivePlan =
    data.status === SubscriptionStatus.ACTIVE ||
    data.status === SubscriptionStatus.TRIALING

  // Upsert subscription record
  const subscription = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      status: data.status,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    },
    update: {
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      status: data.status,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    },
  })

  // Update user plan to match subscription status
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: isActivePlan ? UserPlan.PRO : UserPlan.FREE,
    },
  })

  return subscription
}

/**
 * Cancel a user's subscription.
 * Sets cancelAtPeriodEnd to true so access continues until the end of the billing period.
 */
export async function cancelSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    throw new Error('No subscription found for user')
  }

  // Mark as cancelling at period end
  await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
    },
  })

  return { success: true, cancelAtPeriodEnd: true }
}

/**
 * Count the total number of PRO subscribers.
 * Used for prize tier calculation.
 */
export async function getProSubscriberCount(): Promise<number> {
  return prisma.user.count({
    where: { plan: UserPlan.PRO },
  })
}

/**
 * Create a Stripe checkout session for upgrading to PRO.
 *
 * This is fully structured for Stripe integration. Replace the placeholder
 * with actual Stripe API calls when the Stripe SDK is configured.
 *
 * Returns the checkout URL the user should be redirected to.
 */
export async function createCheckoutSession(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })

  // Check if user already has an active subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (
    existingSubscription &&
    (existingSubscription.status === SubscriptionStatus.ACTIVE ||
      existingSubscription.status === SubscriptionStatus.TRIALING)
  ) {
    throw new Error('User already has an active subscription')
  }

  // Check for existing Stripe customer or create one
  let stripeCustomerId = existingSubscription?.stripeCustomerId

  if (!stripeCustomerId) {
    // In production, create a Stripe customer:
    // const customer = await stripe.customers.create({
    //   email: user.email,
    //   name: user.name,
    //   metadata: { userId: user.id },
    // })
    // stripeCustomerId = customer.id
    stripeCustomerId = `cus_placeholder_${user.id}`
  }

  // In production, create a Stripe checkout session:
  // const session = await stripe.checkout.sessions.create({
  //   customer: stripeCustomerId,
  //   mode: 'subscription',
  //   payment_method_types: ['card'],
  //   line_items: [{
  //     price: process.env.STRIPE_PRO_PRICE_ID,
  //     quantity: 1,
  //   }],
  //   success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
  //   cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
  //   metadata: { userId: user.id },
  // })
  // return session.url

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return `${baseUrl}/api/checkout/placeholder?userId=${user.id}&customerId=${stripeCustomerId}`
}
