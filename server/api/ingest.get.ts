export default defineEventHandler(async (_) => {
  try {
    await ingest()

    return {
      statusCode: 200,
      statusMessage: 'OK',
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
