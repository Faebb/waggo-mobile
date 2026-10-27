import { useEffect, useState } from 'react';

/** Seconds left before another email can be requested; call `restart` right after one is sent. */
export function useResendCountdown(seconds: number) {
  // The screen opens right after an email was sent, so the wait is already running.
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  const waiting = secondsLeft > 0;
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => setSecondsLeft((left) => Math.max(0, left - 1)), 1000);
    return () => clearInterval(timer);
  }, [waiting]);

  return { secondsLeft, waiting, restart: () => setSecondsLeft(seconds) };
}
