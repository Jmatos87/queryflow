import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:3001/api/v1'

export const handlers = [
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  http.get(`${API_URL}/datasets`, () => {
    return HttpResponse.json([])
  }),

  http.post(`${API_URL}/upload`, () => {
    return HttpResponse.json({
      id: 'test-dataset-id',
      name: 'test.csv',
      rowCount: 10,
    })
  }),

  http.post(`${API_URL}/query`, () => {
    return HttpResponse.json({
      sql: 'SELECT * FROM test',
      results: [],
      rowCount: 0,
    })
  }),
]
