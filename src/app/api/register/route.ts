import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique username for tutors
    const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const uniqueUsername = `${baseUsername}-${Math.floor(Math.random() * 10000)}`;

    // Create the User AND their connected Profile based on your exact schema
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        hashedPassword,
        role: role as Role,
        // ✨ Using YOUR exact relation names:
        ...(role === "TUTOR" && {
          tutorProfile: {
            create: {
              name,
                email: email.toLowerCase(),
              username: uniqueUsername,
              bio: "",
              pricePerHour: 30,
              defaultDuration: 60,
            }
          }
        }),
        ...(role === "STUDENT" && {
          studentProfile: {
            create: {
              name,
              email: email.toLowerCase(),
            }
          }
        })
      },
    });

    const { hashedPassword: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong during registration." }, { status: 500 });
  }
}