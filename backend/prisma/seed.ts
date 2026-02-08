import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample data...');

  // Create a sample user
  const user = await prisma.user.create({
    data: {
      displayName: 'John Doe',
      age: 28,
    },
  });

  console.log(`✅ Created sample user: ${user.displayName} (ID: ${user.id})`);

  // Create onboarding record
  const onboarding = await prisma.onboarding.create({
    data: {
      userId: user.id,
      addictionTypes: ['social_media', 'gaming'],
      whenItHappens: ['bored', 'late_night'],
      feelAfter: 'empty',
      frequency: 'few_times_week',
      moneySpent: 'Not applicable',
      impactAreas: ['focus', 'sleep'],
      intention: 'reduce',
      duration: '30_days',
      completedAt: new Date(),
    },
  });

  console.log(`✅ Created sample onboarding record`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
