import fs from 'node:fs'
import { join, resolve } from 'pathe'

const __dirname = resolve()
const testVueFile = join(__dirname, 'pages/test.vue')

export default defineEventHandler(async (event) => {
  const { question, history } = (await readBody(event)) as {
    question: string
    history: string[]
  }

  if (!question) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No question provided',
    })
  }

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ')

  // set connection to keep-alive
  event.node.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  })

  const sendData = (data: string) => {
    event.node.res.write(`data: ${data}\n\n`)
  }

  sendData(JSON.stringify({ data: '' }))
  let text: string = ''

  const chain = await makeChain((token: string) => {
    text = text + token

    sendData(JSON.stringify({ data: token }))
  })

  const chat_history = history.join('\n')

  try {
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: chat_history || '',
    })

    sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }))
  }
  catch (error) {
    console.error('error', error)
  }
  finally {
    sendData('[DONE]')

    fs.writeFileSync(testVueFile, text)

    event.node.res.end()
  }
})
