import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Force the stable library engine to avoid the Prisma 7.3.0 "graph" bug
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create or Update Subjects
  const english = await prisma.Subject.upsert({
    where: { name: 'English' },
    update: {},
    create: { name: 'English' },
  });

  const math = await prisma.subject.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: { name: 'Mathematics' },
  });

  // 2. Create or Update the Tutor (Sarah Smith)
  // We connect her to the English subject during creation/update
  const tutor = await prisma.tutor.upsert({
    where: { email: 'sarah.smith@tutorly.com' },
    update: {
      subjects: {
        connect: { id: english.id }
      }
    },
    create: {
      name: 'Dr. Sarah Smith',
      email: 'sarah.smith@tutorly.com',
      defaultDuration: 45,
      subjects: {
        connect: { id: english.id }
      }
    },
  });

  // 3. Create or Update Students and Connect them to the Tutor
  const alice = await prisma.student.upsert({
    where: { email: 'alice@example.com' },
    update: {
      tutors: { connect: { id: tutor.id } }
    },
    create: {
      name: 'Alice Wonderland',
      email: 'alice@example.com',
      tutors: { connect: { id: tutor.id } }
    },
  });

  const bob = await prisma.student.upsert({
    where: { email: 'bob.builder@example.com' },
    update: {
      tutors: { connect: { id: tutor.id } }
    },
    create: {
      name: 'Bob Builder',
      email: 'bob.builder@example.com',
      tutors: { connect: { id: tutor.id } }
    },
  });

  // 4. Create Lessons
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrow.getMinutes() + 45);

  await prisma.lesson.create({
    data: {
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: 'CONFIRMED',
      tutorId: tutor.id,
      studentId: alice.id,
    },
  });

  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });