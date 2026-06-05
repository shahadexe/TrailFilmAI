import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson'

interface CountryFeature extends Feature<Polygon | MultiPolygon> {
  properties: {
    ISO_A2: string
    ADMIN: string
  }
}

let worldGeoJSON: FeatureCollection<Polygon | MultiPolygon> | null = null

async function getWorldGeoJSON(): Promise<FeatureCollection<Polygon | MultiPolygon>> {
  if (worldGeoJSON) return worldGeoJSON

  const res = await fetch(
    'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
  )
  if (!res.ok) throw new Error('Failed to load world GeoJSON')
  worldGeoJSON = (await res.json()) as FeatureCollection<Polygon | MultiPolygon>
  return worldGeoJSON
}

export async function reverseGeocodeCountry(
  lat: number,
  lng: number
): Promise<{ isoCode: string; name: string } | null> {
  try {
    const geojson = await getWorldGeoJSON()

    // Build a minimal GeoJSON point inline (avoids @turf/helpers dependency)
    const pt: Feature<{ type: 'Point'; coordinates: [number, number] }> = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {},
    }

    for (const feature of geojson.features as CountryFeature[]) {
      if (!feature.geometry) continue
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (booleanPointInPolygon(pt as any, feature as any)) {
          return {
            isoCode: feature.properties?.ISO_A2 ?? '',
            name: feature.properties?.ADMIN ?? '',
          }
        }
      } catch {
        // Skip malformed geometries
      }
    }

    return null
  } catch {
    return null
  }
}
