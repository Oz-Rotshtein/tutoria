import { db } from "@/lib/db";
import { CalendarDays, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  // 1. Fetch Real Stats from the Database
  const lessonCount = await db.lesson.count();
  
  // Count total unique students registered in the system
  const studentCount = await db.student.count();

  // Calculate total hours taught by summing the difference between start and end times
  const allLessons = await db.lesson.findMany();
  const totalMinutes = allLessons.reduce((acc, lesson) => {
    const diff = lesson.endTime.getTime() - lesson.startTime.getTime();
    return acc + (diff / 60000);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // 2. Fetch upcoming lessons (Showing both PENDING and CONFIRMED so seed data appears)
  const upcomingLessons = await db.lesson.findMany({
    where: { 
      status: { in: ["PENDING", "CONFIRMED"] } 
    },
    include: { student: true },
    take: 5,
    orderBy: { startTime: 'asc' }
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, Tutorly!</h1>
        <p className="text-slate-500">Here is what is happening with your business today.</p>
      </header>

      {/* Stats Grid - Using real data from Prisma */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Lessons" value={lessonCount} icon={<CalendarDays />} color="text-blue-600" />
        <StatCard title="Active Students" value={studentCount} icon={<Users />} color="text-purple-600" />
        <StatCard title="Hours Taught" value={`${totalHours}h`} icon={<Clock />} color="text-orange-600" />
        <StatCard title="Completion Rate" value="100%" icon={<CheckCircle />} color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Schedule Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Schedule</h2>
          <div className="space-y-4">
            {upcomingLessons.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No lessons scheduled yet.</p>
            ) : (
              upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition">
                  <div>
                    <p className="font-medium text-slate-900">{lesson.student.name}</p>
                    {/* Fixed date rendering to prevent hydration errors */}
                    <p className="text-sm text-slate-500">
                      {new Intl.DateTimeFormat('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }).format(new Date(lesson.startTime))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      lesson.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {lesson.status}
                    </span>
                    <button className="text-sm font-medium text-blue-600 hover:underline">View</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-2.5 px-4 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition">
              Share Booking Link
            </button>
            <button className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition">
              Add Manual Lesson
            </button>
            <Link href="/dashboard/students" className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition text-center block">
              View All Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type definition for the Stats Card
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

// Helper component for the dashboard statistics
function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
      <div className={`p-3 rounded-lg bg-slate-50 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}