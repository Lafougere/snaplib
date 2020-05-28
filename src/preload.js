console.log('PRELOADED')
window['ipc'] = require('electron').ipcRenderer
const { dialog } = require('electron').remote
window.electronDialog = dialog
window.pathutil = require('path')