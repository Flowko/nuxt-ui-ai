<script setup lang="ts">
import { SSE } from 'sse.js'

const examples = [
  'A login screen with email, google, and apple login.',
  'A Tweet UI with retweet and like buttons.',
  'A cookie consent banner',
  'A toolbar for a wysiwyg editor',
  'A FAQ section',
]

const messageListRef = ref()
const query = ref((useRoute().query.q as string | undefined) ?? '')
const loading = ref(false)
const searching = ref(false)
const view = ref<'chat' | 'question'>('question')

onMounted(() => {
  if (query.value)
    search()
})

const messageState = ref({
  messages: [] as any[],
  pending: undefined as string | undefined,
  history: [] as any[],
  pendingSourceDocs: [] as undefined | any[],
})

const chatMessages = computed(() => {
  if (messageListRef.value)
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight

  const messages = [
    ...messageState.value.messages,
    ...(messageState.value.pending
      ? [
          {
            type: 'bot',
            message: messageState.value.pending,
            sourceDocs: messageState.value.pendingSourceDocs,
          },
        ]
      : []),
  ]

  if (searching.value) {
    messages.push({
      type: 'bot',
      message: '',
    })
  }

  return messages
})

async function search() {
  if (!query.value.trim())
    return

  view.value = 'chat'
  const question = query.value.trim()

  searching.value = true

  messageState.value.messages.push({
    type: 'user',
    message: question,
    dateTime: new Date().toISOString(),
  })

  loading.value = true
  query.value = ''
  messageState.value.pending = ''

  if (messageListRef.value)
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight

  const ctrl = new AbortController()

  try {
    const eventSource = new SSE('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({
        question,
        history: messageState.value.history,
      }),
    })

    eventSource.addEventListener('message', (event) => {
      if (event.data === '[DONE]') {
        messageState.value.history = [messageState.value.pending ?? '']
        messageState.value.messages.push({
          type: 'bot',
          message: messageState.value.pending ?? '',
          sourceDocs: messageState.value.pendingSourceDocs,
          dateTime: new Date().toISOString(),
        })
        messageState.value.pending = undefined
        messageState.value.pendingSourceDocs = undefined
        loading.value = false
        ctrl.abort()
      }
      else {
        const data = JSON.parse(event.data)
        if (data.data !== '' && searching.value)
          searching.value = false

        if (data.sourceDocs)
          messageState.value.pendingSourceDocs = data.sourceDocs
        else
          messageState.value.pending += data.data
      }
    })

    eventSource.stream()
  }
  catch (err) {
    loading.value = false
  }
}

function setQuestion(question: string) {
  query.value = question

  search()
}
</script>

<template>
  <main class="flex flex-col h-full ">
    <div class="h-1/2 px-4 py-4 sm:px-6 lg:px-8 flex flex-col gap-y-4 overflow-scroll">
      <template v-if="view === 'question'">
        <p class="text-sm font-medium leading-6 text-gray-400">
          Examples
        </p>
        <ul role="list" class="flex flex-col gap-y-1">
          <li
            v-for="(example, index) in examples" :key="index"
            class="flex px-2 py-3 hover:bg-foreground/10 text-foreground items-center gap-x-4 text-sm leading-5  font-medium rounded-md aria-selected:bg-background/80 cursor-pointer"

            @click="setQuestion(example)"
          >
            <Icon name="ion:sparkles" class="text-primary" size="20" />
            {{ example }}
          </li>
        </ul>
      </template>
      <div v-else ref="messageListRef" class="rounded-md pl-2 py-4 pr-4">
        <ChatConversation :messages="chatMessages" />
      </div>

      <div class="flex flex-col gap-y-3">
        <div class="flex items-start space-x-4">
          <div class="min-w-0 flex-1">
            <div class="">
              <UTextarea
                id="comment"
                v-model="query"
                class="p-1"
                :disabled="loading"
                :rows="3"
                name="comment"
                placeholder="Ask Nuxt Labs AI a question..."
                autoresize
              />

              <UButton
                trailing
                icon="i-solar-transfer-horizontal-linear"
                label="Send"
                color="gray" variant="solid"
                @click="search"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="h-1/2 bg-white z-10">
      <iframe src="http://127.0.0.1:3000/test" frameborder="0" class="h-full w-full" height="100%" width="100%" />
    </div>
  </main>
</template>

<style lang="scss">
#__nuxt, body, html {
  height: 100%;
}
</style>
