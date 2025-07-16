import request from 'supertest';
import app from '../src/app.js';

jest.mock('../src/prisma/client.js');

describe('App', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/a-non-existent-route');
    expect(response.statusCode).toBe(404);
  });
});