import { LitElement, html, customElement, property, query, TemplateResult } from 'lit-element'
import { ImageFile } from '../types'
import { listStyles, flexStyles, scrollbarStyles } from '../styles'
// import { api } from '../lib/api'
import { setSelection, sortFiles, toggleSelected } from '../store/actions'
import { store } from '../store'
import './common/dropdown-menu'
import './common/app-icon'
import { bound } from '../lib/decorators'
import { OpenDialogResult } from '../types/index'
import { api } from '../lib/api'
import { AppShell } from '../app-shell'

declare const electronDialog: any
declare const window: any
const pathutil: any = window['pathutil'] as any

@customElement('file-list')
export class FileList extends LitElement {

	@property({type: Array})
	public files: ImageFile[] = []

	@property({type: String})
	public sortField: string = 'path'

	@property({type: String})
	public sortDirection: 'asc' | 'desc' = 'asc'

	@property({type: Array})
	public activeResolutions: string[] = []

	@property({type: Array})
	public activeTags: string[] = []

	@property({type: Array})
	public activeDates: string[] = []

	@property({type: Array})
	public activeFolders: string[] = []

	@property({type: Array})
	public activeLabels: string[] = []

	@property({type: Array})
	public selection: string[] = []

	@query('#files')
	private $files: HTMLDivElement

	private groupLimit: number = 100
	private filteredFiles: ImageFile[] = []
	private groups: any = {}
	private renderTimeout: any
	private $app: AppShell = document.querySelector('app-shell')

	private get sortLabel(){
		switch(this.sortField){
		case 'path': return 'Path'
		case 'hue': return 'Hue'
		case 'date': return 'Date'
		}
	}

	private get years(){
		const years = Object.keys(this.groups).sort()
		if (this.sortDirection === 'desc'){
			years.reverse()
		}
		return years
	}

	constructor(){
		super()
		this.selection = store.getState().selection
		this.files = store.getState().files
		this.activeResolutions = store.getState().filters.activeResolutions
		this.activeTags = store.getState().filters.activeTags
		this.activeDates = store.getState().filters.activeDates
		this.activeFolders = store.getState().filters.activeFolders
		this.activeLabels = store.getState().filters.activeLabels
		store.subscribe(() => {
			this.selection = store.getState().selection
			this.files = store.getState().files
			this.activeResolutions = store.getState().filters.activeResolutions
			this.activeTags = store.getState().filters.activeTags
			this.activeDates = store.getState().filters.activeDates
			this.activeFolders = store.getState().filters.activeFolders
			this.activeLabels = store.getState().filters.activeLabels
		})
	}

	public updated(props: any){
		console.log('updated', props.has('files'), props.entries())
		if (props.has('activeResolutions') || props.has('activeTags') || props.has('activeDates') || props.has('activeFolders') || props.has('activeLabels')){
			this.onFilesChanged()
		}
		if (props.has('files')){
			this.onFilesChanged()
		}
	}

	private onFilesChanged(){
		this.filterFiles()
		this.groupFiles()
		const stack: HTMLElement[] = []
		this.$files.innerHTML = ''
		console.time('stack built')
		this.years.forEach(y => stack.push(...this.buildFileStack(this.groups[y])))
		console.timeEnd('stack built')
		console.log('STACK', stack.length)
		// stack.forEach(el => this.$files.appendChild(el))
		clearTimeout(this.renderTimeout)
		this.renderStack(stack)
	}

	private filterFiles(){
		console.time('filtered')
		const filteredByPath = this.files.filter(f => {
			const p = pathutil.dirname(f.path)
			return this.activeFolders.includes(p)
		})
		const filteredByResolution = filteredByPath.filter(file => this.activeResolutions.includes(file.res))
		const filteredByTags = filteredByResolution.filter(file => this.activeTags.every(t => file.tags.includes(t)))
		const filteredByDate = filteredByTags.filter(file => {
			const m = `${file.dateModified.getFullYear()}-${file.dateModified.getMonth()}` 
			return this.activeDates.includes(m)
		})
		const filteredByLabels = filteredByDate.filter(file => this.activeLabels.every(l => file.faces.find(f => f.label === l)))
		this.filteredFiles = filteredByLabels
		console.timeEnd('filtered')
	}

