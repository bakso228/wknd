// Home anchor — Oberhaching (Rathausplatz).
export const HOME = { lat: 48.0239, lng: 11.5961, label: 'Oberhaching' };

export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Rough drive-minute estimate from straight-line km. Real routing would
// need an API; this is a heuristic good enough for "quick ~Y min" hints.
// Crow-flight to road-distance factor ~1.3, city/highway blend adjusts speed.
export function estimateDriveMin(km) {
  if (km < 3)  return Math.round(km * 2.2 + 3);        // local streets, lights
  if (km < 10) return Math.round(km * 1.7 + 4);        // mixed urban
  if (km < 25) return Math.round(km * 1.3 + 5);        // mostly A-roads
  return Math.round(km * 1.0 + 6);                      // highway
}

export function distanceFromHome(act) {
  if (act?.lat == null || act?.lng == null) return null;
  const km = haversineKm(HOME.lat, HOME.lng, act.lat, act.lng);
  return { km: Math.round(km * 10) / 10, driveMin: estimateDriveMin(km) };
}

export function formatDistance(d) {
  if (!d) return null;
  const kmStr = d.km < 10 ? d.km.toFixed(1) : String(Math.round(d.km));
  return `${kmStr} km · ~${d.driveMin} min`;
}
