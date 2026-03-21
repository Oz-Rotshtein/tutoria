import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "STUDENT" | "TUTOR"
    } & DefaultSession["user"]
  }

  interface User {
    role: "STUDENT" | "TUTOR"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "STUDENT" | "TUTOR"
  }
}