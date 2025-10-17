import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/client.js';

// Mock del cliente de Prisma
jest.mock('../src/prisma/client.js', () => ({
  __esModule: true,
  default: {
    lawarticle: {
      findMany: jest.fn(),
    },
  },
}));

const mockLaws = [
  {
    id: 1,
    artnum: '101',
    title: 'Uso del cinturón de seguridad',
    descr: 'El conductor y los pasajeros deben usar el cinturón de seguridad en todo momento.',
    sanc: 'Multa de Q500',
    lawartcat: [{ lawcat: { name: 'Seguridad' } }],
  },
  {
    id: 2,
    artnum: '102',
    title: 'Límites de velocidad',
    descr: 'No exceder los límites de velocidad establecidos para cada tipo de vía.',
    sanc: 'Multa de Q1000',
    lawartcat: [{ lawcat: { name: 'Velocidad' } }],
  },
  {
    id: 3,
    artnum: '183',
    title: 'Estacionamiento prohibido',
    descr: 'Se prohíbe el estacionamiento en lugares señalizados con línea roja.',
    sanc: 'Multa y posible remoción del vehículo.',
    lawartcat: [{ lawcat: { name: 'Estacionamiento' } }],
  }
];

const formattedLaws = mockLaws.map(law => ({
    id: law.id,
    articleNumber: law.artnum,
    title: law.title,
    description: law.descr,
    sanction: law.sanc,
    categories: law.lawartcat.map(ac => ac.lawcat.name),
}));


describe('GET /api/laws/filter', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return laws matching the search parameter', async () => {
    const filteredMock = [mockLaws[0]]; // Cinturon
    prisma.lawarticle.findMany.mockResolvedValue(filteredMock);

    const res = await request(app).get('/api/laws/filter?search=cinturon');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([formattedLaws[0]]);
    expect(prisma.lawarticle.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: 'cinturon', mode: 'insensitive' } },
              { descr: { contains: 'cinturon', mode: 'insensitive' } },
              { sanc: { contains: 'cinturon', mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: expect.any(Object),
    });
  });

  it('should return laws matching the article parameter', async () => {
    const filteredMock = [mockLaws[2]]; // Art 183
    prisma.lawarticle.findMany.mockResolvedValue(filteredMock);

    const res = await request(app).get('/api/laws/filter?article=183');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([formattedLaws[2]]);
    expect(prisma.lawarticle.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { artnum: { equals: '183', mode: 'insensitive' } },
        ],
      },
      include: expect.any(Object),
    });
  });

  it('should return laws matching combined filters', async () => {
    const filteredMock = [mockLaws[2]]; // Estacionamiento y Art 183
    prisma.lawarticle.findMany.mockResolvedValue(filteredMock);

    const res = await request(app).get('/api/laws/filter?search=estacionamiento&article=183');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([formattedLaws[2]]);
    expect(prisma.lawarticle.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { artnum: { equals: '183', mode: 'insensitive' } },
          {
            OR: [
              { title: { contains: 'estacionamiento', mode: 'insensitive' } },
              { descr: { contains: 'estacionamiento', mode: 'insensitive' } },
              { sanc: { contains: 'estacionamiento', mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: expect.any(Object),
    });
  });

  it('should return 404 if no laws match the criteria', async () => {
    prisma.lawarticle.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/laws/filter?search=termino_inexistente');

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('No laws found matching the criteria');
  });
});
