import { LitElement, html, customElement, query, property } from 'lit-element'
import { api } from './lib/api'
import './components/common/split-layout'
import './components/common/panel-menu'
import './components/common/panel-box'
import './components/common/check-box'
import './components/common/text-field'
import './components/common/modal-box'
import './components/filters/resolution-filters'
import './components/filters/tag-filters'
import './components/filters/date-filters'
import './components/filters/folder-filters'
import './components/filters/face-filters'
import './components/tag-manager'
import './components/folder-manager'
import './components/file-info'
import './components/file-preview'
import './components/file-list'
import { scrollbarStyles, buttonStyles } from './styles'
import { ModalBox } from './components/common/modal-box'
import { OpenDialogResult, Folder, ImageFile, ColorData } from './types/index'
import { FileList } from './components/file-list'
import { store } from './store/index'
import ColorThief from 'colorthief'
import { rgbToHsv } from './lib/utils'



const colorThief = new ColorThief()
declare const electronDialog: any

@customElement('app-shell')
export class AppShell extends LitElement  {


	@query('#manageFolders')
	private $modalFolders: ModalBox

	@query('#removeFolder')
	public $modalRemoveFolder: ModalBox

	@query('#modalDeleteTag')
	public $modalDeleteTag: ModalBox

	@query('#modalLabelFace')
	public $modalLabelFace: ModalBox
	
	@query('#modalDeleteFiles')
	public $modalDeleteFiles: ModalBox
	
	@query('file-list')
	private $fileList: FileList

	private folders: Folder[] = []
	
	@property({ type: Array })
	private files: ImageFile[] = []

	constructor(){
		super()
		api.listFolders().then((folders: Folder[]) => {
			if (!folders.length){
				this.$modalFolders.open()
			}
		})
		api.on('manage folders', () => {
			console.log('manage folders')
			this.$modalFolders.open()
		})
		api.on('refresh files', () => {
			console.log('refresh files')
			api.listFiles()
		})
		this.files = store.getState().files
		store.subscribe(() => {
			this.files = store.getState().files
		})

		console.time('get files')
		api.listFiles().then(() => {
			console.timeEnd('get files')
			// console.log('thisfiles', this.files)
			// this.loadByChunks()
		})
	}

	public updated(props: any){
		if (props.has('files')){
			this.onFilesChanged()
		}
	}

	private onFilesChanged(){
		this.indexColors()
	}

	private loadFaceApiModels(){

	}

	private getColorsFromImage(src: string): Promise<ColorData> {
		return new Promise((resolve, reject) => {
			const img = new Image()
			img.crossOrigin = 'anonymous'
			img.addEventListener('load', () => {
				try {
					const colors = {
						dominant: colorThief.getColor(img),
						palette: colorThief.getPalette(img, 10)
					}
					resolve(colors)
				}
				catch(e){
					reject()
				}
			})
			img.src = src
		})
	}

	private getFileColors(file: ImageFile){
		return this.getColorsFromImage(`thumb://${file._id}.webp`)
			.catch(() => {
				return this.getColorsFromImage(`local://${file.path}`)
			})
	}

	private indexColors(){
		// we get color data browser-side as colorthief doesn't work well with many image formats node-side
		console.time('colors indexed')
		const promises = this.files.filter(f => !f.dominant).map((file) => {
			return this.getFileColors(file).then(colors => {
				file.dominant = colors.dominant
				file.palette = colors.palette
				if (file.dominant){
					const hsv = rgbToHsv(...file.dominant)
					file.hue = hsv[0]
					file.saturation = hsv[1]
				}
				else {
					file.hue = 1
					file.saturation = 0
				}
				return api.saveFile(file)
			})
		})
		Promise.all(promises).then(() => {
			console.timeEnd('colors indexed')
		})
		
		
	}

	public refreshFileList(){
		// this.$fileList.loadByChunks()
	}


	private openFolder(){
		electronDialog.showOpenDialog({properties: ['openDirectory']}).then((result: OpenDialogResult) => {
			if (result.filePaths.length){
				console.log('paths', result.filePaths)
				api.addFolder(result.filePaths[0]).then(() => {
					console.log('done')
					this.refreshFileList()
				})
			}
		})
	}
	

	protected render(): any {
		
		return html `
			${scrollbarStyles}
			${buttonStyles}
			<style>
			:host {
				height:100%;
				overflow: auto;
				display: flex;
				background: #232330;
				color: #999;
			}
			:host * {
				box-sizing: border-box;
			}
			file-preview {
				min-height: 200px;
				
			}
			#info {
				width: 100px;
			}
			</style>
			
			
			<split-layout mode="horizontal" >
				<panel-menu style="min-width: 200px; width: 20%;">
					<panel-box title="Folder filters" class="active">
						<folder-filters ></folder-filters>
					</panel-box>
					<panel-box title="Date filters" class="active">
						<date-filters ></date-filters>
					</panel-box>
					<panel-box title="Face filters" class="active">
						<face-filters ></face-filters>
					</panel-box>
					<panel-box title="Resolution filters" class="active">
						<resolution-filters></resolution-filters>
					</panel-box>
					<panel-box title="Tag filters" class="active">
						<tag-filters ></tag-filters>
					</panel-box>
					
	 			</panel-menu>
				<split-layout mode="vertical" style="min-width:300px;">
					<file-preview ></file-preview>
					<file-list></file-list>
				</split-layout>
				<panel-menu style="min-width: 200px; width: 200px;">
					<panel-box title="Info" class="active" style="max-height: 165px;">
						<file-info></file-info>
					</panel-box>
					<panel-box title="Tags" class="active">
						<tag-manager></tag-manager>
					</panel-box>
				</panel-menu>
			</split-layout>

			<modal-box id="manageFolders" title="Manage folders">
				<folder-manager></folder-manager>
				<button slot="buttons" @click="${this.openFolder}">Add folder</button>
				<button slot="buttons" dialog-dismiss>Close</button>
			</modal-box>

			<modal-box id="removeFolder" title="Remove folder">
				<p>This will NOT erase the files.</p>
				<button slot="buttons" dialog-dismiss>Cancel</button>
				<button slot="buttons" dialog-confirm class="delete">Remove folder</button>
			</modal-box>

			<modal-box id="modalDeleteTag" title="Confirm delete">
				<p>Are you sure?</p>
				<button slot="buttons" dialog-dismiss>Cancel</button>
				<button slot="buttons" dialog-confirm class="delete">Delete</button>
			</modal-box>

			<modal-box id="modalLabelFace" title="Label this person">
				<p><text-field></text-field></p>
				<button slot="buttons" dialog-dismiss>Cancel</button>
				<button slot="buttons" dialog-confirm class="delete">Save</button>
			</modal-box>

			<modal-box id="modalDeleteFiles" title="Confirm delete">
				<p>Are you sure?</p>
				<button slot="buttons" dialog-dismiss>Cancel</button>
				<button slot="buttons" dialog-confirm class="delete">Delete</button>
			</modal-box>
		`
	}
	
}
