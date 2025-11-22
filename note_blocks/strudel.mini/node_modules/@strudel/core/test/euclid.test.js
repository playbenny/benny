import { bjork } from '../euclid.mjs';
import { describe, expect, it } from 'vitest';
import { fastcat } from '../pattern.mjs';

describe('bjork', () => {
  it('should apply bjorklund to ons and steps', () => {
    expect(bjork(3, 8)).toStrictEqual([1, 0, 0, 1, 0, 0, 1, 0]);
    expect(bjork(-3, 8)).toStrictEqual([0, 1, 1, 0, 1, 1, 0, 1]);
    expect(bjork(8, 8)).toStrictEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(bjork(-8, 8)).toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(bjork(5, 8)).toStrictEqual([1, 0, 1, 1, 0, 1, 1, 0]);
  });
});

describe('euclid', () => {
  it('Can create euclid', () => {
    expect(
      fastcat('a')
        .euclid(3, 8)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 1/8: a', '3/8 → 1/2: a', '3/4 → 7/8: a']);
    expect(
      fastcat('a')
        .euclid(5, 8)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 1/8: a', '1/4 → 3/8: a', '3/8 → 1/2: a', '5/8 → 3/4: a', '3/4 → 7/8: a']);
  });
});

describe('euclidRot', () => {
  it('Can create euclidRot', () => {
    expect(
      fastcat('a')
        .euclidRot(3, 8, 2)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 1/8: a', '1/4 → 3/8: a', '5/8 → 3/4: a']);
    expect(
      fastcat('a')
        .euclidRot(5, 8, 2)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 1/8: a', '1/4 → 3/8: a', '1/2 → 5/8: a', '5/8 → 3/4: a', '7/8 → 1/1: a']);
  });
});

describe('euclidLegato', () => {
  it('Can create euclidLegato', () => {
    expect(
      fastcat('a')
        .euclidLegato(3, 8)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 3/8: a', '3/8 → 3/4: a', '3/4 → 1/1: a']);
    expect(
      fastcat('a')
        .euclidLegato(5, 8)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 1/4: a', '1/4 → 3/8: a', '3/8 → 5/8: a', '5/8 → 3/4: a', '3/4 → 1/1: a']);
  });
});

describe('euclidLegatoRot', () => {
  it('Can create euclidLegatoRot', () => {
    expect(
      fastcat('a')
        .euclidLegatoRot(3, 8, 2)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 1/4: a', '1/4 → 5/8: a', '5/8 → 1/1: a']);
    expect(
      fastcat('a')
        .euclidLegatoRot(5, 8, 2)
        .firstCycle()
        .sort((a, b) => a.part.begin.sub(b.part.begin))
        .map((a) => a.showWhole(true)),
    ).toStrictEqual(['0/1 → 1/4: a', '1/4 → 1/2: a', '1/2 → 5/8: a', '5/8 → 7/8: a', '7/8 → 1/1: a']);
  });
});
