export type StoryTone = 'cinematic' | 'poetic' | 'adventurous' | 'documentary'
export type GenerationStatus = 'draft' | 'generating' | 'completed' | 'failed'
export type DocumentaryStatus = 'processing' | 'completed' | 'failed'

export interface Trip {
  id: string
  user_id: string
  title: string
  destination: string | null
  start_date: string | null
  end_date: string | null
  story_tone: StoryTone
  cover_photo_id: string | null
  is_public: boolean
  generation_status: GenerationStatus
  iso_country_code: string | null
  latest_documentary_id: string | null
  created_at: string
  updated_at: string
}

export interface Documentary {
  id: string
  trip_id: string
  user_id: string
  status: DocumentaryStatus
  scene_count: number | null
  video_urls: string[]
  scene_titles: string[] | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  trip_id: string
  storage_path: string
  caption: string | null
  ai_description: string | null
  location_name: string | null
  latitude: number | null
  longitude: number | null
  taken_at: string | null
  order_index: number
  created_at: string
}

export interface StoryChapter {
  id: string
  trip_id: string
  chapter_index: number
  title: string
  narrative: string
  photo_ids: string[] | null
  location_name: string | null
  created_at: string
}
