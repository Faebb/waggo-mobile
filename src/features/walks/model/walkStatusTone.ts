import type { StatusTone } from '@/shared/ui/StatusPill';

import type { WalkStatus } from './types';

/** Color of each walk status in a `StatusPill` (design proposal 03); the pill always shows the word too. */
export function walkStatusTone(status: WalkStatus): StatusTone {
  switch (status) {
    case 'Requested':
      return 'info';
    case 'Accepted':
      return 'primary';
    case 'InProgress':
      return 'success';
    case 'Completed':
      return 'muted';
    case 'Cancelled':
      return 'danger';
  }
}
