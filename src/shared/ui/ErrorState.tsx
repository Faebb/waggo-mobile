import { Banner } from './Banner';

type Props = { message: string; onRetry: () => void };

/** Failed load (design proposal 03, `ErrorState`): a danger banner with "Intentar de nuevo". */
export function ErrorState({ message, onRetry }: Props) {
  return <Banner tone="danger" message={message} actionLabel="Intentar de nuevo" onAction={onRetry} />;
}
