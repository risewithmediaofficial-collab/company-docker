import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import {
  escapeRegex,
  inspectAndSanitizeObject,
  hppProtection,
  requestShield,
  payloadErrorHandler,
  createLoadShedder,
} from '../middleware/security.middleware.js';
import { getAdminDashboard } from '../controllers/report.controller.js';

const buildHardenedTestApp = (options = {}) => {
  const app = express();
  app.disable('x-powered-by');
  const shedder = createLoadShedder({
    maxConcurrent: options.maxConcurrent || 500,
    lagThresholdMs: options.lagThresholdMs || 400,
  });

  app.use(shedder);
  app.use(helmet());

  if (options.enableRateLimit) {
    app.use(
      '/api/auth',
      rateLimit({
        windowMs: 60 * 1000,
        max: options.authMax || 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: 'Rate limited' },
      })
    );
  }

  app.use(express.json({ limit: options.jsonLimit || '100kb' }));
  app.use(payloadErrorHandler);
  app.use(hppProtection);
  app.use(mongoSanitize());
  app.use(requestShield);

  app.get('/api/health', (req, res) => {
    res.json({ success: true, load: shedder.getMetrics() });
  });

  app.post('/api/echo', (req, res) => {
    res.json({ success: true, body: req.body, query: req.query });
  });

  app.get('/api/query-echo', (req, res) => {
    res.json({ success: true, query: req.query });
  });

  app.post('/api/auth/login', (req, res) => {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  });

  app.get('/api/slow', async (req, res) => {
    await new Promise((r) => setTimeout(r, 80));
    res.json({ success: true });
  });

  return { app, shedder };
};

const rawHttpGet = (baseUrl, rawPath) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(baseUrl);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: Number(parsed.port),
        path: rawPath,
        method: 'GET',
      },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      }
    );
    req.on('error', reject);
    req.end();
  });

const listenEphemeral = (app) =>
  new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });
  });

