import assert from 'node:assert/strict';
import test from 'node:test';
import type { ScrollView, TextInput, View } from 'react-native';

import { revealFormField } from './keyboard-form-scroll.ts';

function fixture() {
  const content = {} as View;
  const measurements: {
    target: Parameters<TextInput['measureLayout']>[0];
    success: Parameters<TextInput['measureLayout']>[1];
    failure: Parameters<TextInput['measureLayout']>[2];
  }[] = [];
  const scrolls: Parameters<ScrollView['scrollTo']>[0][] = [];
  const state = { current: true };
  const input: Pick<TextInput, 'measureLayout'> = {
    measureLayout(target, success, failure) { measurements.push({ target, success, failure }); },
  };
  const scroll: Pick<ScrollView, 'scrollTo'> = {
    scrollTo(options) { scrolls.push(options); },
  };
  function measurement(index = 0) {
    const result = measurements[index];
    assert.ok(result, 'Expected a native measurement request');
    return result;
  }
  return { content, input, measurement, measurements, scroll, scrolls, state };
}

test('measures against the native content ref and reveals fields in content coordinates', () => {
  const f = fixture();
  revealFormField(f.input, f.content, f.scroll, () => f.state.current);
  assert.equal(f.measurements.length, 1);
  assert.equal(f.measurement().target, f.content);
  assert.equal(typeof f.measurement().target, 'object');
  f.measurement().success(0, 420, 100, 50);
  assert.deepEqual(f.scrolls, [{ animated: true, y: 396 }]);
});

test('repeated focus preserves the same content offset after scrolling', () => {
  const f = fixture();
  for (let i = 0; i < 2; i++) {
    revealFormField(f.input, f.content, f.scroll, () => true);
    f.measurement(i).success(0, 420, 100, 50);
  }
  assert.deepEqual(f.scrolls, [{ animated: true, y: 396 }, { animated: true, y: 396 }]);
});

test('clamps the first field reveal to zero', () => {
  const f = fixture();
  revealFormField(f.input, f.content, f.scroll, () => true);
  f.measurement().success(0, 12, 100, 50);
  assert.deepEqual(f.scrolls, [{ animated: true, y: 0 }]);
});

test('discards asynchronous measurements after unmount or a newer focus', () => {
  const f = fixture();
  revealFormField(f.input, f.content, f.scroll, () => f.state.current);
  f.state.current = false;
  f.measurement().success(0, 420, 100, 50);
  assert.deepEqual(f.scrolls, []);
});

test('does not measure refs that have not mounted or were removed', () => {
  const f = fixture();
  revealFormField(undefined, f.content, f.scroll, () => true);
  revealFormField(f.input, null, f.scroll, () => true);
  revealFormField(f.input, f.content, null, () => true);
  assert.deepEqual(f.measurements, []);
  assert.deepEqual(f.scrolls, []);
});

test('failed or non-finite native measurements do not scroll', () => {
  const f = fixture();
  revealFormField(f.input, f.content, f.scroll, () => true);
  f.measurement().failure?.();
  for (const y of [NaN, Infinity, -Infinity]) f.measurement().success(0, y, 100, 50);
  assert.deepEqual(f.scrolls, []);
});
