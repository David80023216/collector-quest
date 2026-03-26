import { PrismaClient } from '@prisma/client'
import { seedOther } from './seed/other'
import { seedMissions } from './seed/missions'
import { seedTrivia } from './seed/trivia'
import { seedPolls } from './seed/polls'

const prisma = new PrismaClient()

async function main() {
  console.log('🃏 Seeding Collector Quest database...\n')

  await seedOther(prisma)
  await seedMissions(prisma)
  await seedTrivia(prisma)
  await seedPolls(prisma)

  console.log('\n✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
