const buckets = new Map();

function prune(key, windowMs, now) {
  const arr = buckets.get(key);
  if (!arr) return;
  const fresh = arr.filter((t) => now - t < windowMs);
  if (fresh.length) buckets.set(key, fresh);
  else buckets.delete(key);
}

function hit(key, { windowMs = 60_000, max = 30 } = {}) {
  const now = Date.now();
  prune(key, windowMs, now);
  const arr = buckets.get(key) || [];
  if (arr.length >= max) {
    const retryAfter = Math.ceil((arr[0] + windowMs - now) / 1000);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true, remaining: max - arr.length };
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

module.exports = { hit, clientIp };
