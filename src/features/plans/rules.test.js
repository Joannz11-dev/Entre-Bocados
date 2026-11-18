const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canTransition, validateMessage, isFutureDate } = require('./rules');

test('only pending plans can move to a terminal state', () => {
  assert.equal(canTransition('pending', 'visited'), true);
  assert.equal(canTransition('pending', 'cancelled'), true);
  assert.equal(canTransition('cancelled', 'pending'), false);
  assert.equal(canTransition('visited', 'cancelled'), false);
});

test('messages are trimmed and limited to 500 characters', () => {
  assert.equal(validateMessage('  hola  '), 'hola');
  assert.equal(validateMessage('   '), null);
  assert.equal(validateMessage('a'.repeat(500)).length, 500);
  assert.equal(validateMessage('a'.repeat(501)), null);
  assert.equal(validateMessage(null), null);
});

test('schedule dates must parse and be later than now', () => {
  assert.equal(isFutureDate('2026-11-18T18:00:00.000Z', Date.parse('2026-11-17T18:00:00.000Z')), true);
  assert.equal(isFutureDate('2026-11-17T18:00:00.000Z', Date.parse('2026-11-17T18:00:00.000Z')), false);
  assert.equal(isFutureDate('not a date'), false);
});
