'use client';

import { useState } from 'react';

// A quick type definition so TypeScript knows what data to expect
interface TutorProfileProps {
  tutor: any; // We use 'any' here temporarily to bypass strict Prisma relation types
}

export default function TutorProfileClient({ tutor }: TutorProfileProps) {
  // State to track which tab is currently active
  const [activeTab, setActiveTab] = useState('About');

  const specialtyHeadline = tutor.subjects?.length > 0 
    ? `Specialist in ${tutor.subjects.map((s: any) => s.name).join(' & ')}`
    : "Professional Tutor";

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      
      {/* 2-Column Grid: Profile Content (Left) + Booking Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Profile (Takes up 2/3 of the screen) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Area */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 bg-rose-700 text-white rounded-2xl shadow-md flex items-center justify-center text-5xl font-bold object-cover">
                  {tutor.name.charAt(0)}
                </div>
                <span className="absolute -bottom-2 -right-2 block h-6 w-6 rounded-full bg-emerald-500 ring-4 ring-white"></span>
              </div>

              {/* Info Area */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{tutor.name}</h1>
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                
                <p className="text-lg text-gray-600 mt-1 font-medium">{specialtyHeadline}</p>
                
                {/* Mocked Stats Row */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-gray-900 font-bold">4.9</span> (124 reviews)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    1450 hours taught
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-10 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['About', 'Education', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                      activeTab === tab 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* DYNAMIC TAB CONTENT */}
            <div className="mt-8 space-y-10 min-h-[300px]">
              
              {activeTab === 'About' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {tutor.bio || "I am a dedicated educator..."}
                  </p>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Subjects I Teach</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {tutor.subjects?.map((subject: any) => (
                        <span key={subject.id} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200">
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Education' && (
                <div className="animate-in fade-in duration-300 text-center py-10 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                  <p>Education history is currently empty.</p>
                </div>
              )}

              {activeTab === 'Reviews' && (
                <div className="animate-in fade-in duration-300 text-center py-10 text-gray-500">
                   <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <p>No reviews yet. Be the first to book a lesson!</p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Sticky Booking Sidebar */}
        <div className="lg:col-span-1">
          {/* 'sticky top-8' makes it lock to the screen as you scroll */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Book a Lesson</h2>
            
            <div className="flex items-end gap-1 mb-6 pb-6 border-b border-gray-100">
              <span className="text-4xl font-extrabold text-indigo-600">${tutor.pricePerHour}</span>
              <span className="text-gray-500 font-medium pb-1">/ hour</span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
            <div className="space-y-3 mb-8">
              {tutor.availability?.length > 0 ? (
                tutor.availability.map((slot: any) => (
                  <div key={slot.id} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <span className="font-bold text-gray-700">{slot.day}</span>
                    <span className="text-sm font-medium text-gray-600">{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-2">No availability posted yet.</p>
              )}
            </div>

            <button className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition shadow-sm hover:shadow-md flex justify-center items-center gap-2">
              <span>Book {tutor.name.split(' ')[0]} Now</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
            <p className="text-xs text-center text-gray-400 mt-3 font-medium">You won't be charged yet</p>
          </div>
        </div>

      </div>
    </div>
  );
}