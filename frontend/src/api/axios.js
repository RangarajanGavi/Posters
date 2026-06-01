import axios from 'axios'
import { getMockResponse } from '../demo-data.js'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor — intercept in demo mode, attach token otherwise
api.interceptors.request.use(
  (config) => {
    // Demo mode: return mock data without hitting the network
    if (localStorage.getItem('demo_mode') === 'true') {
      const mock = getMockResponse(
        config.method,
        config.url,
        config.data ? JSON.parse(config.data) : {}
      )
      // Axios adapter trick: cancel the real request and resolve with mock
      config.adapter = () =>
        Promise.resolve({
          data: mock,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
    }

    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 (skip in demo mode)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem('demo_mode') !== 'true'
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
