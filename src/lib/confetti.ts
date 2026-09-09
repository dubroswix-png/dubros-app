import confetti from 'canvas-confetti';

/**
 * Dispatches a dual-cannon celebration burst for finished orders.
 */
export function triggerOrderSuccessConfetti() {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#1864F6', '#10B981', '#F59E0B'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#10B981', '#34D399', '#6EE7B7'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#F59E0B', '#FBBF24', '#FCD34D'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Dispatches a refined burst for user creation or status changes.
 */
export function triggerUserCreatedConfetti() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    zIndex: 99999,
    colors: ['#1864F6', '#10B981', '#8B5CF6'],
  });
}

/**
 * Dispatches a gold star/sparkle burst for password update.
 */
export function triggerPasswordSuccessSparkle() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.5 },
    zIndex: 99999,
    ticks: 200,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#F59E0B', '#10B981', '#3B82F6', '#FCD34D'],
  });
}
