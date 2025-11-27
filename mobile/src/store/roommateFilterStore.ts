import { create } from 'zustand';

interface RoommateFilterState {
    ageRange: number[];
    gender: 'MALE' | 'FEMALE' | 'ALL';
    location: string;
    budgetRange: number[]; // [min, max] in millions
    habits: {
        smoking: boolean;
        quiet: boolean;
        tidy: boolean;
    };
    setAgeRange: (range: number[]) => void;
    setGender: (gender: 'MALE' | 'FEMALE' | 'ALL') => void;
    setLocation: (location: string) => void;
    setBudgetRange: (range: number[]) => void;
    setHabit: (key: 'smoking' | 'quiet' | 'tidy', value: boolean) => void;
    resetFilters: () => void;
}

export const useRoommateFilterStore = create<RoommateFilterState>((set) => ({
    ageRange: [18, 50],
    gender: 'ALL',
    location: '',
    budgetRange: [0, 20],
    habits: {
        smoking: false,
        quiet: false,
        tidy: false,
    },
    setAgeRange: (range) => set({ ageRange: range }),
    setGender: (gender) => set({ gender }),
    setLocation: (location) => set({ location }),
    setBudgetRange: (range) => set({ budgetRange: range }),
    setHabit: (key, value) => set((state) => ({
        habits: { ...state.habits, [key]: value }
    })),
    resetFilters: () => set({
        ageRange: [18, 50],
        gender: 'ALL',
        location: '',
        budgetRange: [0, 20],
        habits: {
            smoking: false,
            quiet: false,
            tidy: false,
        },
    }),
}));
