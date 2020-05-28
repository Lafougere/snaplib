import * as faceapi from 'face-api.js'

let loaded = false
export async function getFaceApi(){
	if (!loaded){
        
		await Promise.all([
			faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
			faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
			faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
			faceapi.nets.faceExpressionNet.loadFromUri('./models'),
			faceapi.nets.ageGenderNet.loadFromUri('./models'),
		])
		loaded = true
	}
	return faceapi

}
