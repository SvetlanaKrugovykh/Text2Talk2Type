const gTTsService = require('./gTTsService')
const { mergeMP3Files } = require('./mergeService')
const path = require('path')
require('dotenv').config()

const OUT_CATALOG = process.env.OUT_CATALOG || 'out'

function estimateReadingTime(text, wpm = 150) {
  const words = text.trim().split(/\s+/).length
  return (words / wpm) * 60
}

function splitTextByDuration(text, segmentDuration) {
  const words = text.trim().split(/\s+/)
  const segments = []
  let current = []

  for (const word of words) {
    current.push(word)
    const currentText = current.join(' ')
    if (estimateReadingTime(currentText) >= segmentDuration) {
      segments.push(currentText)
      current = []
    }
  }

  if (current.length) segments.push(current.join(' '))
  return segments
}

module.exports.createDictationAudio = async function createDictationAudio({
  textContent,
  segmentDuration,
  repeatEach,
  lang = 'pl'
}) {

  const segments = splitTextByDuration(textContent, segmentDuration)

  const queries = segments.map(text => ({ text }))
  const results = await gTTsService.gTTs(queries, lang)
  const segmentFiles = results.map(r => r.filePath)

  const silenceFile = process.env.SILENCE_FILE

  const dictationSequence = []
  for (const file of segmentFiles) {
    const relativeFile = file
    for (let i = 0; i < repeatEach; i++) {
      dictationSequence.push(relativeFile)
      dictationSequence.push(silenceFile)
    }
  }

  const outputFile = path.join(OUT_CATALOG, `dictation_${Date.now()}.mp3`)
  await mergeMP3Files(dictationSequence, outputFile)

  return outputFile
}

