import { create } from 'zustand';

/**
 * Onboarding store — manages multi-step onboarding flow state.
 */
export const useOnboardingStore = create((set) => ({
  step: 0,
  language: 'en',
  role: 'STUDENT',
  subjects: [],
  gradeLevel: 5,
  connectionQuality: 'good', // good | slow | offline

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 4) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),
  setLanguage: (language) => set({ language }),
  setRole: (role) => set({ role }),
  setSubjects: (subjects) => set({ subjects }),
  toggleSubject: (subject) =>
    set((state) => ({
      subjects: state.subjects.includes(subject)
        ? state.subjects.filter((s) => s !== subject)
        : [...state.subjects, subject],
    })),
  setGradeLevel: (gradeLevel) => set({ gradeLevel }),
  setConnectionQuality: (connectionQuality) => set({ connectionQuality }),

  reset: () =>
    set({
      step: 0,
      language: 'en',
      role: 'STUDENT',
      subjects: [],
      gradeLevel: 5,
      connectionQuality: 'good',
    }),
}));
