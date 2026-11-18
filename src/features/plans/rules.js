// Shared client-side rules; the backend must enforce them independently.
function canTransition(from, to) {
  return from === 'pending' && (to === 'visited' || to === 'cancelled');
}

function validateMessage(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length >= 1 && text.length <= 500 ? text : null;
}

function isFutureDate(value, now = Date.now()) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > now;
}

module.exports = { canTransition, validateMessage, isFutureDate };
