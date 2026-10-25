import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ARTIST_PASSCODE,
  verifyArtistPasscode,
  setArtistPasscode,
} from './auth.ts';

// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, value: string) => {
    storageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    Object.keys(storageMock).forEach((k) => delete storageMock[k]);
  },
  key: (index: number) => Object.keys(storageMock)[index] ?? null,
  length: 0,
};

test('verifyArtistPasscode succeeds with default passcode', () => {
  assert.equal(verifyArtistPasscode(DEFAULT_ARTIST_PASSCODE), true);
  assert.equal(verifyArtistPasscode('wrong-pass'), false);
  assert.equal(verifyArtistPasscode(''), false);
});

test('setArtistPasscode validates minimum length', () => {
  const shortResult = setArtistPasscode('12');
  assert.equal(shortResult.success, false);
  assert.ok(shortResult.error);

  const validResult = setArtistPasscode('temple2024');
  assert.equal(validResult.success, true);
  assert.equal(verifyArtistPasscode('temple2024'), true);
});

test('verifyArtistPasscode accepts master fallback even if changed', () => {
  setArtistPasscode('customSecret999');
  assert.equal(verifyArtistPasscode('customSecret999'), true);
  assert.equal(verifyArtistPasscode(DEFAULT_ARTIST_PASSCODE), true);
});
