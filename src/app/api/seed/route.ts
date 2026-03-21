import { NextResponse } from 'next/server';
import { PrismaClient, DayOfWeek } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
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

    console.log('👨‍🏫 Creating Tutor (Jordan)...');
    const jordanUser = await prisma.user.create({
      data: { email: 'jordan@example.com', name: 'Jordan Miller', hashedPassword, role: 'TUTOR' }
    });

    const jordanTutor = await prisma.tutor.create({
      data: {
        userId: jordanUser.id,
        username: 'jordan-math',
        name: 'Jordan Miller',
        email: 'jordan@example.com',
        bio: 'Expert math and physics tutor with 10 years experience.',
        pricePerHour: 45,
        subjects: { connect: [{ id: math.id }, { id: physics.id }] }
      }
    });

    console.log('📅 Adding Availability for Jordan...');
    await prisma.availability.createMany({
      data: [
        { tutorId: jordanTutor.id, day: DayOfWeek.MONDAY, startTime: '09:00', endTime: '11:00' },
        { tutorId: jordanTutor.id, day: DayOfWeek.WEDNESDAY, startTime: '14:00', endTime: '16:00' },
        { tutorId: jordanTutor.id, day: DayOfWeek.FRIDAY, startTime: '10:00', endTime: '12:00' },
      ]
    });

    console.log('🎓 Creating Mock Students...');
    const alexUser = await prisma.user.create({
      data: { email: 'alex@example.com', name: 'Alex Johnson', hashedPassword, role: 'STUDENT' }
    });
    const alexStudent = await prisma.student.create({
      data: { userId: alexUser.id, name: 'Alex Johnson', email: 'alex@example.com' }
    });

    const taylorUser = await prisma.user.create({
      data: { email: 'taylor@example.com', name: 'Taylor Smith', hashedPassword, role: 'STUDENT' }
    });
    const taylorStudent = await prisma.student.create({
      data: { userId: taylorUser.id, name: 'Taylor Smith', email: 'taylor@example.com' }
    });

    console.log('📆 Booking Lessons...');
    await prisma.booking.create({
      data: { tutorId: jordanTutor.id, studentId: alexStudent.id, day: 'MONDAY', timeSlot: '09:00 - 10:00', status: 'CONFIRMED' }
    });
    await prisma.booking.create({
      data: { tutorId: jordanTutor.id, studentId: taylorStudent.id, day: 'WEDNESDAY', timeSlot: '14:00 - 15:00', status: 'PENDING' }
    });

    return NextResponse.json({ message: '✅ Database successfully seeded!' });
    
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}