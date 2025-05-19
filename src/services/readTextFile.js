const fs = require('fs').promises

module.exports.readTextFile = async function (filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return content
  } catch (err) {
    throw new Error(`Failed to read text file: ${filePath}\n${err}`)
  }
}

