/** A place found by the address search or the reverse lookup (OpenStreetMap / Nominatim). */
export type Place = {
  id: string;
  latitude: number;
  longitude: number;
  /** "Carrera 7 # 45-10". */
  title: string;
  /** "Chapinero · Bogotá" (may be empty). */
  subtitle: string;
};

/** The parts of a Nominatim answer the app uses (`format=jsonv2&addressdetails=1`). */
export type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string | null;
  address?: Partial<
    Record<'road' | 'house_number' | 'neighbourhood' | 'suburb' | 'city' | 'town' | 'village' | 'municipality', string>
  >;
};
