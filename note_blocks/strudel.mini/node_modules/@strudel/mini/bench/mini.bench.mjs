import { describe, bench } from 'vitest';

import { calculateSteps } from '../../core/index.mjs';
import { mini } from '../index.mjs';

describe('mini', () => {
  calculateSteps(true);
  bench(
    '+tactus',
    () => {
      mini('a b c*3 [c d e, f g] <a b [c d?]>').fast(64).firstCycle();
    },
    { time: 1000 },
  );

  calculateSteps(false);
  bench(
    '-tactus',
    () => {
      mini('a b c*3 [c d e, f g] <a b [c d?]>').fast(64).firstCycle();
    },
    { time: 1000 },
  );
  calculateSteps(true);
});
