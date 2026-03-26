import { PrismaClient } from '@prisma/client'

export async function seedPolls(prisma: PrismaClient) {
  console.log('  📊 Seeding poll questions...')

  const pollQuestions = [
    {
      question: 'What\'s your favorite card brand?',
      options: ['Topps', 'Panini', 'Upper Deck', 'Bowman'],
    },
    {
      question: 'Best decade for card design?',
      options: ['1980s', '1990s', '2000s', '2010s+'],
    },
    {
      question: 'Do you prefer graded or raw cards?',
      options: ['Graded all the way', 'Raw only', 'Depends on the card', 'No preference'],
    },
    {
      question: 'What\'s more exciting: ripping packs or buying singles?',
      options: ['Ripping packs', 'Buying singles', 'Both equally', 'Breaks are the way'],
    },
    {
      question: 'Which sport has the best cards to collect?',
      options: ['Baseball', 'Basketball', 'Football', 'Hockey'],
    },
    {
      question: 'What\'s your preferred grading company?',
      options: ['PSA', 'BGS / Beckett', 'SGC', 'CGC'],
    },
    {
      question: 'Most overrated card product of all time?',
      options: ['1990 Donruss', '1991 Fleer', '2020 Prizm Football', '1989 Topps'],
    },
    {
      question: 'How do you store most of your cards?',
      options: ['Top loaders', 'Binders with pages', 'Graded slabs', 'Shoe boxes'],
    },
    {
      question: 'What type of hit excites you the most?',
      options: ['Autograph', 'Game-used relic', 'Numbered parallel', 'Printing plate 1/1'],
    },
    {
      question: 'How much do you typically spend on cards per month?',
      options: ['Under $50', '$50–$150', '$150–$500', '$500+'],
    },
    {
      question: 'Rookie cards or veteran star cards—which do you prefer collecting?',
      options: ['Rookies for the upside', 'Veterans for the legacy', 'Both equally', 'Only Hall of Famers'],
    },
    {
      question: 'What\'s the best card shop experience?',
      options: ['Finding a hidden gem', 'Ripping a hot box', 'Trading with other collectors', 'Just browsing the showcase'],
    },
    {
      question: 'If you could own one card regardless of price, what would it be?',
      options: ['T206 Honus Wagner', '1952 Topps Mantle', '1986 Fleer Jordan', '2003 Exquisite LeBron patch auto'],
    },
    {
      question: 'How many cards do you own approximately?',
      options: ['Under 100', '100–1,000', '1,000–10,000', '10,000+'],
    },
    {
      question: 'What\'s the most satisfying moment in collecting?',
      options: ['Pulling a big hit from a pack', 'Completing a full set', 'Getting a card back graded high', 'Making a great trade'],
    },
    {
      question: 'Vintage (pre-1980) or modern cards—what do you gravitate toward?',
      options: ['Vintage all the way', 'Modern is where it\'s at', 'A healthy mix of both', 'Only the current year'],
    },
    {
      question: 'What\'s your take on card breaks?',
      options: ['Love them—great value', 'Hate them—rigged feeling', 'Fun to watch, rarely join', 'Never tried one'],
    },
    {
      question: 'Which insert set is the GOAT?',
      options: ['1996 Topps Chrome Refractors', '1993 Finest Refractors', '1997 Precious Metal Gems', '2012 Panini Prizm Silver'],
    },
    {
      question: 'How do you feel about digital cards / NFT cards?',
      options: ['Love them—the future', 'Not for me', 'Cautiously optimistic', 'What are those?'],
    },
    {
      question: 'What makes a card valuable to YOU?',
      options: ['The player on it', 'The condition/grade', 'Rarity and print run', 'Personal nostalgia'],
    },
    {
      question: 'Favorite type of parallel?',
      options: ['Refractors', 'Numbered color parallels', 'Gold parallels', 'Printing plates'],
    },
    {
      question: 'What got you into card collecting?',
      options: ['Family tradition', 'Saw it on social media', 'Investment potential', 'Love of the sport'],
    },
    {
      question: 'How often do you check card prices/values?',
      options: ['Daily', 'Weekly', 'Only when buying/selling', 'I don\'t check prices'],
    },
    {
      question: 'Which is more fun: the chase or the pull?',
      options: ['The anticipation/chase', 'The actual pull/reveal', 'Both equally exciting', 'Neither—I buy singles'],
    },
    {
      question: 'If you could add one feature to Collector Quest, what would it be?',
      options: ['Card price tracker', 'Collection manager', 'Live card breaks', 'Trade marketplace'],
    },
  ]

  for (let i = 0; i < pollQuestions.length; i++) {
    const p = pollQuestions[i]
    const pollId = `poll-${i + 1}`

    const poll = await prisma.pollQuestion.upsert({
      where: { id: pollId },
      update: {
        question: p.question,
      },
      create: {
        id: pollId,
        question: p.question,
      },
    })

    // Delete existing options and recreate
    await prisma.pollOption.deleteMany({ where: { pollId: poll.id } })
    await prisma.pollOption.createMany({
      data: p.options.map((text) => ({
        pollId: poll.id,
        text,
      })),
    })
  }

  console.log(`    ✅ Seeded ${pollQuestions.length} poll questions`)
}
