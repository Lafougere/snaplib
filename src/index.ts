import { app, BrowserWindow, protocol, ipcMain, Menu } from 'electron'
const path = require('path')
declare const MAIN_WINDOW_WEBPACK_ENTRY: any
declare const LOADER_WINDOW_WEBPACK_ENTRY: any
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any


const isMac = process.platform === 'darwin'
const isProd = app.getAppPath().endsWith('resources/app')
// import { startUp } from '../back'
require('../back')
app.allowRendererProcessReuse = true
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit()
}

ipcMain.on('switch windows', () => {
	const mainWindow = BrowserWindow.fromId(2)
	const loaderWindow = BrowserWindow.fromId(1)
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
		// loaderWindow.hide()
	})
	
})

const createWindow = () => {
	const PROTOCOL = 'thumb'
	protocol.registerFileProtocol(PROTOCOL, (request, callback) => {
		// // Strip protocol
		
		let url = request.url.substr(PROTOCOL.length + 1)
		// Build complete path for node require function
		url = isProd ? path.join(app.getAppPath(), 'thumbnails', url) : path.join(__dirname, '../../thumbnails', url)
		// url = path.join(isProd ? app.getAppPath() : __dirname, '../../thumbnails', url)
		// console.log('URL', url)
		// Replace backslashes by forward slashes (windows)
		url = path.normalize(url)

		callback({path: decodeURI(url)})
	})
	protocol.registerFileProtocol('local', (request, callback) => {
		const url = path.normalize(request.url.substr(6))
		callback({path: decodeURI(url)})
	})
	
	
	// Create the browser window.
	
	const loaderWindow = new BrowserWindow({
		height: 100,
		width: 400,
		frame: false,
		show: false,
		webPreferences: {
			preload: path.resolve(__dirname, 'preload.js'),
			// webSecurity: false
		}
	})
	// console.log('ID', loaderWindow.id)
	// loaderWindow.webContents.openDevTools()
	loaderWindow.loadURL(LOADER_WINDOW_WEBPACK_ENTRY)
	loaderWindow.once('ready-to-show', () => {
		loaderWindow.show()
	})
	const mainWindow = new BrowserWindow({
		height: 900,
		width: 1600,
		show: false,
		webPreferences: {
			preload: path.resolve(__dirname, 'preload.js'),
			// webSecurity: false
		}
	})
	// console.log('ID2', loaderWindow.id)
	mainWindow.once('close', () => {
		// @ts-ignore
		app.quit()
	})
	// mainWindow.loadURL(url);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
	const tpl = []

	const appMenu = [{
		label: app.name,
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideothers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	}]

	const fileMenu = {
		label: 'Fichier',
		submenu: [
			{
				label: 'Manage folders', 
				click: () => {
					mainWindow.webContents.send('manage folders')
				}
			},
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	}

	const viewMenu = {
		label: 'Voir',
		submenu: [
			{ role: 'reload' },
			{ role: 'forcereload' },
			{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	}

	const windowMenu = {
		label: 'Window',
		submenu: [
			{ role: 'minimize' },
			{ role: 'zoom' },
			...(isMac ? [
				{ type: 'separator' },
				{ role: 'front' },
				{ type: 'separator' },
				{ role: 'window' }
			] : [
				{ role: 'close' }
			])
		]
	}

	const helpMenu = {
		role: 'help',
		submenu: [{
			label: 'En savoir plus',
			click: async () => {
				const { shell } = require('electron')
				await shell.openExternal('https://electronjs.org')
			}
		}]
	}
	if (isMac){
		tpl.push(appMenu)
	}
	tpl.push(fileMenu)
	tpl.push(viewMenu)
	tpl.push(helpMenu)

	
	
	// @ts-ignore
	const menu = Menu.buildFromTemplate(tpl)
	Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	createWindow()
	
  
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
