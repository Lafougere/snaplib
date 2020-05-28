require('should')
const { listImageFiles, getFolderTree } = require('../back/files')

const tree = {
	fullPath: './tests/mocks/foldertree',
	name: 'foldertree',
	path: './tests/mocks',
	children: [{
		fullPath: 'tests/mocks/foldertree/sub1',
		name: 'sub1',
		path: 'tests/mocks/foldertree',
		children: [{
			fullPath: 'tests/mocks/foldertree/sub1/subsub1',
			name: 'subsub1',
			path: 'tests/mocks/foldertree/sub1',
			children: []
		},{
			fullPath: 'tests/mocks/foldertree/sub1/subsub2',
			name: 'subsub2',
			path: 'tests/mocks/foldertree/sub1',
			children: []
		}]
	},{
		fullPath: 'tests/mocks/foldertree/sub2',
		name: 'sub2',
		path: 'tests/mocks/foldertree',
		children: []
	}]
}

describe('files.js', function() {
	describe('listImageFiles()', function() {
		it('should return an empty array if the folder doesnt contain images', function(done) {
			listImageFiles('./tests/mocks/folderwithoutimages').then(result => {
				result.should.be.an.Array()
				result.should.have.length(0)
				done()
			})
		})
		it('should return an array if the folder contains images', function(done) {
			listImageFiles('./tests/mocks/folderwithimages').then(result => {
				result.should.be.an.Array()
				result.should.have.length(2)
				result.should.eql([
					'tests/mocks/folderwithimages/townbot.bmp',
					'tests/mocks/folderwithimages/townbot.png'
				])
				done()
			})
		})
	})
	describe('getFolderTree()', function() {
		it('should return the expected folder structure', function(done) {
			getFolderTree('./tests/mocks/foldertree').then(result => {
				result.should.be.an.Object()
				result.fullPath.should.eql('./tests/mocks/foldertree')
				result.should.eql(tree)
				done()
			})
		})
	})
})