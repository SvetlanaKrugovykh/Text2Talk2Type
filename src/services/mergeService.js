const fs = require("fs")
const path = require("path")

const TEMP_CATALOG = process.env.TEMP_CATALOG

module.exports.mergeMP3Files = async function (fileNamesArray, OUTPUT_FILE, silenceFile = null) {
  try {
    const tempAbs = path.resolve(TEMP_CATALOG)
    const files = fileNamesArray
      .filter(file => file.endsWith(".mp3"))
      .map(file => {
        const absFile = path.resolve(file)
        if (absFile.startsWith(tempAbs)) return absFile
        if (path.isAbsolute(file)) return file
        return path.join(TEMP_CATALOG, file)
      })

    if (files.length === 0) {
      console.log("There are no files.")
      return
    }

    let sequence = []
    let silenceAbs = null
    if (silenceFile) {
      silenceAbs = path.isAbsolute(silenceFile)
        ? silenceFile
        : path.resolve(TEMP_CATALOG, silenceFile)
    }
    for (const file of files) {
      sequence.push(file)
      if (silenceFile) sequence.push(silenceAbs)
    }

    const writeStream = fs.createWriteStream(OUTPUT_FILE)

    for (const file of sequence) {
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
      if (fs.existsSync(file) && !path.basename(file).startsWith('silence')) {
        fs.unlinkSync(file)
      }
    }

    return OUTPUT_FILE

  } catch (error) {
    console.error("Merge error:", error)
  }
}