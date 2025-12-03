import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app'  

describe('GET /api', () => {
  it('debería responder con un mensaje de saludo', async () => {
    const res = await request(app).get('/api')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('message', 'Hola desde Express!')
    expect(res.body).toHaveProperty('status', 'ok')
  })
})
