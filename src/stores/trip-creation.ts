import { create } from 'zustand'
import type { StoryTone } from '@/types/database'

interface TripCreationState {
  step: 1 | 2 | 3
  tripId: string | null
  tripTitle: string
  tripDestination: string
  selectedTone: StoryTone
  setStep: (step: 1 | 2 | 3) => void
  setTripId: (id: string) => void
  setTripTitle: (title: string) => void
  setTripDestination: (dest: string) => void
  setSelectedTone: (tone: StoryTone) => void
  reset: () => void
}

const initialState = {
  step: 1 as 1 | 2 | 3,
  tripId: null,
  tripTitle: '',
  tripDestination: '',
  selectedTone: 'cinematic' as StoryTone,
}

export const useTripCreationStore = create<TripCreationState>()((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setTripId: (tripId) => set({ tripId }),
  setTripTitle: (tripTitle) => set({ tripTitle }),
  setTripDestination: (tripDestination) => set({ tripDestination }),
  setSelectedTone: (selectedTone) => set({ selectedTone }),
  reset: () => set(initialState),
}))
