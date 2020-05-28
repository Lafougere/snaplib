require('should')
const fs = require('fs')
const { generateThumb } = require('../back/images')


describe('images.js', function() {
	describe('generateThumb()', function() {
		it('should generate a webp thumbnail from a bmp file', function(done){
			generateThumb('./tests/mocks/folderwithimages/townbot.bmp', './tests/thumbs/test-1.webp').then(() => {
				const buf1 = fs.readFileSync('./tests/thumbs/test-1.webp')
				const buf2 = fs.readFileSync('./tests/thumbs/sample.webp')
				
				buf1.should.eql(buf2)
				done()
			})
		})
		it('should generate a webp thumbnail from a png file', function(done){
			generateThumb('./tests/mocks/folderwithimages/townbot.png', './tests/thumbs/test-2.webp').then(() => {
				const buf1 = fs.readFileSync('./tests/thumbs/test-2.webp')
				const buf2 = fs.readFileSync('./tests/thumbs/sample2.webp')
				
				buf1.should.eql(buf2)
				done()
			})
		})
		it('should return the expected data', function(done){
			generateThumb('./tests/mocks/folderwithimages/townbot.png', './tests/thumbs/test-3.webp').then((data) => {
				data.should.have.property('w')
				data.should.have.property('h')
				data.should.have.property('size')
				data.should.have.property('format')
				done()
			})
		})
	})
	
})