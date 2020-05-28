// const { app } = require('electron')
// const path = require('path')
const Datastore = require('nedb')
// const isProd = app.getAppPath().endsWith('resources/app')
// const dbPath = isProd ? path.join(app.getAppPath(), 'db') : path.join(__dirname, '../../db')

module.exports = function(dbPath){

	const db = {
		images: new Datastore({filename: `${dbPath}/images.db`, autoload: true}),
		tags: new Datastore({filename: `${dbPath}/tags.db`, autoload: true}),
		folders: new Datastore({filename: `${dbPath}/folders.db`, autoload: true}),
		
	}
	db.images.ensureIndex({ fieldName: 'path', unique: true, sparse: true }, function () {
		// console.log(err)
	})
	db.folders.ensureIndex({ fieldName: 'path', unique: true, sparse: true }, function () {
		// console.log(err)
	})

	// db.folders.insert({path: '/mnt/data2/asset-test'})

	function getAllFolders(){
		return new Promise((resolve, reject) => {
			db.folders.find({}).sort({path: 1}).exec((err, folders) => {
				if (err) return reject(err)
				resolve(folders)
			})
		})
	}

	function getAllImages(){
		return new Promise((resolve, reject) => {
			db.images.find({}).sort({path: 1}).exec((err, images) => {
				if (err) return reject(err)
				resolve(images)
			})
		})
	}

	function getAllTags(){
		return new Promise((resolve, reject) => {
			db.tags.find({}).sort({name: 1}).exec((err, images) => {
				if (err) return reject(err)
				resolve(images)
			})
		})
	}


	function getImagesByFolderId(folder_id){
		return new Promise((resolve, reject) => {
			db.images.find({folder_id}).exec((err, images) => {
				if (err) return reject(err)
				resolve(images)
			})
		})
	}

	function removeImages(ids){
		return new Promise((resolve, reject) => {
			db.images.remove({_id: {$in: ids}}, {multi : true}, (err) => {
				if (err) return reject(err)
				resolve()
			})
		})
	}
	function addImages(images){
		return new Promise((resolve, reject) => {
			db.images.insert(images, (err) => {
				if (err) return reject(err)
				resolve(images)
			})
		})
	}

	function updateImageData(id, data){
		return new Promise((resolve, reject) => {
			db.images.update({_id: id}, { $set: data }, {}, (err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}
	function updateImage(file){
		return new Promise((resolve, reject) => {
			db.images.update({_id: file._id}, file, (err) => {
				if (err) return reject(err)
				resolve()
			})
		})
	}

	function addTag(name){
		return new Promise((resolve, reject) => {
			db.tags.insert({name},(err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}

	function removeTag(id){
		return new Promise((resolve, reject) => {
			db.tags.remove({_id: id}, (err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}

	function addFolder(path){
		return new Promise((resolve, reject) => {
			db.folders.insert({path},(err, created) => {
				if (err) reject(err)
				else resolve(created)
			})
		})
	}

	function removeFolder(id){
		return new Promise((resolve, reject) => {
			db.folders.remove({_id: id},(err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}




	return {
		getAllImages,
		getAllFolders,
		removeImages,
		addImages,
		updateImageData,
		updateImage,
		getImagesByFolderId,
		getAllTags,
		addTag,
		removeTag,
		addFolder,
		removeFolder,
		db,
	}
}