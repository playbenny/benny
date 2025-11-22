import { describe, bench } from 'vitest';

import { calculateSteps, sequence, stack } from '../index.mjs';

const pat64 = sequence(...Array(64).keys());

describe('steps', () => {
  calculateSteps(true);
  bench(
    '+tactus',
    () => {
      pat64.iter(64).fast(64).firstCycle();
    },
    { time: 1000 },
  );

  calculateSteps(false);
  bench(
    '-tactus',
    () => {
      pat64.iter(64).fast(64).firstCycle();
    },
    { time: 1000 },
  );
});

describe('stack', () => {
  calculateSteps(true);
  bench(
    '+tactus',
    () => {
      stack(pat64, pat64, pat64, pat64, pat64, pat64, pat64, pat64).fast(64).firstCycle();
    },
    { time: 1000 },
  );

  calculateSteps(false);
  bench(
    '-tactus',
    () => {
      stack(pat64, pat64, pat64, pat64, pat64, pat64, pat64, pat64).fast(64).firstCycle();
    },
    { time: 1000 },
  );
});
calculateSteps(true);
