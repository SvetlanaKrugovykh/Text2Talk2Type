const fs = require("fs")
const path = require("path")
require("dotenv").config()

const TEMP_CATALOG = process.env.TEMP_CATALOG      // out/temp
const OUT_CATALOG = process.env.OUT_CATALOG || 'out' // out
const SILENCE_FILE = process.env.SILENCE_FILE      // silence_1s.mp3
const TIMEOUT = parseInt(process.env.TIMEOUT || "20000", 10)
const SILENCE_REPEAT = Math.floor(TIMEOUT / 1000)

module.exports.mergeMP3Files = async function (fileNamesArray, OUTPUT_FILE) {
  try {
    let files = []

    for (const file of fileNamesArray) {
      if (file === SILENCE_FILE) {
        for (let i = 0; i < SILENCE_REPEAT; i++) {
          files.push(path.join(OUT_CATALOG, SILENCE_FILE))
        }
      } else {
        files.push(file)
      }
    }

    if (files.length === 0) {
      console.log("There are no files.")
      return
    }

    const writeStream = fs.createWriteStream(OUTPUT_FILE)
    for (const file of files) {
      if (fs.existsSync(file)) {
        const data = fs.readFileSync(file)
        writeStream.write(data)
      } else {
        console.warn(`File not found: ${file}`)
      }
    }
    writeStream.end()
    console.log(`File created: ${OUTPUT_FILE}`)

    const uniqueFiles = [...new Set(files)]
    for (const file of uniqueFiles) {
      if (
        fs.existsSync(file) &&
        path.dirname(file) === path.resolve(TEMP_CATALOG) &&
        !path.basename(file).startsWith("silence")
      ) {
        fs.unlinkSync(file)
      }
    }

    return OUTPUT_FILE
  } catch (error) {
    console.error("Merge error:", error)
  }
}