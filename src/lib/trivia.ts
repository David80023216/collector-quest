import prisma from './prisma'
import { addReward } from './economy'
import { addCommunityContribution } from './community'
import { checkAndAwardBadges } from './badges'
import { LedgerTransactionType } from '@prisma/client'

/**
 * Get today's date as a YYYY-MM-DD string.
 */
function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Get an active trivia question that the user hasn't answered today.
 * Returns null if no unanswered questions are available.
 */
export async function getActiveTrivia(userId: string) {
  const today = getTodayString()

  // Get IDs of questions the user has already answered today
  const answeredToday = await prisma.triviaResponse.findMany({
    where: {
      userId,
      uniqueKey: { startsWith: `${userId}_` },
      answeredAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    select: { questionId: true },
  })

  const answeredIds = answeredToday.map((r) => r.questionId)

  // Find an active question not yet answered today
  const question = await prisma.triviaQuestion.findFirst({
    where: {
      isActive: true,
      id: { notIn: answeredIds.length > 0 ? answeredIds : undefined },
    },
    select: {
      id: true,
      question: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      category: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return question
}

/**
 * Submit an answer to a trivia question.
 *
 * Steps:
 *  1. Check the question exists and is active
 *  2. Check the user hasn't already answered this question today (uniqueKey)
 *  3. Compare the answer to the correct answer
 *  4. Create TriviaResponse record
 *  5. Award points/entries if correct
 *  6. Return result with correct answer and explanation
 */
export async function submitTriviaAnswer(
  userId: string,
  questionId: string,
  answer: string
): Promise<{
  success: boolean
  correct: boolean
  correctAnswer: string
  explanation?: string
  entries?: number
  points?: number
  error?: string
}> {
  const today = getTodayString()
  const uniqueKey = `${userId}_${questionId}_${today}`

  // 1. Get the question
  const question = await prisma.triviaQuestion.findUnique({
    where: { id: questionId },
  })

  if (!question || !question.isActive) {
    return {
      success: false,
      correct: false,
      correctAnswer: '',
      error: 'Question not found or inactive',
    }
  }

  // 2. Check not already answered today
  const existing = await prisma.triviaResponse.findUnique({
    where: { uniqueKey },
  })

  if (existing) {
    return {
      success: false,
      correct: false,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation ?? undefined,
      error: 'Already answered this question today',
    }
  }

  // 3. Compare answer
  const normalizedAnswer = answer.trim().toUpperCase()
  const isCorrect = normalizedAnswer === question.correctAnswer.trim().toUpperCase()

  // 4. Create TriviaResponse
  await prisma.triviaResponse.create({
    data: {
      uniqueKey,
      userId,
      questionId,
      selectedAnswer: normalizedAnswer,
      isCorrect,
    },
  })

  // 5. Award rewards if correct
  let entries = 0
  let points = 0

  if (isCorrect) {
    // Get reward amounts from admin settings
    const settings = await prisma.adminSetting.findMany({
      where: {
        key: { in: ['trivia_correct_entries', 'trivia_correct_points'] },
      },
    })

    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    entries = parseInt(settingsMap['trivia_correct_entries'] ?? '5', 10)
    points = parseInt(settingsMap['trivia_correct_points'] ?? '3', 10)

    if (entries > 0 || points > 0) {
      await addReward(
        userId,
        entries,
        points,
        LedgerTransactionType.MISSION_REWARD,
        'Trivia correct answer',
        questionId
      )
    }
  }

  // Add community contribution
  await addCommunityContribution(userId, 'trivia_answer', 1)

  // Check badges (non-blocking)
  checkAndAwardBadges(userId).catch((err) => {
    console.error('Badge check failed:', err)
  })

  return {
    success: true,
    correct: isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation ?? undefined,
    entries,
    points,
  }
}
