const request = require('supertest');
const mod = require('../src/server');
const app = mod && mod.default ? mod.default : mod;

describe('Basic endpoints', () => {
  test('GET / returns JSON', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
