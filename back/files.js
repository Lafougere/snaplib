const path = require('path')
const fsPromise = require('fs').promises
const fs = require('fs')
const reExtension = /\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/i

function listImageFiles(p, list = []){
	return fsPromise.readdir(p, { withFileTypes: true})
		.then(items => {
			const promises = []
			items.forEach(item => {
				if (item.isDirectory() && item.name !== '__MACOSX'){
					promises.push(listImageFiles(path.join(p, item.name), list))
				}
				else {
					if (reExtension.test(item.name)){
						list.push(path.join(p, item.name))
					}
					
				}
			})
			return Promise.all(promises).then(() => list)
		})
}

function getFolderTree(p){
	const f = {
		fullPath: p,
		name: path.basename(p),
		path: path.dirname(p),
		children: []
	}
	return fsPromise.readdir(p, { withFileTypes: true}).then(items => {
		const dirs = items.filter(item => item.isDirectory())
		const promises = dirs.map(dir => getFolderTree(path.join(p, dir.name)))
		return Promise.all(promises).then(children => {
			f.children = children
			return f
		})
	})
}

function getFileDate(path){
	return fsPromise.stat(path).then(stat => {
		return stat.mtime
	})
}

function getSafePath(p, cnt=0){
	if (fs.existsSync(p)){
		const ext = path.extname(p)
		const fileName = path.basename(p, ext)
		const newName = fileName.replace(/( \(\d+\)$|$)/, ` (${++cnt})`)
		const dir = path.dirname(p)
		const newPath = path.join(dir, newName + ext)
		return getSafePath(newPath, cnt)
	}
	return p
}

function copyFiles(fromPaths, toPath){
	console.log('copy', fromPaths, toPath)
	const targetPaths = fromPaths.map(p => {
		const fileName = path.basename(p)
		return getSafePath(path.join(toPath, fileName))
	})
	console.log('targets', targetPaths)
	return Promise.all(fromPaths.map((p, index) => fsPromise.copyFile(p, targetPaths[index])))
}

function moveFiles(fromPaths, toPath){
	console.log('move', fromPaths, toPath)
	const targetPaths = fromPaths.map(p => {
		const fileName = path.basename(p)
		return getSafePath(path.join(toPath, fileName))
	})
	console.log('targets', targetPaths)
	return Promise.all(fromPaths.map((p, index) => fsPromise.rename(p, targetPaths[index])))
}

function deleteFiles(paths){
	return Promise.all(paths.map(p => fsPromise.unlink(p)))
}

module.exports = {
	listImageFiles,
	getFolderTree,
	getFileDate,
	copyFiles,
	moveFiles,
	deleteFiles,
}