describe('Security Hardening & Heavy Load Resilience Tests', () => {
  const serversToClose = [];
  const sheddersToStop = [];

  after(async () => {
    sheddersToStop.forEach((s) => s.stop());
    await Promise.all(
      serversToClose.map(
        (srv) => new Promise((res) => srv.close(() => res()))
      )
    );
  });

  it('ReDoS Guard: escapeRegex neutralizes regex metacharacters and truncates extreme inputs', () => {
    const evil = '(a+)+$*^?.[test]{1,999}\\d' + 'x'.repeat(300);
    const escaped = escapeRegex(evil, 120);
    assert.ok(escaped.length <= 240);
    assert.ok(!/(^|[^\\])\((?!\?:)|(^|[^\\])\+|(^|[^\\])\$/.test(escaped));
    assert.doesNotThrow(() => new RegExp(escaped, 'i'));
  });

  it('Prototype Pollution & Nesting Bomb Guard: strips __proto__/constructor and rejects deep nesting', () => {
    const dirty = JSON.parse('{"name":"ok","__proto__":{"isAdmin":true},"constructor":{"bad":1},"$where":"1==1"}');
    const cleanRes = inspectAndSanitizeObject(dirty);
    assert.equal(cleanRes.valid, true);
    assert.equal(Object.prototype.hasOwnProperty.call(cleanRes.value, 'constructor'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(cleanRes.value, '$where'), false);
    assert.equal(({}).isAdmin, undefined);

    // 18-level deep JSON bomb
    let deep = { leaf: 1 };
    for (let i = 0; i < 18; i++) deep = { nested: deep };
    const deepRes = inspectAndSanitizeObject(deep, 12);
    assert.equal(deepRes.valid, false);
  });

  it('HTTP Attack Vectors: blocks traversal, null-byte, oversized URL, HPP, NoSQL query operators, malformed & huge JSON', async () => {
    const { app, shedder } = buildHardenedTestApp({ jsonLimit: '16kb' });
    sheddersToStop.push(shedder);
    const { server, url } = await listenEphemeral(app);
    serversToClose.push(server);

    // 1. Security headers + no x-powered-by
    const healthRes = await fetch(`${url}/api/health`);
    assert.equal(healthRes.status, 200);
    assert.equal(healthRes.headers.get('x-powered-by'), null);
    assert.equal(healthRes.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(healthRes.headers.get('x-frame-options'), 'DENY');

    // 2. Null-byte probe
    const nullRes = await fetch(`${url}/api/echo%00.txt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(nullRes.status, 400);

    // 3. Path traversal probe (raw HTTP request so URL parser does not pre-normalize /../)
    const travStatus = await rawHttpGet(url, '/api/%2e%2e/etc/passwd');
    assert.equal(travStatus, 400);
    const rawDotsStatus = await rawHttpGet(url, '/api/../etc/passwd');
    assert.equal(rawDotsStatus, 400);

    // 4. Oversized URI (> 4096 chars)
    const longRes = await fetch(`${url}/api/query-echo?q=${'a'.repeat(4200)}`);
    assert.equal(longRes.status, 414);

    // 5. HPP & NoSQL injection in query string
    const hppRes = await fetch(`${url}/api/query-echo?role=employee&role=superAdmin&email[$ne]=x`);
    assert.equal(hppRes.status, 200);
    const hppData = await hppRes.json();
    assert.equal(typeof hppData.query.role, 'string');
    assert.equal(hppData.query.email, undefined);

    // 6. Deep nesting JSON bomb
    let deepBody = { x: 1 };
    for (let i = 0; i < 16; i++) deepBody = { nested: deepBody };
    const bombRes = await fetch(`${url}/api/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deepBody),
    });
    assert.equal(bombRes.status, 400);

    // 7. Malformed JSON syntax attack
    const badJsonRes = await fetch(`${url}/api/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"broken": ',
    });
    assert.equal(badJsonRes.status, 400);

    // 8. Oversized JSON payload DoS (> 16kb test cap)
    const bigRes = await fetch(`${url}/api/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ junk: 'z'.repeat(25000) }),
    });
    assert.equal(bigRes.status, 413);
  });

  it('Dashboard DB Guard: getAdminDashboard returns 503 DB_UNAVAILABLE when Mongoose is disconnected instead of caching zeros', async () => {
    let statusCode = 200;
    let payload = null;
    const req = { user: { role: 'superAdmin', _id: 'u1' }, query: {}, headers: {} };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        payload = data;
        return this;
      },
    };
    await getAdminDashboard(req, res);
    assert.equal(statusCode, 503);
    assert.equal(payload?.success, false);
    assert.equal(payload?.code, 'DB_UNAVAILABLE');
  });

  it('Brute-Force Rate Limiter: returns 429 when auth request burst exceeds threshold', async () => {
    const { app, shedder } = buildHardenedTestApp({ enableRateLimit: true, authMax: 5 });
    sheddersToStop.push(shedder);
    const { server, url } = await listenEphemeral(app);
    serversToClose.push(server);

    const statuses = [];
    for (let i = 0; i < 9; i++) {
      const r = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com', password: 'wrong' }),
      });
      statuses.push(r.status);
    }
    assert.ok(statuses.includes(429), `Expected 429 rate-limit response in burst, got ${statuses.join(',')}`);
  });

  it('Adaptive Load Shedding: sheds excess concurrent slow traffic cleanly with 503 while preserving /api/health', async () => {
    const { app, shedder } = buildHardenedTestApp({ maxConcurrent: 20 });
    sheddersToStop.push(shedder);
    const { server, url } = await listenEphemeral(app);
    serversToClose.push(server);

    const slowBurst = Array.from({ length: 45 }, () => fetch(`${url}/api/slow`).then((r) => r.status));
    const healthDuringBurst = fetch(`${url}/api/health`).then((r) => r.status);

    const [burstStatuses, healthStatus] = await Promise.all([
      Promise.all(slowBurst),
      healthDuringBurst,
    ]);

    assert.equal(healthStatus, 200);
    assert.ok(burstStatuses.includes(200), 'Expected accepted requests to succeed');
    assert.ok(burstStatuses.includes(503), 'Expected excess concurrent requests above 20 to shed cleanly with 503');

    const afterHealth = await (await fetch(`${url}/api/health`)).json();
    assert.equal(afterHealth.load.inFlight, 0, 'inFlight counter must drain cleanly back to 0');
  });

  it('Heavy Concurrency & Mixed Cyber-Attack Flood: survives 200 simultaneous parallel requests with zero crashes', async () => {
    const { app, shedder } = buildHardenedTestApp({ maxConcurrent: 500, jsonLimit: '128kb' });
    sheddersToStop.push(shedder);
    const { server, url } = await listenEphemeral(app);
    serversToClose.push(server);

    const tasks = Array.from({ length: 200 }, (_, i) => {
      if (i % 5 === 0) {
        return fetch(`${url}/api/echo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: 'ok', $ne: 1 }),
        }).then((r) => ({ type: 'nosql', status: r.status }));
      }
      if (i % 5 === 1) {
        return fetch(`${url}/api/query-echo?a=1&a=2&b[$gt]=0`).then((r) => ({ type: 'hpp', status: r.status }));
      }
      if (i % 5 === 2) {
        return rawHttpGet(url, '/api/%2e%2e/etc/passwd').then((status) => ({ type: 'trav', status }));
      }
      if (i % 5 === 3) {
        return fetch(`${url}/api/echo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{bad',
        }).then((r) => ({ type: 'badjson', status: r.status }));
      }
      return fetch(`${url}/api/health`).then((r) => ({ type: 'health', status: r.status }));
    });

    const results = await Promise.all(tasks);
    assert.equal(results.length, 200);
    for (const r of results) {
      if (r.type === 'trav' || r.type === 'badjson') assert.equal(r.status, 400);
      else assert.equal(r.status, 200);
    }
  });
});
