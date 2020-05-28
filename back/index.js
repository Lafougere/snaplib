const { app, ipcMain, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')
const fsPromise = require('fs').promises
const { fork } = require('child_process')
const fetch = require('node-fetch').default
const ProgressBar = require('progress')
// const async = require('async')
const queue = require('async/queue')
const {debounce} = require('lodash-es')

const isProd = app.getAppPath().endsWith('resources/app')
const dbPath = isProd ? path.join(app.getAppPath(), 'db') : path.join(__dirname, '../../db')
const thumbPath = isProd ? path.join(app.getAppPath(), 'thumbnails') : path.join(__dirname, '../../thumbnails')

const { listImageFiles, getFolderTree, getFileDate, copyFiles, moveFiles, deleteFiles } = require('./files')
const { 
	getAllImages, 
	getAllFolders, 
	getImagesByFolderId, 
	addImages, 
	removeImages, 
	updateImageData,
	updateImage,
	getAllTags,
	addTag,
	removeTag,
	addFolder,
	removeFolder,

} = require('./db')(dbPath)
const { generateThumb, getExif } = require('./images')
// const { getFaces } = require('./face')


if (!fs.existsSync(thumbPath)){
	console.log('create thumbs dir', thumbPath)
	fs.mkdirSync(thumbPath)
}

ipcMain.handle('list files',  () => getAllImages())
ipcMain.handle('update file',  (e, file) => updateImage(file))
ipcMain.handle('list tags',  () => getAllTags())
ipcMain.handle('list folders',  () => getAllFolders())
ipcMain.handle('get meta',  (e, path) => getExif(path))
ipcMain.handle('copy files',  (e, fromPaths, toPath) => copyFiles(fromPaths, toPath))
ipcMain.handle('move files',  (e, fromPaths, toPath) => moveFiles(fromPaths, toPath))
ipcMain.handle('add tag',  (e, name) => addTag(name))
ipcMain.handle('delete tag',  (e, _id) => removeTag(_id))
ipcMain.handle('delete files',  (e, paths) => deleteFiles(paths))
ipcMain.handle('folder tree',  (e, pth) => getFolderTree(pth))
ipcMain.on('files updated', () => {
	BrowserWindow.fromId(2).webContents.send('refresh files')
})
ipcMain.handle('add folder',  (e, path) => {
	const loaderWindow = BrowserWindow.fromId(1)
	loaderWindow.show()
	return addFolder(path).then((folder) => {
		loaderWindow.webContents.send('started')
		return indexFiles(folder).then(() => {
			return getMissingThumbs().then(diff => {
				let cnt = 1
				const proms = diff.toCreate.map((t) => {
					return generateThumb(t.path, `${thumbPath}/${t.id}.webp`).then((info) => {
						return updateImageData(t.id, info).then(() => {
							// bar.tick()
							loaderWindow.webContents.send('thumb generated', cnt++, diff.toCreate.length)
						})
					})
				})
				return Promise.all(proms).then(() => {
					loaderWindow.hide()
					BrowserWindow.fromId(2).show()
				})
			})
		})
	})
})
ipcMain.handle('remove folder',  (e, id) => {
	console.log('remove folder', id)
	return getImagesByFolderId(id).then(images => {
		// delete thumbs
		const promises = images.map(image => fsPromise.unlink(`${thumbPath}/${image._id}.webp`))
		return Promise.all(promises).then(() => {
			return removeImages(images.map(image => image._id)).then(() => {
				return removeFolder(id)
			})
		})
	})
})
ipcMain.on('start', (e) => startUp(e))
// ipcMain.on('switch windows', () => {
// 	const mainWindow = BrowserWindow.fromId(2)
// 	if (mainWindow.isReady){
// 		//mainWindow.show()
// 		// BrowserWindow.fromId(1).hide()
// 	}
// 	else {
// 		mainWindow.on('ready-to-show', () => {
// 			//mainWindow.show()
// 			// BrowserWindow.fromId(1).hide()
// 		})
// 	}
	
// })

function getThumbsDiff(dbFiles, thumbs){
	const thumbMap = thumbs.reduce((prev, current) => {
		prev[current] = 1
		return prev
	}, {})
	const toCreate = []
	dbFiles.forEach(f => {
		const p = `${thumbPath}/${f._id}.webp`
		if (thumbMap[p]){
			delete thumbMap[p]
		}
		else {
			toCreate.push({
				id: f._id,
				path: f.path
			})
		}
	})
	const toDelete = Object.keys(thumbMap)
	return {
		toCreate,
		toDelete
	}
}

function indexFiles(folder){
	console.time('listed ' + folder.path)
	const promises = [
		listImageFiles(folder.path),
		getImagesByFolderId(folder._id),
	]
	return Promise.all(promises).then((all) => {
		console.timeEnd('listed ' + folder.path)
		console.time('diffed ' + folder.path)
		const localFiles = all[0]
		const dbFiles = all[1]
		const localMap = localFiles.reduce((prev, current) => {
			prev[current] = 1
			return prev
		}, {})
		const toRemove = []
			
		dbFiles.forEach(f => {
			if (localMap[f.path]){
				delete localMap[f.path]
			}
			else {
				toRemove.push(f._id)
			}
		})
		const imagesToAdd = Object.keys(localMap).map(p => {
			return { path: p, folder_id: folder._id }
		})
		console.timeEnd('diffed ' + folder.path)
		console.time('dates retrieved ' + folder.path)
		const proms = imagesToAdd.map(i => {
			return getFileDate(i.path).then(date => {
				i.dateModified = date
			})
		})
		return Promise.all([removeImages(toRemove), ...proms]).then(() => {
			console.timeEnd('dates retrieved ' + folder.path)
			console.time('inserted ' + folder.path)
			return addImages(imagesToAdd).then(() => {
				console.timeEnd('inserted ' + folder.path)
			})
		})

		
	})
}

function getMissingThumbs(){
	const proms = [
		getAllImages(),
		listImageFiles(thumbPath)
	]
	return Promise.all(proms).then(all => {
		const diff = getThumbsDiff(all[0], all[1])
		return diff
	})
}

function watchFolders(folders){
	folders.forEach(folder => {
		fs.watch(folder.path, {recursive: true}, debounce((event, filename) => {
			console.log('filechange', event, filename, 'infolder' , folder.path)
			indexFiles(folder).then(() => {
				getMissingThumbs().then(diff => {
					diff.toDelete.forEach(pth => fs.unlink(pth,() => {}))
					const proms = diff.toCreate.map((t) => generateThumb(t.path, `${thumbPath}/${t.id}.webp`).then((info) => updateImageData(t.id, info)))
					Promise.all(proms).then(() => {
						const mainWindow = BrowserWindow.fromId(2)
						const loaderWindow = BrowserWindow.fromId(1)
						loaderWindow.webContents.send('index faces')
						mainWindow.webContents.send('refresh files')
					})
				})
			})
		}, 500))
	})
}

function indexFaces(){
	return getAllImages()
		.then(images => images.filter(i => typeof i.faces === 'undefined'))
		.then(images => {
			fetch('http://localhost:3200/mnt/data2/asset-test/test.jpg')
				// .then(resp => resp.json())
				.then(json => {
					console.log('RESPP')
				})
			// return getFaces(images[0].path).then(faces => {
			// 	console.log(faces)
			// })
			// const q = queue((img, cb) => {
			// 	console.time('faces retrieved')
			// 	getFaces(img.path).then(faces => {
			// 		console.timeEnd('faces retrieved')
			// 		console.log(faces)
			// 		cb()
			// 	})
			// })
			// images.slice(0, 4).forEach(i => q.push(i))
		})
}

function startUp(e){
	// const srv = fork('./back/faceServer.js')
	// srv.stdout.pipe(process.stdout)
	// srv.stderr.pipe(process.stdout)
	e.reply('started')
	return getAllFolders().then((folders) => {
		watchFolders(folders)
		const promises = folders.map(folder => indexFiles(folder))
		return Promise.all(promises).then(() => {
			
			console.time('thumbs diffed')
			return getMissingThumbs().then(diff => {
				console.timeEnd('thumbs diffed')
				diff.toDelete.forEach(pth => fs.unlink(pth,() => {}))
				const bar = new ProgressBar(':bar :current/:total  ', { total: diff.toCreate.length })
				let cnt = 1
				e.reply('generate thumbs', diff.toCreate.length)
				const q = queue(function(task, callback) {
					generateThumb(task.path, `${thumbPath}/${task.id}.webp`)
						.then((info) => {
							updateImageData(task.id, info).then(() => {
								bar.tick()
								e.reply('thumb generated', cnt++, diff.toCreate.length)
								callback()
							})
							
						})
					
				}, 4)
				q.drain(function() {
					console.log('all items have been processed')
					setTimeout(() => {
						// indexFaces()
					}, 5000)
					
					e.reply('app ready')
					
				})
				q.push(diff.toCreate)
				if (!q.length()){
					q.drain()
				}
				
			})
			
		})
	})
}

module.exports = {
	startUp
}