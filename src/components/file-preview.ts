import { LitElement, html, customElement, property, TemplateResult, query } from 'lit-element'
import { ImageFile } from '../types'
import { flexStyles, scrollbarStyles, listStyles } from '../styles'
import { store } from '../store'
import { focusFile } from '../store/actions'
import { bound } from '../lib/decorators'
import { debounce } from 'lodash-es'
import './common/dropdown-menu'
import { AppShell } from '../app-shell'
import { TextField } from './common/text-field'
import { api } from '../lib/api'
import * as faceapi from 'face-api.js'
import { FaceMatcher } from 'face-api.js'

declare const ResizeObserver: any

const zoomLevels = [
	{value: 0.05, text: '5%'},
	{value: 0.1, text: '10%'},
	{value: 0.25, text: '25%'},
	{value: 0.5, text: '50%'},
	{value: 0.75, text: '75%'},
	{value: 1, text: '100%'},
	{value: 1.25, text: '125%'},
	{value: 1.5, text: '150%'},
	{value: 1.75, text: '175%'},
	{value: 2, text: '200%'},
	{value: 4, text: '400%'},
	{value: 6, text: '600%'},
	{value: 8, text: '800%'},
	{value: 10, text: '1000%'},
]

@customElement('file-preview')
export class FilePreview extends LitElement {

	@property({type: Array})
	public files: ImageFile[] = []

	@property({type: Object})
	public focusedFile: ImageFile = null
	
	@property({type: Array})
	public selection: string[] = []

	@property({type: Array})
	public zoomLevels: any[] = zoomLevels
	
	@property({type: Array})
	public labeledDescriptors: any[] = []

	@property({type: Number})
	public zoomIndex: number = 5

	@property({type: Number})
	public ratio: number = 1

	@query('#preview')
	private $preview: HTMLImageElement

	@query('#faces')
	private $faces: HTMLDivElement
	
	private $app: AppShell = document.querySelector('app-shell')

	private get selectedFiles(): ImageFile[] {
		return this.selection.map(id => this.files.find(f => f._id === id))
	}

	@property({ type: Object })
	private get zoomLevel(){
		return this.zoomLevels[this.zoomIndex]
	}

	private get width(){
		return this.$preview ? this.$preview.naturalWidth * this.zoomLevel.value : 0
	}

	private get height(){
		return this.$preview ? this.$preview.naturalHeight * this.zoomLevel.value : 0
	}
	
	constructor(){
		super()
		this.files = store.getState().files
		this.selection = store.getState().selection
		this.focusedFile = store.getState().focusedFile
		store.subscribe(() => {
			this.files = store.getState().files
			this.selection = store.getState().selection
			this.focusedFile = store.getState().focusedFile
		})
		this.addEventListener('wheel', (e) => {
			if (e.ctrlKey){
				if (e.deltaY < 0){
					this.zoomIndex = Math.min(++this.zoomIndex, this.zoomLevels.length - 1)
				}
				else {
					this.zoomIndex = Math.max(--this.zoomIndex, 0)
				}
			}
		})
	}

	public updated(props: any){
		if (props.has('selection')){
			this.onSelectionChanged()
		}
		if (props.has('zoomIndex')){
			this.detectFaces()
		}
		if (props.has('files')){
			this.getLabeledDescriptors()
		}
	}

	public firstUpdated(props: any){
		super.firstUpdated(props)
		this.$preview.addEventListener('load', this.onPreviewLoaded)
		new ResizeObserver(debounce(this.onResize, 500)).observe(this)
	}

	@bound
	private onResize(){
		this.computeZoomLevels(false)
		this.detectFaces()
	}

	private onSelectionChanged(){
		store.dispatch(focusFile(this.selectedFiles[0]))
		this.$faces.innerHTML = ''
	}

	@bound
	private onPreviewLoaded(){
		this.computeZoomLevels()
		this.detectFaces()
		
		
		
	}

