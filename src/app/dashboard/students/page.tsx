import { db } from "@/lib/db";
import { User, Mail, GraduationCap, ChevronRight } from "lucide-react";

export default async function StudentsPage() {
  // Fetch all students from the database
  const students = await db.student.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500">Manage your roster of active learners.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          + Add New Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                    <User size={18} />
                  </div>
                  <span className="font-medium text-slate-900">{student.name}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Mail size={14} />
                    <span>{student.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600">
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}