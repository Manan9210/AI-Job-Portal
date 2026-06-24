import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

export const analyzeResume = (resumeText, token) =>
  api.post('/ai/analyze-resume', { resumeText }, authHeader(token))

export const getMatchScore = (data, token) =>
  api.post('/ai/match-score', data, authHeader(token))

export const generateCoverLetter = (data, token) =>
  api.post('/ai/cover-letter', data, authHeader(token))

export const generateJobDescription = (data, token) =>
  api.post('/ai/job-description', data, authHeader(token))

export default api
