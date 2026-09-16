import assert from 'node:assert/strict';
import test from 'node:test';
import { parseUiCaptureRoute } from './ui-capture-route.ts';
const link = (route: string) => `neta://ui-capture?route=${encodeURIComponent(route)}`;
test('developer capture navigation accepts known routes without bypassing layout auth', () => {
  assert.equal(parseUiCaptureRoute(link('/(owner)/projects/ui-project-atlas')), '/(owner)/projects/ui-project-atlas');
  assert.equal(parseUiCaptureRoute(link('/task?projectId=ui-project-atlas')), '/task?projectId=ui-project-atlas');
});
test('capture navigation rejects unknown routes, external URLs and authentication material', () => {
  for (const route of ['//other.test/login', '/admin', '/login?secret=token', '/task?projectId=../../foreign', '/(owner)/files#token']) {
    assert.equal(parseUiCaptureRoute(link(route)), null);
  }
  assert.equal(parseUiCaptureRoute('neta://connect?origin=https://other.test'), null);
});
