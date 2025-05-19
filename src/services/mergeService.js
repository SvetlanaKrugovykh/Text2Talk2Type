const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

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

    const listFile = path.join(TEMP_CATALOG, `concat_list_${Date.now()}.txt`)
    fs.writeFileSync(
      listFile,
      files.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'),
      "utf8"
    )

    execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -ar 24000 -ac 1 -b:a 64k "${OUTPUT_FILE}"`)

    fs.unlinkSync(listFile)
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