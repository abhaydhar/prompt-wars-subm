import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StudentProfile, ContentOutput } from '../types/student'

interface StudentState {
  profile: StudentProfile | null;
  history: ContentOutput[];
  setProfile: (profile: StudentProfile) => void;
  addContent: (content: ContentOutput) => void;
  clearProfile: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      profile: null,
      history: [],
      setProfile: (profile) => set({ profile }),
      addContent: (content) => set((state) => ({ 
        history: [content, ...state.history].slice(0, 50) 
      })),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'adaptived-student-storage',
    }
  )
)
