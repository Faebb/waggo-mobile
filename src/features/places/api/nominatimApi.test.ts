import { createNominatimClient } from './nominatimApi';

const result = {
  place_id: 1,
  lat: '4.6361',
  lon: '-74.0645',
  display_name: 'Carrera 7, Chapinero, Bogotá, Colombia',
  address: { road: 'Carrera 7', suburb: 'Chapinero', city: 'Bogotá' },
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

function setup(responses: Response[] = [], sendUserAgent = true) {
  let clock = 0;
  const fetchFn = jest.fn(async (_url: string, _init?: RequestInit) => responses.shift() ?? json([]));
  const sleep = jest.fn(async (ms: number) => {
    clock += ms;
  });
  const client = createNominatimClient({ fetchFn, now: () => clock, sleep, sendUserAgent });
  return { client, fetchFn, sleep, advance: (ms: number) => (clock += ms) };
}

describe('Nominatim client (OSM search, usage policy)', () => {
  it('searches in Colombia, in Spanish, and maps the results', async () => {
    const { client, fetchFn } = setup([json([result])]);

    const places = await client.search('Carrera 7 Bogotá');

    expect(places).toEqual([
      { id: '1', latitude: 4.6361, longitude: -74.0645, title: 'Carrera 7', subtitle: 'Chapinero · Bogotá' },
    ]);
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toMatch(/^https:\/\/nominatim\.openstreetmap\.org\/search\?/);
    expect(url).toContain('q=Carrera%207%20Bogot%C3%A1');
    expect(url).toContain('countrycodes=co');
    expect(url).toContain('accept-language=es');
    expect(url).toContain('format=jsonv2');
    expect((init?.headers as Record<string, string>)['User-Agent']).toBe('Waggo/1.0 (+https://waggo.app)');
  });

  it('does not set the User-Agent on web, where the browser sends its own and the Referer identifies the app', async () => {
    const { client, fetchFn } = setup([json([result])], false);
    await client.search('Carrera 7');
    expect((fetchFn.mock.calls[0]![1]?.headers as Record<string, string>)['User-Agent']).toBeUndefined();
  });

  it('waits so there is at most one request per second', async () => {
    const { client, fetchFn, sleep } = setup([json([result]), json([result])]);

    await Promise.all([client.search('Carrera 7'), client.search('Calle 16')]);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1000);
  });

  it('does not wait when a second has already passed', async () => {
    const { client, sleep, advance } = setup([json([result]), json([result])]);
    await client.search('Carrera 7');
    advance(1500);
    await client.search('Calle 16');
    expect(sleep).not.toHaveBeenCalled();
  });

  it('answers repeated searches and reverse lookups from the cache', async () => {
    const { client, fetchFn } = setup([json([result]), json(result)]);

    await client.search('Carrera 7');
    await client.search('  carrera 7 ');
    await client.reverse({ latitude: 4.636101, longitude: -74.064502 });
    await client.reverse({ latitude: 4.636104, longitude: -74.064498 });

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('skips searches that are too short', async () => {
    const { client, fetchFn } = setup();
    expect(await client.search(' ab ')).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('finds the address of a point, or null when there is none', async () => {
    const { client, fetchFn } = setup([json(result), json({ error: 'Unable to geocode' })]);

    expect(await client.reverse({ latitude: 4.6361, longitude: -74.0645 })).toMatchObject({ title: 'Carrera 7' });
    expect(await client.reverse({ latitude: 0, longitude: 0 })).toBeNull();
    expect(fetchFn.mock.calls[0]![0]).toMatch(/\/reverse\?.*lat=4\.6361.*lon=-74\.0645/);
  });

  it('fails on an HTTP error and does not cache the failure', async () => {
    const { client, fetchFn } = setup([json({}, 429), json([result])]);

    await expect(client.search('Carrera 7')).rejects.toThrow('Nominatim 429');
    expect(await client.search('Carrera 7')).toHaveLength(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('rejects an answer that does not have the expected shape', async () => {
    const { client } = setup([json([{ nope: true }])]);
    await expect(client.search('Carrera 7')).rejects.toThrow();
  });
});
