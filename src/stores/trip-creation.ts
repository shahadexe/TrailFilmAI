import { create } from 'zustand'

interface TripCreationState {
  step: 1 | 2
  tripId: string | null
  tripTitle: string
  tripDestination: string
  setStep: (step: 1 | 2) => void
  setTripId: (id: string) => void
  setTripTitle: (title: string) => void
  setTripDestination: (dest: string) => void
  reset: () => void
}

const initialState = {
  step: 1 as const,
  tripId: null,
  tripTitle: '',
  tripDestination: '',
}

export const useTripCreationStore = create<TripCreationState>()((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setTripId: (tripId) => set({ tripId }),
  setTripTitle: (tripTitle) => set({ tripTitle }),
  setTripDestination: (tripDestination) => set({ tripDestination }),
  reset: () => set(initialState),
}))
