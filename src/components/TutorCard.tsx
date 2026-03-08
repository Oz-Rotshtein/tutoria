import Link from "next/link";
import { User, Star } from "lucide-react";
// 1. Import Prisma from your generated client
import { Prisma } from "@prisma/client";

// 2. Tell TypeScript exactly what this object looks like (Tutor + Subjects)
type TutorWithSubjects = Prisma.TutorGetPayload<{
  include: { subjects: true };
}>;

interface TutorCardProps {
  tutor: TutorWithSubjects; // 3. Replace 'any' with our perfect custom type!
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        {/* Profile Image / Avatar Placeholder */}
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm overflow-hidden shrink-0">
          {tutor.profileImage ? (
            <img src={tutor.profileImage} alt={tutor.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>
        
        {/* Mock Rating */}
        <div className="bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-amber-700 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-700" /> 4.9
        </div>
      </div>

      {/* Tutor Info */}
      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
        {tutor.name}
      </h3>
      
      <p className="text-slate-500 text-sm line-clamp-2 mt-2 mb-4 flex-grow">
        {tutor.bio || "This tutor hasn't written a bio yet."}
      </p>

      {/* Subjects Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tutor.subjects?.slice(0, 3).map((subject) => (
          <span key={subject.id} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
            {subject.name}
          </span>
        ))}
        {tutor.subjects?.length > 3 && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 px-2.5 py-1 rounded-md">
            +{tutor.subjects.length - 3} more
          </span>
        )}
      </div>

      {/* Bottom Row: Price & Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div>
          <span className="text-2xl font-black text-slate-900">${tutor.pricePerHour}</span>
          <span className="text-slate-400 text-xs font-bold">/hr</span>
        </div>
        <Link 
          // ✨ CHANGED HERE: Now it securely uses the username slug!
          href={`/tutor/${tutor.username}`}
          className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}