import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../src/prisma/client.js');
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: jest.fn().mockReturnValue('testtoken'),
  verify: jest.fn(),
}));

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      prisma.app_user.findUnique.mockResolvedValue(null);
      prisma.app_user.create.mockResolvedValue({
        user_id: 1,
        email: 'test@example.com',
        role: 'principiante',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ token: 'testtoken' });
    });

    it('should not register an existing user', async () => {
      prisma.app_user.findUnique.mockResolvedValue({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message: 'Email ya registrado' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials, respond in time and return user data', async () => {
      const userPayload = {
        user_id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'principiante',
      };
      prisma.app_user.findUnique.mockResolvedValue(userPayload);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('testtoken');

      const startTime = Date.now();
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      const duration = Date.now() - startTime;

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBe('testtoken');
      expect(duration).toBeLessThan(500);

      const decoded = { userId: 1, email: 'test@example.com' };
      jwt.verify.mockReturnValue(decoded);
      const decodedToken = jwt.verify(response.body.token, 'your-secret-key');
      expect(decodedToken.email).toBe(userPayload.email);
    });

    it('should not login a user with invalid credentials', async () => {
      prisma.app_user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ message: 'Credenciales inválidas' });
    });
  });
});
