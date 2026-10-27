import type { NominatimPlace, Place } from './types';

/** Main line and area of a Nominatim answer, with Colombian street numbers ("Carrera 7 # 45-10"). */
export function placeFromNominatim(raw: NominatimPlace): Place {
  const address = raw.address ?? {};
  const street = address.road ? [address.road, address.house_number].filter(Boolean).join(' # ') : '';
  const title = street || raw.name || raw.display_name.split(',')[0]?.trim() || raw.display_name;
  const area = address.neighbourhood ?? address.suburb;
  const city = address.city ?? address.town ?? address.village ?? address.municipality;
  return {
    id: String(raw.place_id),
    latitude: Number(raw.lat),
    longitude: Number(raw.lon),
    title,
    subtitle: [area, city].filter(Boolean).join(' · '),
  };
}

/** The pickup address sent to the API: "Carrera 7 # 45-10, Chapinero, Bogotá". */
export function addressOf(place: Place): string {
  return [place.title, ...place.subtitle.split(' · ')].filter(Boolean).join(', ');
}
