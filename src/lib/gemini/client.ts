import { GoogleGenerativeAI } from '@google/generative-ai'

export function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is required')
  return new GoogleGenerativeAI(key)
}
