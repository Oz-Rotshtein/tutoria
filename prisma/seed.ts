import * as dotenv from 'dotenv';
dotenv.config(); // ✨ 1. Force the Mac to read the .env

import { PrismaClient, DayOfWeek } from '@prisma/client';
import { Pool } from 'pg'; // ✨ 2. Import the Postgres pooler
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

console.log("🚀 URL SUCCESSFULLY LOADED! Starting connection...");

// ✨ 3. Pass the loaded URL into the Pool, then into the Adapter
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Clearing existing data...');
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.student.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();

  console.log('📚 Creating School Subjects...');
  const math = await prisma.subject.create({ data: { name: 'Mathematics' } });
  const physics = await prisma.subject.create({ data: { name: 'Physics' } });

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ----------------------------------------------------
  // 1. CREATE MASTER USER & TUTOR PROFILE (Separated)
  // ----------------------------------------------------
  console.log('👨‍🏫 Creating Tutor (Jordan)...');
  
  // Step A: Create Master User
  const jordanUser = await prisma.user.create({
    data: {
      email: 'jordan@example.com',
      name: 'Jordan Miller',
      hashedPassword: hashedPassword,
      role: 'TUTOR',
    }
  });

  // Step B: Create Tutor Profile and link the ID
  const jordanTutor = await prisma.tutor.create({
    data: {
      userId: jordanUser.id, // ✨ Manually linking them here!
      username: 'jordan-math',
      name: 'Jordan Miller',
      email: 'jordan@example.com',
      bio: 'Expert math and physics tutor with 10 years experience.',
      pricePerHour: 45,
      subjects: { connect: [{ id: math.id }, { id: physics.id }] }
    }
  });

  // ----------------------------------------------------
  // 2. CREATE MULTIPLE TIME SLOTS (AVAILABILITY)
  // ----------------------------------------------------
  console.log('📅 Adding Availability for Jordan...');
  await prisma.availability.createMany({
    data: [
      { tutorId: jordanTutor.id, day: DayOfWeek.MONDAY, startTime: '09:00', endTime: '11:00' },
      { tutorId: jordanTutor.id, day: DayOfWeek.WEDNESDAY, startTime: '14:00', endTime: '16:00' },
      { tutorId: jordanTutor.id, day: DayOfWeek.FRIDAY, startTime: '10:00', endTime: '12:00' },
    ]
  });

  // ----------------------------------------------------
  // 3. CREATE MASTER USERS & STUDENT PROFILES (Separated)
  // ----------------------------------------------------
  console.log('🎓 Creating 2 Mock Students...');
  
  // Alex
  const alexUser = await prisma.user.create({
    data: { email: 'alex@example.com', name: 'Alex Johnson', hashedPassword, role: 'STUDENT' }
  });
  const alexStudent = await prisma.student.create({
    data: { userId: alexUser.id, name: 'Alex Johnson', email: 'alex@example.com' }
  });

  // Taylor
  const taylorUser = await prisma.user.create({
    data: { email: 'taylor@example.com', name: 'Taylor Smith', hashedPassword, role: 'STUDENT' }
  });
  const taylorStudent = await prisma.student.create({
    data: { userId: taylorUser.id, name: 'Taylor Smith', email: 'taylor@example.com' }
  });

  // ----------------------------------------------------
  // 4. CREATE BOOKINGS (LESSONS)
  // ----------------------------------------------------
  console.log('📆 Booking Lessons...');
  
  await prisma.booking.create({
    data: {
      tutorId: jordanTutor.id,
      studentId: alexStudent.id,
      day: 'MONDAY',
      timeSlot: '09:00 - 10:00',
      status: 'CONFIRMED'
    }
  });

  await prisma.booking.create({
    data: {
      tutorId: jordanTutor.id,
      studentId: taylorStudent.id,
      day: 'WEDNESDAY',
      timeSlot: '14:00 - 15:00',
      status: 'PENDING'
    }
  });

  await prisma.booking.create({
    data: {
      tutorId: jordanTutor.id,
      studentId: alexStudent.id,
      day: 'FRIDAY',
      timeSlot: '10:00 - 11:00',
      status: 'PENDING'
    }
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });