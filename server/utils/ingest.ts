import path from 'node:path'
import fs from 'node:fs'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { chars, icons, info, metadata } from '@iconify-json/heroicons'
import { embeddings } from '~/server/utils/openai-client'

const __dirname = path.resolve()
const rootDirectory = path.join(__dirname, 'data/ui')
const markdownFiles: { name: string; content: string }[] = []

const loader = new DirectoryLoader(
  `${rootDirectory}/examples`,
  {
    '.vue': path => new TextLoader(path),
  },
)

const splitter = new MarkdownTextSplitter({
  chunkSize: 3000,
  chunkOverlap: 200,
})

function readMarkdownFiles(directory: string, result: { name: string; content: string }[] = []): void {
  const items = fs.readdirSync(directory)

  for (const item of items) {
    const itemPath = path.join(directory, item)

    if (fs.statSync(itemPath).isDirectory()) {
      readMarkdownFiles(itemPath, result)
    }
    else if (path.extname(item) === '.md') {
      const fileContents = fs.readFileSync(itemPath, 'utf8')
      result.push({ name: itemPath, content: fileContents })
    }
  }
}

readMarkdownFiles(rootDirectory, markdownFiles)

export async function ingest() {
  // read all the md files in data/ui and dont forget children folders

  let docs = []

  for (const file of markdownFiles) {
    const doc = await splitter.createDocuments(
      [file.content],
      [
        {
          element: file.name,
        },
      ],
    )

    docs.push(doc)
  }

  const vueExamples = await loader.load()
  await Object.keys(icons.icons).map(async (icon) => {
    const iconDoc = [
      {
        pageContent: `#HeroIcons name: '${icon}'`,
        metadata: {
          ...metadata,
        },
      },
    ]

    docs.push(iconDoc)
  })

  docs = docs.flat()
  docs = docs.concat(vueExamples)

  await supabaseClient.from('documents').delete().neq('id', 0)
  await SupabaseVectorStore.fromDocuments(docs, embeddings, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents',
  }).catch((error) => {
    console.error(error)
  })
}
