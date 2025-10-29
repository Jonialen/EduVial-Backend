
import request from 'supertest'
import app from '../src/app.js'
import prisma from '../src/prisma/client.js'
import { verifyToken } from '../src/middlewares/auth.middleware.js'

jest.mock('../src/prisma/client.js', () => ({
  user_streak: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  $queryRaw: jest.fn()
}))

jest.mock('../src/middlewares/auth.middleware.js', () => ({
  ...jest.requireActual('../src/middlewares/auth.middleware.js'),
  verifyToken: jest.fn((req, res, next) => {
    req.user = { userId: 1, role: 'principiante' }
    next()
  })
}))

describe('Streak API', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/streak', () => {
    it('should return 401 if user is not authenticated', async () => {
      verifyToken.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Token requerido' })
      })
      const res = await request(app).get('/api/streak')
      expect(res.statusCode).toEqual(401)
    })

    it('should return 404 if streak not found for the user', async () => {
      prisma.user_streak.findUnique.mockResolvedValue(null)
      const res = await request(app).get('/api/streak')
      expect(res.statusCode).toEqual(404)
      expect(res.body).toHaveProperty('error', 'No se encontró información de racha para este usuario')
    })

    it('should return streak data for the authenticated user', async () => {
      const streakData = {
        user_id: 1,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: '2025-10-28'
      }
      prisma.user_streak.findUnique.mockResolvedValue(streakData)
      const res = await request(app).get('/api/streak')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: '2025-10-28'
      })
    })
  })

  describe('POST /api/streak/bump', () => {
    it('should return 401 if user is not authenticated', async () => {
      verifyToken.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Token requerido' })
      })
      const res = await request(app).post('/api/streak/bump')
      expect(res.statusCode).toEqual(401)
    })

    it('should bump the streak and return the updated streak data', async () => {
      const updatedStreak = [{ current_streak: 6, longest_streak: 10 }]
      prisma.$queryRaw.mockResolvedValue(updatedStreak)
      const res = await request(app).post('/api/streak/bump')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({ current_streak: 6, longest_streak: 10 })
      expect(prisma.$queryRaw).toHaveBeenCalledWith(expect.anything(), 1)
    })
  })

  describe('GET /api/streak/ranking', () => {
    it('should return the streak ranking', async () => {
      const rankingData = [
        { current_streak: 15, app_user: { name: 'User A', role: 'avanzado' } },
        { current_streak: 12, app_user: { name: 'User B', role: 'principiante' } }
      ]
      prisma.user_streak.findMany.mockResolvedValue(rankingData)
      const res = await request(app).get('/api/streak/ranking')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual([
        { position: 1, name: 'User A', current_streak: 15, isExpert: true },
        { position: 2, name: 'User B', current_streak: 12, isExpert: false }
      ])
    })
  })
})
