const path = require('path')
const gTTsService = require('./gTTsService')
const { createSilenceFile } = require('./createSilenceFile')
const { mergeMP3Files } = require('./mergeService')
const fs = require('fs').promises
require('dotenv').config()
const TEMP_CATALOG = process.env.TEMP_CATALOG

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
  timeout,
  lang = 'pl',
  outDir = 'out'
}) {
  const segments = splitTextByDuration(textContent, segmentDuration)

  const queries = segments.map(text => ({ text }))
  const results = await gTTsService.gTTs(queries, lang)
  const segmentFiles = results.map(r => r.filePath)

  const silenceFile = path.join(TEMP_CATALOG, `silence_${timeout / 1000}s.mp3`)
  await createSilenceFile(timeout / 1000, silenceFile)

  const dictationSequence = []
  for (const file of segmentFiles) {
    for (let i = 0; i < repeatEach; i++) {
      dictationSequence.push(file)
      dictationSequence.push(silenceFile)
    }
  }

  const outputFile = path.join(outDir, `dictation_${Date.now()}.mp3`)
  await mergeMP3Files(dictationSequence, outputFile)

  return outputFile
}


