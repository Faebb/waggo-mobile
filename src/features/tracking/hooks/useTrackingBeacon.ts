import { useEffect, useRef } from 'react';

import { getCurrentLocation } from '@/shared/location/getCurrentLocation';

import { recordTrack } from '../api/trackingApi';
import type { TrackPointDraft } from '../model/types';

/** How often the walker's phone records its position during a walk. */
export const BEACON_INTERVAL_MS = 15_000;

/**
 * While `enabled`, records the device position every `intervalMs` and sends it. Positions that fail to be sent
 * (no signal) stay in a buffer and go in the next batch, so the route has no gaps (RNF-007).
 */
export function useTrackingBeacon(walkId: string, enabled: boolean, intervalMs: number = BEACON_INTERVAL_MS) {
  const pending = useRef<TrackPointDraft[]>([]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let sending = false;
    const timer = setInterval(async () => {
      const position = await getCurrentLocation();
      if (position) {
        pending.current.push({ ...position, recordedAt: new Date().toISOString() });
      }
      if (sending || pending.current.length === 0) {
        return;
      }

      sending = true;
      const batch = pending.current.slice(0, 100);
      try {
        await recordTrack(walkId, batch);
        pending.current = pending.current.slice(batch.length);
      } catch {
        // Keep the positions; they go with the next batch.
      } finally {
        sending = false;
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [walkId, enabled, intervalMs]);
}
