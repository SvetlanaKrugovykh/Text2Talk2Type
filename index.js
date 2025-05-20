const { readTextFile } = require('./src/services/readTextFile')
const fs = require('fs')
const path = require('path')
const { createDictationAudio } = require('./src/services/dictationService')
require('dotenv').config()

const TEXT_FILE = process.env.TEXT_FILE
const SEGMENT_DURATION = parseFloat(process.env.SEGMENT_DURATION || '5')
const REPEAT_EACH = parseInt(process.env.REPEAT_EACH || '2')

const OUTPUT_DIR = path.resolve(__dirname, 'output')
const TEMP_CATALOG = process.env.TEMP_CATALOG

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR)
}

(async () => {
  try {
    console.log('Starting audio processing...')
    const textContent = await readTextFile(TEXT_FILE)
    console.log('Text file content:', textContent)
    const dictationFile = await createDictationAudio({
      textContent,
      segmentDuration: SEGMENT_DURATION,
      repeatEach: REPEAT_EACH,
      lang: 'pl'
    })
    console.log('Dictation audio file created:', dictationFile)
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in main execution:`, error)
  } finally {
    const tempDir = path.resolve(__dirname, TEMP_CATALOG)
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir)
      for (const file of files) {
        const filePath = path.join(tempDir, file)
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        }
      }
      console.log('Temp catalog cleaned:', tempDir)
    }
  }
})()
