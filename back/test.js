const fs = require('fs')
const Jimp = require('jimp')
const ColorThief = require('colorthief')
// const sharp = require('sharp')

const buf = fs.readFileSync('townbot.bmp')
// Jimp.read(buf).then(img => {
// 	img.contain(96, 96).write('townbot.png')
// })
Jimp.read(buf).then(img => {
	img.getBufferAsync('image/png').then(buf => {
		ColorThief.getColor(buf).then(color => {

			console.log(color)
		})
	})
})

// 
// const buf = fs.readFileSync('townbot.png')
