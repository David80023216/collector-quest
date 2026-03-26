import prisma from './prisma'
import { addCommunityContribution } from './community'
import { checkAndAwardBadges } from './badges'

/**
 * Get all active polls with the user's vote status.
 * Each poll includes its options with vote counts and whether the user has voted.
 */
export async function getActivePolls(userId: string) {
  const now = new Date()

  const polls = await prisma.pollQuestion.findMany({
    where: {
      isActive: true,
      OR: [
        { closesAt: null },
        { closesAt: { gt: now } },
      ],
    },
    include: {
      options: {
        orderBy: { id: 'asc' },
      },
      responses: {
        where: { userId },
        select: { optionId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return polls.map((poll) => {
    const userVote = poll.responses.length > 0 ? poll.responses[0].optionId : null
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0)

    return {
      id: poll.id,
      question: poll.question,
      isActive: poll.isActive,
      closesAt: poll.closesAt,
      createdAt: poll.createdAt,
      hasVoted: !!userVote,
      userVoteOptionId: userVote,
      totalVotes,
      options: poll.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt.voteCount,
        percentage: totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0,
        isUserVote: opt.id === userVote,
      })),
    }
  })
}

/**
 * Submit a poll vote for a user.
 *
 * Steps:
 *  1. Validate the poll exists and is active
 *  2. Validate the option belongs to the poll
 *  3. Check the user hasn't already voted on this poll
 *  4. Create PollResponse record
 *  5. Increment PollOption voteCount
 *  6. Add community contribution
 */
export async function submitPollVote(
  userId: string,
  pollId: string,
  optionId: string
): Promise<{
  success: boolean
  error?: string
}> {
  // 1. Validate poll exists and is active
  const poll = await prisma.pollQuestion.findUnique({
    where: { id: pollId },
    include: { options: true },
  })

  if (!poll || !poll.isActive) {
    return { success: false, error: 'Poll not found or inactive' }
  }

  // Check if poll has closed
  if (poll.closesAt && poll.closesAt < new Date()) {
    return { success: false, error: 'Poll has closed' }
  }

  // 2. Validate the option belongs to this poll
  const validOption = poll.options.find((opt) => opt.id === optionId)
  if (!validOption) {
    return { success: false, error: 'Invalid option for this poll' }
  }

  // 3. Check user hasn't already voted
  const existingVote = await prisma.pollResponse.findUnique({
    where: {
      userId_pollId: { userId, pollId },
    },
  })

  if (existingVote) {
    return { success: false, error: 'Already voted on this poll' }
  }

  // 4. Create PollResponse and 5. Increment vote count atomically
  await prisma.$transaction([
    prisma.pollResponse.create({
      data: {
        userId,
        pollId,
        optionId,
      },
    }),
    prisma.pollOption.update({
      where: { id: optionId },
      data: { voteCount: { increment: 1 } },
    }),
  ])

  // 6. Add community contribution
  await addCommunityContribution(userId, 'poll_vote', 1)

  // Check badges (non-blocking)
  checkAndAwardBadges(userId).catch((err) => {
    console.error('Badge check failed:', err)
  })

  return { success: true }
}
