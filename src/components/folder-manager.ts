import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import { api } from '../lib/api'
import '../components/common/check-box'
import { listStyles, flexStyles, buttonStyles, scrollbarStyles } from '../styles'
import { store } from '../store'
import { Folder } from '../types'
import { AppShell } from '../app-shell'

@customElement('folder-manager')
export class FolderManager extends LitElement {

	@property({type: Array})
	public folders: Folder[] = []

	@property({type: String})
	public folderName: string = ''

	private app: AppShell = document.querySelector('app-shell')

	constructor(){
		super()
		this.folders = store.getState().folders
		store.subscribe(() => {
			this.folders = store.getState().folders
		})
	}

	private confirmDeleteFolder(folder: Folder){
		this.app.$modalRemoveFolder.open().confirmed.then(() => {
			api.removeFolder(folder._id).then(() => {
				this.app.$modalRemoveFolder.close()
				this.app.refreshFileList()
			})
		})
	}
	
	private renderFolder(folder: Folder){
		return html `<li class="layout h"><span class="flex">${folder.path}</span><app-icon icon="delete" @click="${() => this.confirmDeleteFolder(folder)}" /></app-icon></li>`
	}

	private renderFolders(){
		return html `
			<div class="layout v scroll fit">
				<ul class="tag-list flex scroll">
					${this.folders.map(folder => this.renderFolder(folder))}
				</ul>
			</div>
		`
	}

	private renderEmpty(){
		return html `
			<p>Click the button below to add folders containing images from your filesystem.</p>
		`
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
			app-icon[icon="delete"] {
				width: 16px;
				height: 16px;
				color: #ac0f31;
			}
			button.delete {
				background: #ac0f31;
			}
			li {
				text-align: left;
			}
			</style>
			
			${this.folders.length ? this.renderFolders() : this.renderEmpty()}
			
		`
	}
}