const fs = require('fs/promises')

const deleteFile = (filePath) => {
  return fs.rm(filePath)
    .then(() => console.log('old file removed!'))
    .catch((err) => console.log('error while removing old file:', err))
}

module.exports = deleteFile