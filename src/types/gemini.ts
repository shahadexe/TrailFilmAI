export interface PhotoInput {
  id: string
  url: string
  takenAt?: string
  latitude?: number
  longitude?: number
  locationName?: string
}

export interface GeneratedChapter {
  title: string
  narrative: string
  photoIndices: number[]
  locationName: string | null
}
