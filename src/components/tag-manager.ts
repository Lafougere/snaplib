import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import { bound } from '../lib/decorators'
import { api } from '../lib/api'
import { Tag } from '../types'
import { ModalBox } from '../components/common/modal-box'
import '../components/common/check-box'
import { listStyles, flexStyles, buttonStyles, scrollbarStyles } from '../styles'
import { store } from '../store'
import { ImageFile } from '../types'
import { AppShell } from '../app-shell'

@customElement('tag-manager')
export class TagManager extends LitElement {

	@property({type: Array})
	public tags: Tag[] = []

	@property({type: Array})
	public files: ImageFile[] = []

	@property({type: Array})
	public selection: string[] = []

	@property({type: String})
	public tagName: string = ''

	private $: {modalDeleteTag: ModalBox } = {modalDeleteTag: null }

	private app: AppShell = document.querySelector('app-shell')

	private get selectedFiles(): ImageFile[] {
		return this.selection.map(id => this.files.find(f => f._id === id))
	}

	private get activeTags(){
		return this.selectedFiles.reduce((prev, current) => {
			prev = [...prev, ...current.tags|| []]
			return prev
		}, [])
	}

	constructor(){
		super()
		api.listTags()
		this.tags = store.getState().tags
		this.files = store.getState().files
		this.selection = store.getState().selection
		store.subscribe(() => {
			this.tags = store.getState().tags
			this.files = store.getState().files
			this.selection = store.getState().selection
		})
	}
	
	@bound
	addTag(){
		api.addTag(this.tagName)
		this.tagName = ''
	}

	confirmDeleteTag(tag: Tag){
		this.app.$modalDeleteTag.open().confirmed.then(() => {
			api.removeTag(tag._id).then(() => {
				this.app.$modalDeleteTag.close()
				
			})
		})
	}

	toggleTag(tag: string){
		const someFilesHaveTag = this.selectedFiles.some(file => {
			if (!file.tags) return false
			return file.tags.includes(tag)
		})
		const filesToUpdate = this.selectedFiles.map(file => {
			file.tags = file.tags || []
			if (someFilesHaveTag){
				file.tags = file.tags.filter(t => t !== tag)
			}
			else {
				file.tags.push(tag)
			}
			return file
		})
		
		const promises = filesToUpdate.map(file => api.saveFile(file))
		Promise.all(promises).then(() => {
			api.listFiles()
		})
	}
	
	private renderTag(tag: Tag){
		return html `<li @click="${() => this.toggleTag(tag.name)}" class="layout"><check-box ?checked="${this.activeTags.includes(tag.name)}"></check-box><span class="flex">${tag.name}</span><app-icon icon="delete" @click="${() => this.confirmDeleteTag(tag)}" /></app-icon></li>`
	}

	public render(): TemplateResult {
		return html `
			${listStyles}
			${flexStyles}
			${buttonStyles}
			${scrollbarStyles}
			<style>
			:host {
				display: block;
				height: 100%;
			}
			.tag-form {
				padding: 4px 8px;

			}
			.tag-form text-field {
				margin-right: 2px;

			}
			app-icon[icon="delete"] {
				width: 16px;
				height: 16px;
				color: #ac0f31;
			}

			</style>
			
			<div class="layout v scroll fit">
				<ul class="tag-list flex scroll">
					${this.tags.map(tag => this.renderTag(tag))}
				</ul>
				<div class="tag-form layout h">
					<text-field class="mini" .value="${this.tagName}" @input="${(e: any) => this.tagName = e.target.value}"><button slot="append" class="button mini" @click="${this.addTag}" ?disabled="${!this.tagName.trim().length}">Add</button></text-field>
				</div>
			</div>

			
		`
	}
}