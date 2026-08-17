const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'pulse-dev-secret-change-me';
const JWT_EXPIRES_SEC = 7 * 24 * 3600;

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}
function b64urlJson(obj) {
  return b64url(JSON.stringify(obj));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

function signToken(user) {
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const payload = b64urlJson({
    sub: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRES_SEC,
  });
  const data = `${header}.${payload}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('BAD_TOKEN');
  const [header, payload, sig] = parts;
  const data = `${header}.${payload}`;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  if (sig !== expected) throw new Error('BAD_TOKEN');
  const body = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) throw new Error('EXPIRED');
  return { id: body.sub, username: body.username };
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
