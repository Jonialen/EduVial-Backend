import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/client.js';

// Mock del cliente de Prisma (actualizado para lawcat)
jest.mock('../src/prisma/client.js', () => ({
  __esModule: true,
  default: {
    lawarticle: {
      findMany: jest.fn(),
    },
    lawcat: {
      findMany: jest.fn(),
    }
  },
}));


describe('Law Endpoints', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/laws/categories', () => {
    it('should return all law categories and status 200', async () => {
      const categoriesMock = [{ name: 'Medio Ambiente' }, { name: 'Tránsito' }];
      prisma.lawcat.findMany.mockResolvedValue(categoriesMock);
      
      const res = await request(app).get('/api/laws/categories');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(['Medio Ambiente', 'Tránsito']);
      expect(prisma.lawcat.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/laws/filters/info', () => {
    it('should return available filters information and status 200', async () => {
      const res = await request(app).get('/api/laws/filters/info');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('filters');
      expect(res.body.filters).toHaveProperty('article');
      expect(res.body.filters).toHaveProperty('title');
      expect(res.body.filters).toHaveProperty('sanc');
    });
  });
});
