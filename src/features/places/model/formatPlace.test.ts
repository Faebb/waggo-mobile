import { addressOf, placeFromNominatim } from './formatPlace';

const chapinero = {
  place_id: 123,
  lat: '4.6361',
  lon: '-74.0645',
  display_name: '45-10, Carrera 7, Chapinero, Bogotá, Bogotá D.C., Colombia',
  address: { road: 'Carrera 7', house_number: '45-10', suburb: 'Chapinero', city: 'Bogotá' },
};

describe('placeFromNominatim', () => {
  it('writes the street the Colombian way with "#" and the neighborhood and city below', () => {
    expect(placeFromNominatim(chapinero)).toEqual({
      id: '123',
      latitude: 4.6361,
      longitude: -74.0645,
      title: 'Carrera 7 # 45-10',
      subtitle: 'Chapinero · Bogotá',
    });
  });

  it('uses the name or the first part of the full address when there is no street', () => {
    expect(
      placeFromNominatim({ ...chapinero, address: { town: 'Valledupar' }, name: 'Parque de la Leyenda' }).title,
    ).toBe('Parque de la Leyenda');
    expect(placeFromNominatim({ ...chapinero, address: undefined }).title).toBe('45-10');
    expect(placeFromNominatim({ ...chapinero, address: { road: 'Calle 16' } })).toMatchObject({
      title: 'Calle 16',
      subtitle: '',
    });
  });
});

describe('addressOf', () => {
  it('joins title and area as the pickup address', () => {
    expect(addressOf(placeFromNominatim(chapinero))).toBe('Carrera 7 # 45-10, Chapinero, Bogotá');
    expect(addressOf({ id: '1', latitude: 0, longitude: 0, title: 'Calle 16', subtitle: '' })).toBe('Calle 16');
  });
});
