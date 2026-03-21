import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardTrafficCop() {
  const session = await getServerSession(authOptions);

  // 1. If they aren't logged in at all, kick them to the sign-in page
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // 2. If they are a TUTOR, teleport them to the tutor workspace
  if (session.user.role === "TUTOR") {
    redirect("/dashboard/tutor");
  }

  // 3. If they are a STUDENT, teleport them to the student workspace
  if (session.user.role === "STUDENT") {
    redirect("/dashboard/student");
  }

  // Fallback just in case something weird happens
  redirect("/");
}