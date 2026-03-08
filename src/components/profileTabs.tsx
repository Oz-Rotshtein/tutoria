"use client";

import { useState } from "react";
import { User, GraduationCap, Briefcase } from "lucide-react";
import { Education, Experience } from "@prisma/client";

interface ProfileTabsProps {
  bio: string | null;
  education: Education[];
  experience: Experience[];
}

export default function ProfileTabs({ bio, education, experience }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"bio" | "education" | "experience">("bio");

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveTab("bio")}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === "bio" ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className="w-4 h-4" /> About
        </button>
        <button
          onClick={() => setActiveTab("education")}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === "education" ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Education
        </button>
        <button
          onClick={() => setActiveTab("experience")}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === "experience" ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Briefcase className="w-4 h-4" /> Experience
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="p-8 min-h-[300px]">
        {activeTab === "bio" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About Me</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
              {bio || "This tutor hasn't written a bio yet."}
            </p>
          </div>
        )}

        {activeTab === "education" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Education History</h2>
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-slate-600 font-medium">{edu.institution}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">
                      {edu.startYear} - {edu.endYear || "Present"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No education details listed.</p>
            )}
          </div>
        )}

        {activeTab === "experience" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Teaching Experience</h2>
            {experience.length > 0 ? (
              <div className="space-y-6">
                {experience.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-slate-100">
                    <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5"></div>
                    <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
                    <p className="text-indigo-600 font-semibold mb-2">{exp.company}</p>
                    <p className="text-sm font-bold text-slate-400 mb-3">
                      {exp.startYear} - {exp.endYear || "Present"}
                    </p>
                    {exp.description && <p className="text-slate-600">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No experience details listed.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}