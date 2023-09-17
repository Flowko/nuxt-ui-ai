import path from 'node:path'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

const __dirname = path.resolve()
const dataPath = path.join(__dirname, 'data')

const loader = new DirectoryLoader(
  dataPath,
  {
    '.vue': path => new TextLoader(path),
  },
)

export async function ingestCode() {
  const docs = await loader.load()
  console.log(docs.map(doc => doc.metadata))
  await MemoryVectorStore.fromDocuments(docs, embeddings)
}
