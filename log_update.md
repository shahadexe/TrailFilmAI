# Update Log

## 2026-05-20

### Google Maps Places Search Bar
- Replaced manual pin-click location flow with Google Places Autocomplete search
- Each chapter in the "Add missing locations" panel now has a search bar powered by `useMapsLibrary('places')`
- Selecting a place from the dropdown automatically resolves lat/lng — no map clicking required
- Search field shows a search icon, turns amber-tinted when a place is selected, and includes a clear (×) button
- Coordinates display below the input once a place is selected
- "Save location" button stays disabled until a place is selected from autocomplete
- Installed `@types/google.maps` as a dev dependency

### Files Changed
- `src/components/viewer/LocationEditor.tsx` — replaced Pin button + crosshair mode with `PlaceSearch` component using Google Places Autocomplete
- `src/components/viewer/ViewerMap.tsx` — removed pin-placing mode props (`pinPlacingForChapter`, `onPinPlaced`, `onCancelPinPlacing`), simplified component
- `src/components/viewer/CinematicViewer.tsx` — removed `pinPlacingForChapter` state and related handlers, moved `LocationEditor` inside `APIProvider` so it can access `useMapsLibrary`

### Powered by Google Maps Attribution
- Added "Powered by Google Maps" attribution to the landing page footer
- Placed right-aligned next to copyright line with subtle styling (40% opacity, pin icon)

### Files Changed
- `src/app/(marketing)/page.tsx` — added Google Maps attribution to footer