	private groupFiles(){
		console.time('grouped')
		if (this.sortField === 'date'){
			this.groups = this.getGroupsByDate()
		}
		else {
			this.groups = [{
				title: '',
				files: this.filteredFiles
			}]
		}
		console.timeEnd('grouped')
	}

	private renderStack(stack: HTMLElement[]){
		const toRender = stack.splice(0, 100)
		toRender.forEach(el => this.$files.appendChild(el))
		if (stack.length){
			this.renderTimeout = setTimeout(() => {
				this.renderStack(stack)
			}, 20)
		}
	}

	private buildFileStack(group: any): HTMLElement[]{
		const stack: HTMLElement[] = []
		if (group.files.length > this.groupLimit && group.children){
			const children = Object.keys(group.children)
			if (this.sortDirection === 'desc'){
				children.reverse()
			}
			children.forEach(child => {
				stack.push(...this.buildFileStack(group.children[child]))
			})
			
		}
		
		else {
			const h3 = document.createElement('h3')
			h3.innerHTML = group.title
			stack.push(h3)
			group.files.forEach((f: ImageFile) => {
				const img = new Image()
				img.tabIndex = -1
				img.id = `f_${f._id}`
				img.classList.add(`res${f.res}`)
				img.addEventListener('mouseup', (e: MouseEvent) => this.onImageMouseUp(e, f))
				img.src = `thumb://${f._id}.webp`
				stack.push(img)
			})
			
		}
		return stack
	}

	private getGroupsByDate(){
		return this.filteredFiles.reduce((prev: any, current: ImageFile) => {
			const year = current.dateModified.getFullYear()
			const month = current.dateModified.getMonth()
			const day = current.dateModified.getDate()
			prev[year] = prev[year] || {
				title: year,
				files: [],
				children: {}
			}
			prev[year].files.push(current)
			prev[year].children[month] = prev[year].children[month] || {
				title: current.dateModified.toLocaleString('default', {month: 'long', year: 'numeric'}),
				files: [],
				children: {}
			}
			prev[year].children[month].files.push(current)
			prev[year].children[month].children[day] = prev[year].children[month].children[day] || {
				title: current.dateModified.toLocaleString('default', {weekday: 'short', day: '2-digit', month: 'long', year: 'numeric'}),
				files: []
			}
			prev[year].children[month].children[day].files.push(current)
			return prev
		}, {})
	}

	private selectRange(fromId: string, toId: string){
		const fromIndex = this.filteredFiles.findIndex(f => f._id === fromId)
		const toIndex = this.filteredFiles.findIndex(f => f._id === toId)
		const start = Math.min(fromIndex, toIndex)
		const end = Math.max(fromIndex, toIndex)
		const selection = []
		for (let i = start; i < end + 1; i++){
			selection.push(this.filteredFiles[i]._id)
		}
		return selection
	}

	private onImageMouseUp(e: MouseEvent, file: ImageFile){
		if (e.ctrlKey){
			store.dispatch(toggleSelected(file._id))
		}
		else if (e.shiftKey){
			const selStart = this.selection[0]
			if (typeof selStart === 'undefined'){
				store.dispatch(setSelection([file._id]))
			}
			else {
				const selection = this.selectRange(selStart, file._id)
	
				store.dispatch(setSelection(selection))
			}
		}
		else {
			store.dispatch(setSelection([file._id]))
		}
		this.updateSelection()
	}

	private updateSelection(){
		const selected = Array.from(this.shadowRoot.querySelectorAll('#files .selected'))
		selected.forEach(img => img.classList.remove('selected'))
		this.selection.forEach(id => this.shadowRoot.querySelector('#f_' + id).classList.add('selected'))
	}

