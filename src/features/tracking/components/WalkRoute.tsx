import { useRoute } from '../hooks/useRoute';
import { RouteView } from './RouteView';

type Props = { walkId: string; live: boolean };

/** Loads the route of a walk and draws it; refreshes by itself while `live`. Nothing until the first answer. */
export function WalkRoute({ walkId, live }: Props) {
  const route = useRoute(walkId, live);
  return route.data ? <RouteView route={route.data} /> : null;
}
