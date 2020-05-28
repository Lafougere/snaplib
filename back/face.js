require('@tensorflow/tfjs-node')

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
const canvas = require('canvas')
const faceapi = require('face-api.js')

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
let loaded = false
// console.log(faceapi.nets)

async function load(){
	console.time('models loaded')
	await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
	await faceapi.nets.faceLandmark68Net.loadFromDisk('./models')
	await faceapi.nets.faceRecognitionNet.loadFromDisk('./models')
	// await faceapi.nets.faceExpressionNet.loadFromDisk('./models')
	// await faceapi.nets.ageGenderNet.loadFromDisk('./models')
	console.timeEnd('models loaded')
	loaded = true
}

async function getFaces(path){
	if (!loaded) {
		await load()
	}
	const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })
	console.log('get faces', path)
	console.time('img loaded')
	const img = await canvas.loadImage(path)
	console.timeEnd('img loaded')
	console.log(img.width)
	console.time('faces detected')
	try {
		const detections = await faceapi.detectAllFaces(img, faceDetectionOptions)
		console.timeEnd('faces detected')
		return detections
	}
	catch(e){
		console.error(e)
		return []
	}
	
	// console.log(detections)
	
}

// getFaces('/mnt/data2/asset-test/test.jpg')

module.exports = {
	getFaces
}
