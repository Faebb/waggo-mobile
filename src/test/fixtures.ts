/** Data of the spec examples (RF-004, RF-007) as waggo-api returns it. */
export const luna = {
  id: 'pet-luna',
  name: 'Luna',
  breed: 'Criolla',
  size: 'Medium',
  birthDate: null,
  weightKg: 14.5,
  medicalNotes: 'Alérgica al pollo',
};

export const max = {
  id: 'pet-max',
  name: 'Max',
  breed: null,
  size: 'Small',
  birthDate: null,
  weightKg: null,
  medicalNotes: null,
};

export const requestedWalk = {
  id: 'walk-1',
  status: 'Requested',
  petIds: ['pet-luna'],
  walkType: 'Individual',
  durationMinutes: 60,
  pickupAddress: 'Cra 7 # 45-10, Bogotá',
  latitude: 4.6361,
  longitude: -74.0645,
  scheduledFor: '2026-09-30T15:00:00+00:00',
  notes: 'Timbre dañado',
  currency: 'COP',
  total: 23000,
  commission: 4600,
  walkerPayout: 18400,
  walkerId: null,
  requestedAt: '2026-09-30T15:00:00+00:00',
  startedAt: null as string | null,
  finishedAt: null as string | null,
};

/** An open request as a walker sees it (`AvailableWalkResponse`). */
export const availableWalk = {
  id: 'walk-1',
  walkType: 'Individual',
  durationMinutes: 60,
  petCount: 1,
  pickupAddress: 'Cra 7 # 45-10, Bogotá',
  latitude: 4.6361,
  longitude: -74.0645,
  scheduledFor: '2026-09-30T15:00:00+00:00',
  currency: 'COP',
  walkerPayout: 18400,
  distanceKm: null as number | null,
};

export const acceptedWalk = { ...requestedWalk, status: 'Accepted', walkerId: 'dev-walker' };

export const fareQuote = {
  walkType: 'Individual',
  durationMinutes: 60,
  currency: 'COP',
  total: 23000,
  commission: 4600,
  walkerPayout: 18400,
};

/** RF-002/RF-003: a walker profile waiting for verification. */
export const pendingWalkerProfile = {
  id: 'wp-1',
  fullName: 'Andrés Gómez',
  documentType: 'CC',
  documentLast4: '4050',
  phone: '3001234567',
  experience: '3 años con perros grandes',
  status: 'Pending',
  rejectionReason: null,
  registeredAt: '2026-09-30T08:00:00Z',
};

export const approvedWalkerProfile = { ...pendingWalkerProfile, status: 'Approved' };

/** RF-016: the fare of `requestedWalk` held on the owner's payment method. */
export const heldPayment = {
  walkId: 'walk-1',
  status: 'Held',
  currency: 'COP',
  total: 23000,
  commission: 4600,
  walkerPayout: 18400,
  heldAt: '2026-09-30T15:00:00+00:00',
  capturedAt: null as string | null,
  releasedAt: null as string | null,
};

export const capturedPayment = { ...heldPayment, status: 'Captured', capturedAt: '2026-09-30T16:05:00+00:00' };