	public setSort(field: string){
		this.sortField = field
		store.dispatch(sortFiles(field, this.sortDirection))
	}

	@bound
	private toggleSortDirection(){
		this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
		store.dispatch(sortFiles(this.sortField, this.sortDirection))
	}

	@bound
	private copyFiles(){
		console.log('copy', this.selection)
		const selectedPaths = this.selection.map(id => this.files.find(f => f._id === id).path)
		console.log('from', selectedPaths)
		electronDialog.showOpenDialog({buttonLabel: 'Copy files', properties: ['openDirectory', 'createDirectory']}).then((result: OpenDialogResult) => {
			if (result.filePaths.length){
				console.log('to', result.filePaths)
				api.copyFiles(selectedPaths, result.filePaths[0]).then(() => {
					console.log('copied')
				})
			}
		})
	}

	@bound
	private moveFiles(){
		console.log('move', this.selection)
		const selectedPaths = this.selection.map(id => this.files.find(f => f._id === id).path)
		console.log('from', selectedPaths)
		electronDialog.showOpenDialog({buttonLabel: 'Move files', properties: ['openDirectory', 'createDirectory']}).then((result: OpenDialogResult) => {
			if (result.filePaths.length){
				console.log('to', result.filePaths)
				api.moveFiles(selectedPaths, result.filePaths[0]).then(() => {
					store.dispatch(setSelection([]))
					console.log('moved')
				})
			}
		})
	}

	@bound
	private deleteFiles(){
		const selectedPaths = this.selection.map(id => this.files.find(f => f._id === id).path)
		this.$app.$modalDeleteFiles.open().confirmed.then(() => {
			store.dispatch(setSelection([]))
			api.request('delete files', selectedPaths).then(() => {
				this.$app.$modalDeleteFiles.close()
			})
		})
	}
	
	public render(): TemplateResult {
		return html `
			${listStyles}
			${flexStyles}
			${scrollbarStyles}
			<style>
			:host {
				display: block;
				display: flex;
				flex-direction: column;
				overflow: auto;
			}
			#files {
				overflow: auto;
				font-size: 0;
				padding-top: 12px;
				width: 100%;
			}
			#files h3 {
				font-size: 12px;
			}
			#files img {
				width: 96px;
				height: 96px;
				/* display: inline-block; */
				border: 2px solid #333;
				margin: 1px;
				border-radius: 2px;
				/* object-fit: contain; */
				outline: none;
			}
			#files img.selected {
				border: 2px solid #0969b8;
			}
			#menu {
				padding: 4px;
			}
			#menu a {
				margin: 4px;
				cursor: pointer;
			}
			#menu app-icon {
				width: 20px;
				height: 20px;
				
			}
			#menu a:not([disabled]):hover {
				color: #125ea5;
			}
			a[disabled] {
				opacity: 0.3;
				cursor: not-allowed !important;
			}
			</style>
			
			<div id="menu" class="layout h items-center">
				<div class="">
					<a class="fab" @click="${this.copyFiles}" title="Copy selected files" ?disabled="${!this.selection.length}"><app-icon icon="folder-copy"></app-icon></a>
					<a class="fab" @click="${this.moveFiles}" title="Move selected files" ?disabled="${!this.selection.length}"><app-icon icon="folder-move"></app-icon></a>
					<a class="fab" @click="${this.deleteFiles}" title="Delete selected files" ?disabled="${!this.selection.length}"><app-icon icon="delete"></app-icon></a>
				</div>
				<div class="flex"></div>
				<dropdown-menu inline label="Sort by" .value="${this.sortLabel}">
					<ul>
						<li id="path" @click="${() => this.setSort('path')}">Path</li>
						<li id="date" @click="${() => this.setSort('date')}">Date</li>
						<li id="hue" @click="${() => this.setSort('hue')}">Hue</li>
					</ul>
				</dropdown-menu>
				<app-icon icon="sort-${this.sortDirection}" @click="${this.toggleSortDirection}"></app-icon>
			</div>
			<div id="files">
				
			</div>
			
		`
	}
}