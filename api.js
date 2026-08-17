// Pulse Games — frontend API client
(function () {
  const TOKEN_KEY = 'pulse_token';
  const USER_KEY = 'pulse_user';
  const API_KEY = 'pulse_api_base';

  function getBase() {
    return localStorage.getItem(API_KEY) || 'http://localhost:3001';
  }
  function setBase(url) {
    localStorage.setItem(API_KEY, url.replace(/\/+$/, ''));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function getCachedUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  }

  async function request(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(getBase() + path, Object.assign({}, options, { headers }));
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const code = (data && data.error) || 'REQUEST_FAILED';
      const err = new Error((data && data.message) || code);
      err.status = res.status;
      err.code = code;
      err.data = data;
      err.retryAfter = data && data.retry_after;
      throw err;
    }
    return data;
  }

  window.PulseAPI = {
    getBase, setBase, getToken, getCachedUser, clearSession,
    async health() { return request('/api/health'); },
    async register(username, password) {
      const data = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });
      setSession(data.token, data.user);
      return data;
    },
    async login(username, password) {
      const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      setSession(data.token, data.user);
      return data;
    },
    async me() {
      const data = await request('/api/me');
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    },
    async balance() { return request('/api/balance'); },
    async demoReset() { return request('/api/demo/reset', { method: 'POST', body: '{}' }); },
    async history(limit) { return request('/api/history?limit=' + (limit || 30)); },
    async limbo(bet, target) { return request('/api/games/limbo', { method: 'POST', body: JSON.stringify({ bet, target }) }); },
    async crashStart(bet) { return request('/api/games/crash/start', { method: 'POST', body: JSON.stringify({ bet }) }); },
    async crashCashout(roundId, mult) { return request('/api/games/crash/cashout', { method: 'POST', body: JSON.stringify({ roundId, mult }) }); },
    async crashResolve(roundId) { return request('/api/games/crash/resolve', { method: 'POST', body: JSON.stringify({ roundId }) }); },
    async minesStart(bet, mines) { return request('/api/games/mines/start', { method: 'POST', body: JSON.stringify({ bet, mines }) }); },
    async minesReveal(roundId, cell) { return request('/api/games/mines/reveal', { method: 'POST', body: JSON.stringify({ roundId, cell }) }); },
    async minesCashout(roundId) { return request('/api/games/mines/cashout', { method: 'POST', body: JSON.stringify({ roundId }) }); },
    async dice(bet, chance) { return request('/api/games/dice', { method: 'POST', body: JSON.stringify({ bet, chance }) }); },
    async plinko(bet, risk) { return request('/api/games/plinko', { method: 'POST', body: JSON.stringify({ bet, risk }) }); },
    async adminStats() { return request('/api/admin/stats'); },
    async adminUsers(params) {
      const q = new URLSearchParams(params || {}).toString();
      return request('/api/admin/users?' + q);
    },
    async adminBets(params) {
      const q = new URLSearchParams(params || {}).toString();
      return request('/api/admin/bets?' + q);
    },
    async adminSetBalance(userId, balance) {
      return request('/api/admin/users/balance', { method: 'POST', body: JSON.stringify({ user_id: userId, balance }) });
    },
    async adminAdjust(userId, delta) {
      return request('/api/admin/users/adjust', { method: 'POST', body: JSON.stringify({ user_id: userId, delta }) });
    },
    async adminSetAdmin(userId, is_admin) {
      return request('/api/admin/users/set-admin', { method: 'POST', body: JSON.stringify({ user_id: userId, is_admin }) });
    },
  };
})();
