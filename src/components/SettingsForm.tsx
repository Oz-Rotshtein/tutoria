"use client";

import React, { useState, useId } from 'react';
import { Save, DollarSign, User, BookOpen } from 'lucide-react';
import CreatableSelect from 'react-select/creatable'; 
import { MultiValue } from 'react-select';
import { updateTutorProfile } from '@/app/actions/tutor';

interface Option {
  readonly value: string;
  readonly label: string;
}

const COMMON_SUBJECTS: Option[] = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'English', label: 'English' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
];

interface TutorData {
  id: string;
  bio: string | null;
  pricePerHour: number;
  subjects: { id: string; name: string }[];
}

// THIS IS THE COMPONENT
export default function SettingsForm({ initialData }: { initialData: TutorData }) {
  const [price, setPrice] = useState(initialData.pricePerHour);
  const [bio, setBio] = useState(initialData.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Stable ID to fix the console error
  const instanceId = useId(); 

  const [selectedSubjects, setSelectedSubjects] = useState<MultiValue<Option>>(
    initialData.subjects.map(s => ({ value: s.name, label: s.name }))
  );

  const handleSave = async () => {
    setIsSaving(true);
    const subjectNames = selectedSubjects.map(s => s.value);

    const result = await updateTutorProfile(initialData.id, {
      bio: bio,
      pricePerHour: price,
      subjects: subjectNames
    });

    if (result.success) {
      alert("Profile Saved Successfully!");
    } else {
      alert("Error: " + result.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <section className="space-y-4">
        <label className="flex items-center gap-2 font-bold text-slate-900">
          <BookOpen size={18} className="text-indigo-600" /> 
          Subjects I Teach
        </label>
        
        <CreatableSelect
          instanceId={instanceId} 
          isMulti
          options={COMMON_SUBJECTS}
          value={selectedSubjects}
          onChange={(newValue: MultiValue<Option>) => setSelectedSubjects(newValue)}
          formatCreateLabel={(inputValue) => `Add new subject: "${inputValue}"`}
          className="basic-multi-select"
          classNamePrefix="select"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: '1rem',
              padding: '0.5rem',
              borderColor: '#e2e8f0',
              boxShadow: 'none',
              ':hover': { borderColor: '#6366f1' }
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: '#e0e7ff',
              borderRadius: '0.5rem',
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: '#4338ca', 
              fontWeight: 600,
            }),
          }}
        />
      </section>

      <section className="space-y-4">
        <label className="flex items-center gap-2 font-bold text-slate-900">
          <DollarSign size={18} className="text-indigo-600" /> Hourly Rate ($)
        </label>
        <input 
          type="number" 
          className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </section>

      <section className="space-y-4">
        <label className="flex items-center gap-2 font-bold text-slate-900">
          <User size={18} className="text-indigo-600" /> About Me
        </label>
        <textarea 
          rows={6}
          className="w-full p-4 border rounded-2xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-600 leading-relaxed"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </section>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSaving ? "Saving..." : <><Save size={20} /> Save Changes</>}
      </button>
    </div>
  );
}