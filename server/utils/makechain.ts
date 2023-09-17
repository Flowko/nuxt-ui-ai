import fs from 'node:fs'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { PromptTemplate } from 'langchain/prompts'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { CallbackManager } from 'langchain/callbacks'
import { OpenAI } from 'langchain/llms/openai'
import { embeddings } from '~/server/utils/openai-client'

let vectorStore: SupabaseVectorStore

const CONDENSE_PROMPT
  = PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question that handles any changes that need to be made to the code coming from the chat_history.
  
  Chat History:
  {chat_history}
  Follow Up Input: {question}:`)

function QA_PROMPT() {
  return PromptTemplate.fromTemplate(
    `You are a Vue/Nuxt 3 and Tailwind CSS expert, ready to assist the user in crafting exceptional user interfaces for their applications. Your focus will encompass all aspects of UI design within the Vue ecosystem, covering components, icons, color schemes, and even dark mode. Additionally, you'll offer guidance on optimizing keyboard shortcuts for a seamless user experience. If the context contains existing code, update it to align with the new question or prompt.

    Here are the rules you should strictly follow while responding:
    
    1. Provide code exclusively; avoid non-code explanations.
    2. Employ Vue 3 and Tailwind CSS best practices. Utilize the \`<script setup>\` section with \`lang="ts"\` when writing Vue components.
    3. Use components from Nuxt UI sparingly, only when necessary—no overuse of components.
    4. Avoid combining multiple scripts and templates within the code you provide.
    5. Note that Nuxt UI components are auto-imported; refrain from importing them manually.
    6. Always prioritize Tailwind CSS for styling, resorting to plain CSS only when Tailwind isn't applicable.
    7. In every response, include a \`<script setup>\` tag with \`lang="ts"\` that contains the template's dependencies.
    8. Format icon names consistently as 'i-heroicons-[name]' (e.g., \`<UIcon name="i-heroicons-chat-bubble-oval-left-20-solid" />\`).
    9.Dont hallucinate or make up tailwind styles or classes. Only use the ones that are documented in the tailwind docs.
    10. Insure using Nuxt ui elements before using vanilla html elements.
  
    
    Incorporate any relevant chat history or existing code below to facilitate the required updates or changes.
    
    Chat History:
    {chat_history}
    
    Question:
    {question}
    
    Context:
    {context}
  
    Important: Remove any markdown formatting or elments for example \`\`\`vue or code blocks.
    
    Your Answer:
    `,
  )
}

export async function makeChain(onTokenStream?: (token: string) => void) {
  if (!vectorStore) {
    vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client: supabaseClient,
      tableName: 'documents',
      queryName: 'match_documents',
    })
  }

  const model = new ChatOpenAI({
    temperature: 0.4,
    maxTokens: 2500,
    modelName: 'gpt-4',
    streaming: Boolean(onTokenStream),
    callbackManager: onTokenStream
      ? CallbackManager.fromHandlers({
        async handleLLMNewToken(token) {
          onTokenStream(token)
        },
      })
      : undefined,
  })

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(7),
    {
      // questionGeneratorTemplate: CONDENSE_PROMPT.template,
      qaTemplate: QA_PROMPT().template,
      returnSourceDocuments: true,
    },
  )

  chain.questionGeneratorChain.llm = new ChatOpenAI()

  return chain
}
