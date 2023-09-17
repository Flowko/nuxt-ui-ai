import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAI } from 'langchain/llms/openai'

if (!process.env.OPENAI_API_KEY)
  throw new Error('Missing OpenAI Credentials')

export const openai = new OpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

export const embeddings = new OpenAIEmbeddings()
