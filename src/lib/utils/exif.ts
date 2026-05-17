import exifr from 'exifr'

export interface ExifData {
  takenAt: Date | null
  latitude: number | null
  longitude: number | null
}

export async function extractExif(file: File): Promise<ExifData> {
  try {
    const data = await exifr.parse(file, {
      gps: true,
      pick: ['DateTimeOriginal', 'latitude', 'longitude'],
    })

    return {
      takenAt: data?.DateTimeOriginal ?? null,
      latitude: data?.latitude ?? null,
      longitude: data?.longitude ?? null,
    }
  } catch {
    return { takenAt: null, latitude: null, longitude: null }
  }
}