	private async detectFaces(){
		this.getLabeledDescriptors()
		// const faceApi = await getFaceApi()
		// const faceDetectionOptions = new faceApi.SsdMobilenetv1Options({ minConfidence: 0.3 })
		// console.time('faces detected')
		// const faces2 = await faceApi.detectAllFaces(this.$preview, faceDetectionOptions).withFaceLandmarks().withFaceDescriptors()
		// console.timeEnd('faces detected')
		// console.log(faces2)
		// console.log('faces', faces)
		// const displaySize = { width: this.$preview.width, height: this.$preview.height }
		// // resize the overlay canvas to the input dimensions
		// faceApi.matchDimensions(this.$overlay, displaySize)
		// const resizedDetections = faceApi.resizeResults(faces, displaySize)
		// faceApi.draw.drawDetections(this.$overlay, resizedDetections)
		this.$faces.innerHTML = ''
		// this.$overlay.width = this.$preview.offsetWidth
		// this.$overlay.height = this.$preview.offsetHeight

		let faceMatcher: FaceMatcher
		if (this.labeledDescriptors.length){
			faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.6)
		}

		// console.log(this.labeledDescriptors)
		
		this.focusedFile && this.focusedFile.faces.forEach(face => {
			if (!face.label && faceMatcher){
				const bestMatch = faceMatcher.findBestMatch(new Float32Array(Object.keys(face.descriptor).map(k => face.descriptor[k])))
				if (bestMatch.label !== 'unknown'){
					face.tmpLabel = `${bestMatch.label}?`
				}
			}
					
			const faceDiv = document.createElement('div') as HTMLDivElement
			const ratio = this.zoomLevels[this.zoomIndex].value
			faceDiv.style.top = (face.box.top * ratio) + 'px'
			faceDiv.style.left = (face.box.left * ratio) + 'px'
			faceDiv.style.width = (face.box.width * ratio) + 'px'
			faceDiv.style.height = (face.box.height * ratio) + 'px'
			faceDiv.classList.add('face')
			const faceLabel = face.label ? face.label + '<br>' : face.tmpLabel ? face.tmpLabel + '<br>' : ''
			faceDiv.innerHTML = `<span>${faceLabel}${face.gender}<br>age: ${Math.round(face.age)}</span>`
			faceDiv.addEventListener('click', e => this.onFaceClick(e, face))
			this.$faces.appendChild(faceDiv)
		})
			
		

	}

	private getLabeledDescriptors(){
		const labeledDescriptorsMap = this.files.reduce((prev: any, current: any) => {
			const labeledFaces = current.faces.filter((f: any) => f.label)
			labeledFaces.forEach((face: any) => {
				prev[face.label] = prev[face.label] || []
				prev[face.label].push(new Float32Array(Object.keys(face.descriptor).map(k =>face.descriptor[k])))
			})
			return prev
		}, {})
		this.labeledDescriptors = Object.keys(labeledDescriptorsMap).map(label => {
			return new faceapi.LabeledFaceDescriptors(
				label,
				labeledDescriptorsMap[label]
			)
		})
		// console.log('labelbed', labeledDescriptorsMap, this.labeledDescriptors)
		
	}

	private onFaceClick(e: Event, face: any){
		e.stopPropagation()
		const $modal = this.$app.$modalLabelFace
		const $txtField = $modal.querySelector('text-field') as TextField
		console.log('tmp', face.tmpLabel)
		let label = ''
		if (face.label) {
			label = face.label
		}
		else if (!label && face.tmpLabel){
			label = face.tmpLabel.replace(/\?$/, '')
		}
		$txtField.value = label
		$modal.open().confirmed.then(() => {
			console.log('label', $txtField.value)
			face.label = $txtField.value
			api.saveFile(this.focusedFile).then(() => {
				$modal.close()
				this.detectFaces()

			})
		})
		$txtField.focus()
	}

	private computeZoomLevels(set = true){
		const availableWidth = this.$preview.parentElement.parentElement.offsetWidth - 100
		const availableHeight = this.$preview.parentElement.parentElement.offsetHeight - 100
		const wRatio = availableWidth / this.$preview.naturalWidth
		const hRatio = availableHeight / this.$preview.naturalHeight
		this.ratio = Math.min(wRatio, hRatio)
		const fitLevel = {value: this.ratio, text: (this.ratio * 100).toFixed() + '% (fit)' }
		this.zoomLevels = [...zoomLevels]
		if (!this.zoomLevels.find(l => l.value === fitLevel.value)){
			this.zoomLevels.push(fitLevel)
		}
		this.zoomLevels.sort((a, b) => a.value - b.value)
		if (set) {
			this.zoomIndex = this.zoomLevels.findIndex(l => (l.value === fitLevel.value || l.value === 1) )
		}
		
	}

	private onFileFocus(file: ImageFile){
		store.dispatch(focusFile(file))
		
	}
    
	private renderFile(file: ImageFile){
		const p = `thumb://${file._id}.webp`
		return html `<div><img tabindex="-1" class="${this.focusedFile === file ? 'selected' : ''}" @focus="${() => this.onFileFocus(file)}" .src="${p}"></div>`
	}

	private renderLevel(level: any, index: number){
		return html `<li id="${level.value}" @click="${() => this.zoomIndex = index}">${level.text}</li>`
	}
	
	public render(): TemplateResult {
		const p = this.focusedFile ? `local://${this.focusedFile.path}` : ''
		return html `
			${listStyles}
			${flexStyles}
			${scrollbarStyles}
			<style>
			:host {
				display: flex;
                align-items: center;
				justify-content: center;
				overflow: auto;
			}
			:host * {
				box-sizing: border-box;
			}
			.selection {
				height: 110px;
				overflow: auto;
			}
			.selection img {
				width: 96px;
				height: 96px;
				display: inline-block;
				border: 2px solid #333;
				margin: 1px;
				border-radius: 2px;
				/* object-fit: contain; */
				outline: none;
			}
			.selection img.selected {
				border: 2px solid #0969b8;
			}
			.preview  {
				overflow: auto;
				/* max-width: 100%;
				max-height: 100%; */
				padding: 48px;
				position: relative;
				text-align:center;
			}
			.preview > div {
				/* overflow: auto; */
				margin: auto;
				position: relative;
				
				/* position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%); */
				
			}
			/* .preview canvas {
				position: absolute;
				top:0;
				left:0;
				width: calc(100% - 2px);
				height: calc(100% - 2px);
				display: none;
			} */
			.preview img {
				display: inline-block;
				border: 1px dotted #666;
				/* image-rendering: pixelated; */
				width: calc(100% - 2px);
				height: calc(100% - 2px);
			}
			.dropdown {
				list-style: none;
			}
			.menu {
				padding: 2px 4px;
			}
			[hidden] {
				display: none !important;
			}
			#faces {
				position: absolute;
				top:0;
				left: 0;
				width: calc(100% - 2px);
				height: calc(100% - 2px);
			}
			.face {
				position: absolute;
				border: 1px solid #0969b8;
				cursor: pointer;
			}
			.face span {
				position:absolute;
				text-align: left;
				top:100%;
				left: -1px;
				font-size: 0.6em;
				background: #0969b8;
				color: #ccc;
				padding: 2px;
				border-bottom-right-radius: 4px;
				border-bottom-left-radius: 4px;
			}
			.face:hover {
				z-index: 500;
				border: 1px solid #1e80d1;
			}
			.face:hover span{
				background: #1e80d1;
			}
			</style>
			
			<div class="fit layout v">
				<div class="menu layout h justify-end items-center">
					<dropdown-menu inline label="Zoom" .value="${this.zoomLevels[this.zoomIndex].text}">
						<ul class="dropdown">
							${this.zoomLevels.map((level, index) => this.renderLevel(level, index))}
						</ul>
					</dropdown-menu>
				</div>
				<div class="preview flex ">
					<div style="width: ${this.width}px; height: ${(this.height)}px;">
						<img id="preview" ?hidden="${!p.length}" .src="${p}" crossorigin="anonymous">
						<div id="faces"></div>
					</div>
				</div>
				<div class="selection layout h">
					${this.selectedFiles.map(f => this.renderFile(f))}
				</div>
			</div>
			
		`
	}
	
}