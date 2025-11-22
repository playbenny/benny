/*
util.test.mjs - Tests for the core 'util' module
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/test/util.test.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { pure } from '../pattern.mjs';
import {
  _mod,
  compose,
  flatten,
  fractionalArgs,
  freqToMidi,
  getFrequency,
  getPlayableNoteValue,
  isNote,
  midiToFreq,
  noteToMidi,
  numeralArgs,
  parseFractional,
  parseNumeral,
  rotate,
  splitAt,
  tokenizeNote,
  zipWith,
} from '../util.mjs';
import { describe, expect, it } from 'vitest';

describe('isNote', () => {
  it('should recognize notes without accidentals', () => {
    'C3 D3 E3 F3 G3 A3 B3 C4 D5 c5 d5 e5'.split(' ').forEach((note) => {
      expect(isNote(note)).toBe(true);
    });
  });
  it('should recognize notes with accidentals', () => {
    'C#3 D##3 Eb3 Fbb3 Bb5'.split(' ').forEach((note) => {
      expect(isNote(note)).toBe(true);
    });
  });
  it('should recognize notes without octave', () => {
    expect(isNote('C')).toBe(true);
    expect(isNote('Bb')).toBe(true);
  });
  it('should not recognize invalid notes', () => {
    expect(isNote('H5')).toBe(false);
    expect(isNote('X')).toBe(false);
    expect(isNote(1)).toBe(false);
  });
});

describe('isNote', () => {
  it('should tokenize notes without accidentals', () => {
    expect(tokenizeNote('C3')).toStrictEqual(['C', '', 3]);
    expect(tokenizeNote('D3')).toStrictEqual(['D', '', 3]);
    expect(tokenizeNote('E3')).toStrictEqual(['E', '', 3]);
    expect(tokenizeNote('F3')).toStrictEqual(['F', '', 3]);
    expect(tokenizeNote('G3')).toStrictEqual(['G', '', 3]);
    expect(tokenizeNote('A3')).toStrictEqual(['A', '', 3]);
    expect(tokenizeNote('B3')).toStrictEqual(['B', '', 3]);
    expect(tokenizeNote('C4')).toStrictEqual(['C', '', 4]);
    expect(tokenizeNote('D5')).toStrictEqual(['D', '', 5]);
  });
  it('should tokenize notes with accidentals', () => {
    expect(tokenizeNote('C#3')).toStrictEqual(['C', '#', 3]);
    expect(tokenizeNote('D##3')).toStrictEqual(['D', '##', 3]);
    expect(tokenizeNote('Eb3')).toStrictEqual(['E', 'b', 3]);
    expect(tokenizeNote('Fbb3')).toStrictEqual(['F', 'bb', 3]);
    expect(tokenizeNote('Bb5')).toStrictEqual(['B', 'b', 5]);
  });
  it('should tokenize notes without octave', () => {
    expect(tokenizeNote('C')).toStrictEqual(['C', '', undefined]);
    expect(tokenizeNote('C#')).toStrictEqual(['C', '#', undefined]);
    expect(tokenizeNote('Bb')).toStrictEqual(['B', 'b', undefined]);
    expect(tokenizeNote('Bbb')).toStrictEqual(['B', 'bb', undefined]);
  });
  it('should not tokenize invalid notes', () => {
    expect(tokenizeNote('X')).toStrictEqual([]);
    expect(tokenizeNote('asfasf')).toStrictEqual([]);
    expect(tokenizeNote(123)).toStrictEqual([]);
  });
});
describe('noteToMidi', () => {
  it('should turn notes into midi', () => {
    expect(noteToMidi('A4')).toEqual(69);
    expect(noteToMidi('C4')).toEqual(60);
    expect(noteToMidi('Db4')).toEqual(61);
    expect(noteToMidi('C3')).toEqual(48);
    expect(noteToMidi('Cb3')).toEqual(47);
    expect(noteToMidi('Cbb3')).toEqual(46);
    expect(noteToMidi('C#3')).toEqual(49);
    expect(noteToMidi('C#3')).toEqual(49);
    expect(noteToMidi('C##3')).toEqual(50);
  });
  it('should throw an error when given a non-note', () => {
    expect(() => noteToMidi('Q')).toThrowError(`not a note: "Q"`);
    expect(() => noteToMidi('Z')).toThrowError(`not a note: "Z"`);
  });
});
describe('midiToFreq', () => {
  it('should turn midi into frequency', () => {
    expect(midiToFreq(69)).toEqual(440);
    expect(midiToFreq(57)).toEqual(220);
  });
});
describe('freqToMidi', () => {
  it('should turn frequency into midi', () => {
    expect(freqToMidi(440)).toEqual(69);
    expect(freqToMidi(220)).toEqual(57);
  });
});
describe('getFrequency', () => {
  const happify = (val, context = {}) => pure(val).firstCycle()[0].setContext(context);
  it('should turn note into frequency', () => {
    expect(getFrequency(happify('a4'))).toEqual(440);
    expect(getFrequency(happify('a3'))).toEqual(220);
  });
  it('should turn midi into frequency', () => {
    expect(getFrequency(happify(69, { type: 'midi' }))).toEqual(440);
    expect(getFrequency(happify(57, { type: 'midi' }))).toEqual(220);
  });
  it('should return frequencies unchanged', () => {
    expect(getFrequency(happify(440, { type: 'frequency' }))).toEqual(440);
    expect(getFrequency(happify(432, { type: 'frequency' }))).toEqual(432);
  });
  it('should turn object with a "freq" property into frequency', () => {
    expect(getFrequency(happify({ freq: 220 }))).toEqual(220);
    expect(getFrequency(happify({ freq: 440 }))).toEqual(440);
  });
  it('should throw an error when given a non-note', () => {
    expect(() => getFrequency(happify('Q'))).toThrowError(`not a note or frequency: Q`);
    expect(() => getFrequency(happify('Z'))).toThrowError(`not a note or frequency: Z`);
  });
});

describe('_mod', () => {
  it('should work like regular modulo with positive numbers', () => {
    expect(_mod(0, 3)).toEqual(0);
    expect(_mod(1, 3)).toEqual(1);
    expect(_mod(2, 3)).toEqual(2);
    expect(_mod(3, 3)).toEqual(0);
    expect(_mod(4, 3)).toEqual(1);
    expect(_mod(4, 2)).toEqual(0);
  });
  it('should work with negative numbers', () => {
    expect(_mod(-1, 3)).toEqual(2);
    expect(_mod(-2, 3)).toEqual(1);
    expect(_mod(-3, 3)).toEqual(0);
    expect(_mod(-4, 3)).toEqual(2);
    expect(_mod(-5, 3)).toEqual(1);
    expect(_mod(-3, 2)).toEqual(1);
  });
});

describe('compose', () => {
  const add1 = (a) => a + 1;
  it('should compose', () => {
    expect(compose(add1, add1)(0)).toEqual(2);
    expect(compose(add1)(0)).toEqual(1);
  });
  const addS = (s) => (a) => a + s;
  it('should compose left to right', () => {
    expect(compose(addS('a'), addS('b'))('')).toEqual('ab');
    expect(compose(addS('a'), addS('b'))('x')).toEqual('xab');
  });
});

describe('getPlayableNoteValue', () => {
  const happify = (val, context = {}) => pure(val).firstCycle()[0].setContext(context);
  it('should return object "note" property', () => {
    expect(getPlayableNoteValue(happify({ note: 'a4' }))).toEqual('a4');
  });
  it('should return object "n" property', () => {
    expect(getPlayableNoteValue(happify({ n: 'a4' }))).toEqual('a4');
  });
  it('should return object "value" property', () => {
    expect(getPlayableNoteValue(happify({ value: 'a4' }))).toEqual('a4');
  });
  it('should turn midi into frequency', () => {
    expect(getPlayableNoteValue(happify(57, { type: 'midi' }))).toEqual(220);
  });
  it('should return frequency value', () => {
    expect(getPlayableNoteValue(happify(220, { type: 'frequency' }))).toEqual(220);
  });
  it('should throw an error if value is not an object, number, or string', () => {
    expect(() => getPlayableNoteValue(happify(false))).toThrowError(`not a note: false`);
    expect(() => getPlayableNoteValue(happify(undefined))).toThrowError(`not a note: undefined`);
  });
});

describe('parseNumeral', () => {
  it('should parse numbers as is', () => {
    expect(parseNumeral(4)).toBe(4);
    expect(parseNumeral(0)).toBe(0);
    expect(parseNumeral(20)).toBe(20);
    expect(parseNumeral('20')).toBe(20);
    expect(parseNumeral(1.5)).toBe(1.5);
  });
  it('should parse notes', () => {
    expect(parseNumeral('c')).toBe(48);
    expect(parseNumeral('c4')).toBe(60);
    expect(parseNumeral('c#4')).toBe(61);
    expect(parseNumeral('db4')).toBe(61);
  });
  it('should throw an error for unknown strings', () => {
    expect(() => parseNumeral('xyz')).toThrowError('cannot parse as numeral: "xyz"');
  });
});

describe('parseFractional', () => {
  it('should parse numbers as is', () => {
    expect(parseFractional(4)).toBe(4);
    expect(parseFractional(0)).toBe(0);
    expect(parseFractional(20)).toBe(20);
    expect(parseFractional('20')).toBe(20);
    expect(parseFractional(1.5)).toBe(1.5);
  });
  it('should parse fractional shorthands values', () => {
    expect(parseFractional('w')).toBe(1);
    expect(parseFractional('h')).toBe(0.5);
    expect(parseFractional('q')).toBe(0.25);
    expect(parseFractional('e')).toBe(0.125);
  });
  it('should throw an error for unknown strings', () => {
    expect(() => parseFractional('xyz')).toThrowError('cannot parse as fractional: "xyz"');
  });
});

describe('numeralArgs', () => {
  it('should convert function arguments to numbers', () => {
    const add = numeralArgs((a, b) => a + b);
    expect(add('c4', 2)).toBe(62);
  });
});
describe('fractionalArgs', () => {
  it('should convert function arguments to numbers', () => {
    const add = fractionalArgs((a, b) => a + b);
    expect(add('q', 2)).toBe(2.25);
  });
});

describe('rotate', () => {
  it('should rotate array to the left', () => {
    expect(rotate([0, 1, 2, 3], 2)).toStrictEqual([2, 3, 0, 1]);
    expect(rotate([0, 1, 2, 3], 0)).toStrictEqual([0, 1, 2, 3]);
    expect(rotate([0, 1, 2, 3], -3)).toStrictEqual([1, 2, 3, 0]);
    expect(rotate([0, 1, 2, 3], 3)).toStrictEqual([3, 0, 1, 2]);
    expect(rotate([0], 3)).toStrictEqual([0]);
    expect(rotate([], 3)).toStrictEqual([]);
  });
});

describe('flatten', () => {
  it('should flatten array by one level', () => {
    expect(flatten([0, 1, 2, 3])).toStrictEqual([0, 1, 2, 3]);
    expect(flatten([0, 1, [2, 3]])).toStrictEqual([0, 1, 2, 3]);
    expect(flatten([0, [1, [2, 3]]])).toStrictEqual([0, 1, [2, 3]]);
    expect(flatten([0])).toStrictEqual([0]);
    expect(flatten([])).toStrictEqual([]);
  });
});

describe('splitAt', () => {
  it('should split array into two', () => {
    expect(splitAt(2, [0, 1, 2, 3])).toStrictEqual([
      [0, 1],
      [2, 3],
    ]);
    expect(splitAt(0, [0, 1, 2, 3])).toStrictEqual([[], [0, 1, 2, 3]]);
    expect(splitAt(-3, [0, 1, 2, 3])).toStrictEqual([[0], [1, 2, 3]]);
    expect(splitAt(3, [0, 1, 2, 3])).toStrictEqual([[0, 1, 2], [3]]);
  });
});

describe('zipWith', () => {
  it('should use the function to combine the two arrays element-wise', () => {
    expect(zipWith((a, b) => a + b, [0, 1, 2, 3], [0, 1, 2, 3])).toStrictEqual([0, 2, 4, 6]);
    expect(zipWith((a, b) => a + b, [0, 1, 2, 3], [0, 1, 2])).toStrictEqual([0, 2, 4, NaN]);
    expect(zipWith((a, b) => a + b, [0, 1, 2], [0, 1, 2, 3])).toStrictEqual([0, 2, 4]);
    expect(zipWith((a) => a, [0, 1, 2], [1, 2, 3, 0])).toStrictEqual([0, 1, 2]);
    expect(zipWith((a, b) => b, [0, 1, 2], [1, 2, 3, 0])).toStrictEqual([1, 2, 3]);
  });
});
