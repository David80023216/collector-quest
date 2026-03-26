import prisma from './prisma'

/**
 * Get today's date as a YYYY-MM-DD string.
 */
function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Get the start-of-week date (Monday) as a YYYY-MM-DD string.
 */
function getWeekStartString(): string {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ...
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Days since Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

/**
 * Get submission counts for an email: how many today and this week.
 */
async function getSubmissionCounts(email: string): Promise<{
  today: number
  thisWeek: number
}> {
  const today = getTodayString()
  const weekStart = getWeekStartString()

  const [todayCount, weekCount] = await Promise.all([
    prisma.freeEntrySubmission.count({
      where: {
        email: email.toLowerCase().trim(),
        submissionDate: today,
      },
    }),
    prisma.freeEntrySubmission.count({
      where: {
        email: email.toLowerCase().trim(),
        submissionDate: { gte: weekStart },
      },
    }),
  ])

  return { today: todayCount, thisWeek: weekCount }
}

/**
 * Submit a free (AMOE) entry.
 *
 * Steps:
 *  1. Validate input
 *  2. Check daily limit (from admin settings)
 *  3. Check weekly limit
 *  4. Check duplicate for today (unique constraint: email + submissionDate)
 *  5. Create FreeEntrySubmission
 *  6. Return success
 */
export async function submitFreeEntry(
  name: string,
  email: string,
  ipAddress?: string
): Promise<{
  success: boolean
  error?: string
}> {
  // Validate input
  if (!name || !name.trim()) {
    return { success: false, error: 'Name is required' }
  }

  if (!email || !email.trim()) {
    return { success: false, error: 'Email is required' }
  }

  const normalizedEmail = email.toLowerCase().trim()
  const trimmedName = name.trim()
  const today = getTodayString()

  // Get limits from admin settings
  const settings = await prisma.adminSetting.findMany({
    where: {
      key: {
        in: ['free_entry_daily_limit', 'free_entry_weekly_limit', 'free_entry_entries_granted'],
      },
    },
  })

  const settingsMap: Record<string, string> = {}
  for (const s of settings) {
    settingsMap[s.key] = s.value
  }

  const dailyLimit = parseInt(settingsMap['free_entry_daily_limit'] ?? '1', 10)
  const weeklyLimit = parseInt(settingsMap['free_entry_weekly_limit'] ?? '7', 10)
  const entriesGranted = parseInt(settingsMap['free_entry_entries_granted'] ?? '1', 10)

  // Check submission counts
  const counts = await getSubmissionCounts(normalizedEmail)

  // Check daily limit
  if (counts.today >= dailyLimit) {
    return {
      success: false,
      error: `Daily submission limit reached (${dailyLimit} per day)`,
    }
  }

  // Check weekly limit
  if (counts.thisWeek >= weeklyLimit) {
    return {
      success: false,
      error: `Weekly submission limit reached (${weeklyLimit} per week)`,
    }
  }

  // Create submission (the unique constraint on [email, submissionDate] prevents duplicates)
  try {
    await prisma.freeEntrySubmission.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        submissionDate: today,
        ipAddress: ipAddress ?? null,
        entriesGranted,
      },
    })
  } catch (error: unknown) {
    // Handle unique constraint violation (duplicate for today)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return {
        success: false,
        error: 'You have already submitted a free entry today',
      }
    }
    throw error
  }

  return { success: true }
}
