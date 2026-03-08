import { db } from "@/lib/db";
import TutorCard from "@/components/TutorCard";
import SearchBar from "@/components/SearchBar"; // ✨ Import the new Client Component
import { Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; // ✨ Next.js 15 requires searchParams to be a Promise
}) {
  // 1. Resolve the search parameters from the URL
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.q || "";

  // 2. Dynamically build the Prisma query
  // If there is a search query, look for tutors who have a matching subject.
  // If the query is empty, this just becomes an empty object {} and returns everyone.
  const whereClause = searchQuery ? {
    subjects: {
      some: {
        name: {
          contains: searchQuery,
          mode: "insensitive" as const, // Ignores uppercase/lowercase (e.g., "math" finds "Math")
        }
      }
    }
  } : {};

  // 3. Fetch the tutors using the dynamic where clause
  const tutors = await db.tutor.findMany({
    where: whereClause,
    include: {
      subjects: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" /> Over 500+ Expert Tutors
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Find the perfect tutor <br /> for <span className="text-indigo-600">any subject.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            Book personalized 1-on-1 lessons with expert tutors. 
            Flexible scheduling, affordable rates, and proven results.
          </p>

          {/* ✨ Drop in your interactive Search Bar */}
          <SearchBar />
          
        </div>
      </section>

      {/* Tutor Grid */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {searchQuery ? `Search results for "${searchQuery}"` : "Available Tutors"}
          </h2>
          <span className="text-slate-400 font-bold text-sm">{tutors.length} results</span>
        </div>

        {tutors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
            <p className="text-slate-400 font-bold text-lg mb-2">No tutors found for "{searchQuery}"</p>
            <p className="text-slate-500 text-sm">Try searching for a different subject, like "Math" or "English".</p>
          </div>
        )}
      </section>
    </main>
  );
}