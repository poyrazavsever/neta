import assert from 'node:assert/strict';
import test from 'node:test';

import { expectedVisibility, validatePickedFile } from './policy.ts';

test('enforces MIME, extension and size before upload', () => {
  assert.equal(validatePickedFile({ mimeType: 'image/png', name: 'avatar.png', size: 1200, uri: 'file:///avatar.png' }, 'avatar'), null);
  assert.match(validatePickedFile({ mimeType: 'image/png', name: 'avatar.exe', size: 1200, uri: 'file:///avatar.exe' }, 'avatar') ?? '', /eşleşmiyor/);
  assert.match(validatePickedFile({ mimeType: 'image/svg+xml', name: 'avatar.svg', size: 1200, uri: 'file:///avatar.svg' }, 'avatar') ?? '', /Desteklenmeyen/);
  assert.match(validatePickedFile({ mimeType: 'application/pdf', name: 'large.pdf', size: 11 * 1024 * 1024, uri: 'file:///large.pdf' }, 'project_asset') ?? '', /10 MB/);
  assert.equal(validatePickedFile({ mimeType: 'application/pdf', name: 'brief.pdf', size: 1200, uri: 'file:///brief.pdf' }, 'project_asset'), null);
  assert.match(validatePickedFile({ mimeType: 'image/jpeg', name: 'icon.jpg', size: 1200, uri: 'file:///icon.jpg' }, 'branding_icon') ?? '', /Desteklenmeyen/);
});

test('assigns visibility without trusting UI input', () => {
  assert.equal(expectedVisibility('avatar'), 'private');
  assert.equal(expectedVisibility('project_asset'), 'portal');
  assert.equal(expectedVisibility('branding_logo'), 'public_branding');
});
