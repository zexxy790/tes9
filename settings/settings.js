const fs = require('fs')

global.imageBuffer = "https://files.catbox.moe/g6jxjl.jpg"
global.mess = {
    welcome: "Halo Cuy"
}

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
