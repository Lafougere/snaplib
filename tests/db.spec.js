const expect = require('chai').expect
// const fs = require('fs')
const { db,
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
	removeFolder
} = require('../back/db')('./tests/db')

const foldersSeed = [
	{path:'/test1'},
	{path:'/test2'}
]
const tagsSeed = [
	{name:'test1'},
	{name:'test2'}
]
let imageIds
let folderIds
let tagIds

function resetDB(done){
	db.images.remove({}, {multi: true}, () => {})
	db.folders.remove({}, {multi: true}, () => {})
	db.tags.remove({}, {multi: true}, () => {})
	db.tags.insert(tagsSeed, (err, tags) => {
		tagIds = tags.map(t => t._id)
	})
	db.folders.insert(foldersSeed, (err, newFolders) => {
		folderIds = newFolders.map(f => f._id)
		const images = [
			{path: '/test1/test1.jpg', folder_id: newFolders[0]._id, w:32,h:32,size:682,format:'jpg',res:'32x32'},
			{path: '/test1/test1-2.png', folder_id: newFolders[0]._id, w:16,h:16,size:800,format:'png',res:'16x16'},
			{path: '/test2/test2.png', folder_id: newFolders[1]._id, w:16,h:16,size:800,format:'png',res:'16x16'},
		]
		db.images.insert(images, (err, newImages) => {
			imageIds = newImages.map(i => i._id)
			done()
		})
	})
}

describe('db.js', function() {
	beforeEach((done) => {
		resetDB(done)
		
	})
	describe('getAllImages()', function() {
		
		it('should return the expected data', function(done){
			
			
			getAllImages().then((data) => {
				expect(data).to.be.an('array')
				expect(data).to.have.length(3)
				expect(data.find(rec => rec.path === '/test1/test1-2.png')).to.not.be.undefined
				expect(data.find(rec => rec.path === '/test1/test1.jpg')).to.not.be.undefined
				expect(data.find(rec => rec.path === '/test2/test2.png')).to.not.be.undefined
				done()
			})
		})
	})
	describe('getAllFolders()', function() {
		
		it('should return the expected data', function(done){
			
			
			getAllFolders().then((data) => {
				expect(data).to.be.an('array')
				expect(data).to.have.length(2)
				expect(data.find(rec => rec.path === '/test1')).to.not.be.undefined
				expect(data.find(rec => rec.path === '/test2')).to.not.be.undefined
				done()
			})
		})
	})
	describe('removeImages()', function() {
		
		it('should remove images by id', function(done){
			removeImages(imageIds).then(() => {
				getAllImages().then(data => {
					expect(data).to.be.an('array')
					expect(data).to.have.length(0)
					done()
				})
				
			})
		})
	})
	describe('addImages()', function() {
		
		it('should add an array of images', function(done){
			const imgs = [{path: '/test1/test1-3.jpg'},{path: '/test1/test1-4.jpg'}]
			addImages(imgs).then(() => {
				getAllImages().then(data => {
					expect(data).to.be.an('array')
					expect(data).to.have.length(5)
					expect(data.find(rec => rec.path === '/test1/test1-3.jpg')).to.not.be.undefined
					expect(data.find(rec => rec.path === '/test1/test1-4.jpg')).to.not.be.undefined
					done()
				})
				
			})
		})
	})
	describe('updateImageData()', function() {
		
		it('should update image data', function(done){
			updateImageData(imageIds[0], {path: 'modified'}).then(() => {
				getAllImages().then(data => {
					expect(data).to.be.an('array')
					expect(data).to.have.length(3)
					expect(data.find(rec => rec.path === 'modified')).to.not.be.undefined
					done()
				})
				
			})
		})
	})
	describe('updateImage()', function() {
		
		it('should update image', function(done){
			getAllImages().then(images => {
				const img = images[0]
				img.path = 'modified'
				updateImage(img).then(() => {
					getAllImages().then(data => {
						expect(data).to.be.an('array')
						expect(data).to.have.length(3)
						expect(data.find(rec => rec.path === 'modified')).to.not.be.undefined
						done()
					})
					
				})
			})
			
		})
	})
	describe('getImagesByFolderId()', function() {
		
		it('should return images filtered by folder id', function(done){
			getImagesByFolderId(folderIds[0]).then(images => {
				expect(images).to.be.an('array')
				expect(images).to.have.length(2)
				expect(images.find(rec => rec.path === '/test1/test1-2.png')).to.not.be.undefined
				expect(images.find(rec => rec.path === '/test1/test1.jpg')).to.not.be.undefined
				done()
			})
			
		})
	})
	describe('getAllTags()', function() {
		it('should return an array of tags', function(done){
			getAllTags().then(tags => {
				expect(tags).to.be.an('array')
				expect(tags).to.have.length(2)
				expect(tags.find(rec => rec.name === 'test1')).to.not.be.undefined
				expect(tags.find(rec => rec.name === 'test2')).to.not.be.undefined
				done()
			})
			
		})
	})
	describe('addTag()', function() {
		it('should add a tag', function(done){
			addTag('test3').then(() => {
				getAllTags().then(tags => {
					expect(tags).to.be.an('array')
					expect(tags).to.have.length(3)
					expect(tags.find(rec => rec.name === 'test3')).to.not.be.undefined
					done()
				})
			})
		})
	})
	describe('removeTag()', function() {
		it('should remove a tag by id', function(done){
			removeTag(tagIds[0]).then(() => {
				getAllTags().then(tags => {
					expect(tags).to.be.an('array')
					expect(tags).to.have.length(1)
					expect(tags.find(rec => rec.name === 'test1')).to.be.undefined
					done()
				})
			})
		})
	})
	describe('addFolder()', function() {
		it('should add a folder', function(done){
			addFolder('/test3').then(() => {
				getAllFolders().then(folders => {
					expect(folders).to.be.an('array')
					expect(folders).to.have.length(3)
					expect(folders.find(rec => rec.path === '/test3')).to.not.be.undefined
					done()
				})
			})
		})
	})
	describe('removeFolder()', function() {
		it('should remove a folder by id', function(done){
			removeFolder(folderIds[0]).then(() => {
				getAllFolders().then(folders => {
					expect(folders).to.be.an('array')
					expect(folders).to.have.length(1)
					expect(folders.find(rec => rec.path === '/test1')).to.be.undefined
					done()
				})
			})
		})
	})
	
})