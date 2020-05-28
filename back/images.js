const fs = require('fs')
const sharp = require('sharp')
const Jimp = require('jimp/dist')
const exifr = require('exifr')

function readImage(path){
	const buf = fs.readFileSync(path)
	const image = sharp(buf)
	return image
		.metadata()
		.then(function(info) {
			return {
				w: info.width,
				h: info.height,
				size: info.size,
				format: info.format,
				image
			}
		})
		.catch(() => {
			
			return Jimp.read(path).then(img => {
				return img.getBufferAsync('image/png').then(bf => {
					return {
						w: img.bitmap.width,
						h: img.bitmap.height,
						size: img.bitmap.fileSize,
						format: img._originalMime,
						image: sharp(bf)
					}
				})
			})
		})
}

function getMeta(path){
	return readImage(path).then(data => data.image.metadata())
}

function getExif(path){
	return exifr.parse(path)
}

function generateThumb(path, target){
	return readImage(path).then(data => {
		return data.image.rotate()
			.resize({width: 96, height: 96, fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
			.toFile(target)
			.then(() => {
				return {
					w: data.w,
					h: data.h,
					size: data.size,
					format: data.format,
				}
			})
	})
	
}

module.exports = {
	generateThumb,
	getMeta,
	getExif,
}