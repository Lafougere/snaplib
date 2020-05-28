import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import { ImageFile } from '../types'
import { store } from '../store/index'
import { formatBytes } from '../lib/utils'
import { flexStyles } from '../styles'
// import { api } from '../lib/api'
declare const window: any
const pathutil: any = window['pathutil'] as any

@customElement('file-info')
export class FileInfo extends LitElement {

	@property({type: Object})
	public file: ImageFile = null

	private get fileName(): string {
		return pathutil.basename(this.file.path)
	}

	constructor(){
		super()
		this.file = store.getState().focusedFile
		store.subscribe(() => {
			this.file = store.getState().focusedFile
		})
	}

	public updated(props: any){
		if (props.has('file') && this.file){
			this.onFileChange()
		}
	}

	private onFileChange(){
		// api.getMeta(this.file.path).then(meta => {
		// 	console.log(meta)
		// })
	}

	private getBg(colors: number[]){
		return `background: rgb(${colors.join(',')});`
	}

	private renderPalette(c: number[]){
		return html `<div class="color" style="${this.getBg(c)}"></div>`
	}

	private renderColors(){
		return html `
			<div class="colors layout h" ?hidden="${!this.file.dominant}">
				<div class="dominant" style="${this.getBg(this.file.dominant)}">

				</div>
				<div class="palette layout h wrap">
					${this.file.palette.map(p => this.renderPalette(p))}
				</div>
			</div>
			<div>Hue: ${this.file.hue}</div>
			<div>Sat: ${this.file.saturation}</div>
		`
	}
	
	public render(): TemplateResult {
		if (!this.file) return
		return html `
			${flexStyles}
			<style>
			
			:host {
				display: block;
				padding: 4px;
				font-size: 0.9em;
				overflow: hidden;
			}
			:host > div {
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			.dominant {
				width: 36px;
				height: 36px;
				border-radius: 50%;
				flex-shrink: 0;
				margin-right:5px;
				margin-top: 2px;
			}
			.palette {
				width: 110px;

			}
			.palette .color {
				width: 16px;
				height: 16px;
				margin: 2px;
				border-radius: 50%;
			}
			[hidden] {
				display: none;
			}
			</style>
			
			<div>Width: ${this.file.w} pixels</div>
            <div>Height: ${this.file.h} pixels</div>
            <div>Size: ${formatBytes(this.file.size, 3)}</div>
			<div title="${this.fileName}">Name: ${this.fileName}</div>
			<div title="${this.file.dateModified.toString()}">Last modified: ${this.file.dateModified}</div>
			${this.file.dominant ? this.renderColors() : ''}
			
		`
	}
}