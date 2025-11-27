import { create } from 'zustand';

interface LocationStore {
    pickedLocation: { lat: number; lng: number } | null;
    setPickedLocation: (location: { lat: number; lng: number } | null) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
    pickedLocation: null,
    setPickedLocation: (location) => set({ pickedLocation: location }),
}));
