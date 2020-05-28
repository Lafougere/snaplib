console.log('LAODER RENDERER')
// declare const window: any
const ipc: any = (window as any)['ipc'] as any
// import { FaceDetection } from 'face-api.js'

import { getFaceApi } from './lib/face'
import queue from 'async-es/queue'
import { ImageFile } from './types'

ipc.on('started', () => {
	document.querySelector('span').innerText = 'Indexing files...'
})
ipc.on('generate thumbs', (e: any, total: number) => {
	document.querySelector('span').innerText = 'Generating thumbs... 0 / ' + total.toString()
})
ipc.on('thumb generated', (e: any, current: number, total: number) => {
	console.log('GEN', current, total)
	document.querySelector('span').innerText = `Generating thumbs... ${current} / ${total}`
})
ipc.on('app ready', () => {
	console.log('rdy')
	indexFaces()
	ipc.send('switch windows')
})
ipc.on('index faces', () => {
	console.log('idx faces')
	indexFaces()
})
document.querySelector('span').innerText = 'Loading files...'

ipc.send('start')

function indexFaces(){
	console.log('indexing faces')
	
	ipc.invoke('list files')
		.then((images: ImageFile[]) => images.filter(i => typeof i.faces === 'undefined'))
		.then((images: ImageFile[]) => {
			document.querySelector('span').innerText = `Indexing faces... 0 / ${images.length}`
			console.log('filesbb', images)
			getFaceApi().then(faceapi => {
				const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })
				let cnt = 0
				const q = queue((imgFile: ImageFile, cb: Function) => {
					
					const img = new Image()
					img.crossOrigin = 'anonymous'
					img.addEventListener('load', async () => {
						console.time('faces detected')
						const faces = await faceapi.detectAllFaces(img, faceDetectionOptions).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors()
						console.timeEnd('faces detected')
						console.log('faces', faces)
						const dto = faces.map(faceDetection => {
							return {
								age: faceDetection.age,
								gender: faceDetection.gender,
								genderProbability: faceDetection.genderProbability,
								expressions: faceDetection.expressions,
								box: {
									top: faceDetection.detection.box.top,
									left: faceDetection.detection.box.left,
									width: faceDetection.detection.box.width,
									height: faceDetection.detection.box.height,
								},
								descriptor: faceDetection.descriptor
							}
						})
						imgFile.faces = dto
						document.querySelector('span').innerText = `Indexing faces... ${++cnt} / ${images.length}`
						ipc.invoke('update file', imgFile).then(cb)
					})
					img.src = `local://${imgFile.path}`
					
					
					
					
				})
				images.forEach(i => q.push(i))
				q.drain(function(){
					console.log('send updated')
					ipc.send('files updated')
				})
			})
		
		})
	
}