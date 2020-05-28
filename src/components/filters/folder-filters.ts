import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import '../common/check-box'
import { listStyles, flexStyles } from '../../styles/'
import { store } from '../../store'
import { setActiveFolders } from '../../store/actions'
import { ImageFile, Folder } from '../../types/index'
import { api } from '../../lib/api'
import { toggleCollection } from '../../lib/utils'

declare const window: any
const pathutil: any = window['pathutil'] as any

@customElement('folder-filters')
export class FolderFilters extends LitElement {

	@property({type: Array})
	public files: ImageFile[] = []
	
	@property({type: Array})
	public folders: Folder[] = []

	@property({type: Array})
	public tree: any[] = []

	@property({type: Array})
	public activeFolders: string[] = []

	@property({type: Array})
	public expandedFolders: string[] = []
	
	@property({type: Object})
	public folderCounts: any = {}
	
	private allPaths: string[] = []

	constructor(){
		super()
		this.files = store.getState().files
		this.folders = store.getState().folders
		this.activeFolders = store.getState().filters.activeFolders
		store.subscribe(() => {
			this.files = store.getState().files
			this.folders = store.getState().folders
			this.activeFolders = store.getState().filters.activeFolders
		})
	}
	
	public updated(props: any){
		if (props.has('folders')){
			this.getTree()
		}
		if (props.has('files')){
			this.updateCounts()
		}
	}

	private updateCounts(){
		this.folderCounts = this.files.reduce((prev: any, current: ImageFile) => {
			const dir = pathutil.dirname(current.path)
			prev[dir] = prev[dir] || 0
			prev[dir]++
			return prev
		}, {})
	}
	
	private getTree() {
		const proms = this.folders.map(f => api.getFolderTree(f.path))
		Promise.all(proms).then(tree => {
			this.tree = tree
			this.allPaths = this.getAllPaths(this.tree)
		})
		
	}

	private getFolderCount(path: string){
		const total = Object.keys(this.folderCounts).filter(p => p === path || p.startsWith(path + '/')).reduce((prev, current) => {
			prev += this.folderCounts[current]
			return prev
		}, 0)
		return total
	}

	private getAllPaths(tree: any[]){
		const paths: string[] = []
		tree.forEach((f: any) => {
			const childPaths: string[] = this.getAllPaths(f.children)
			paths.push(...childPaths)
			paths.push(f.fullPath)
		})
		
		return paths
	}
	
	private toggleAll(){
		if (this.activeFolders.length === this.allPaths.length){
			store.dispatch(setActiveFolders([]))
		}
		else {
			store.dispatch(setActiveFolders([...this.allPaths]))
		}
	}
	
	private isFolderSelected(path: string){
		return this.activeFolders.includes(path)
	}

	private isPartiallySelected(path: string){
		return !this.isFolderSelected(path) && this.activeFolders.some(f => f.startsWith(path + '/'))
	}

	private toggleFolder(pth: string){
		const subFolders = this.allPaths.filter(p => p === pth || p.startsWith(pth + '/'))
		if (this.isFolderSelected(pth) || this.isPartiallySelected(pth)){
			const filtered = this.activeFolders.filter(active => !subFolders.includes(active))
			store.dispatch(setActiveFolders(filtered))
		}
		else {
			const added = [...this.activeFolders, ...subFolders]
			store.dispatch(setActiveFolders(added))
		}
	}
	
	private toggleCollapse(e: MouseEvent, folder: any){
		e.stopPropagation()
		toggleCollection(this.expandedFolders, folder.fullPath)
		this.expandedFolders = [...this.expandedFolders]
	}

	private renderFolder(folder: any, level=0){
		return html `
			<li @click="${() => this.toggleFolder(folder.fullPath)}" class="layout ${this.expandedFolders.includes(folder.fullPath) ? '' : 'collapsed'}" style="padding-left: ${(8+level*8)}px;">
				<app-icon icon="caret-right" @click="${(e: MouseEvent) =>this.toggleCollapse(e, folder)}" class="${folder.children.length ? '' : 'invisible'}"></app-icon>
				<check-box ?checked="${this.isFolderSelected(folder.fullPath)}" ?partial="${this.isPartiallySelected(folder.fullPath)}"></check-box>
				<span class="flex">${folder.name}</span>
				<div><span class="badge">${this.getFolderCount(folder.fullPath)}</span></div>
			</li>
			<li class="children">
				<ul>
					${this.expandedFolders.includes(folder.fullPath) && folder.children.map((child: any) => this.renderFolder(child, level + 1))}
				</ul>
			</li>
		`
	}

	public render(): TemplateResult {
		return html `
			${listStyles}
			${flexStyles}
			<style>
			:host {
				display: block;
				height: 100%;
				overflow: auto;
			}
			ul ul {
				display: flex;
				flex-direction: column;
				width: 100%;
			}
			li.children {
				height: auto;
				padding: 0;
				border: 0;
				overflow: hidden;
				max-height: auto;
			}
			span.flex {
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}
			li.collapsed + .children {
				max-height: 0;
				
			}
			app-icon[icon="caret-right"] {
				margin-left: -5px;
				margin-right: -5px;
				transform: rotate(90deg);
			}
			li.collapsed app-icon[icon="caret-right"] {
				transform: rotate(0deg);
			}
			.invisible {
				visibility: hidden;
			}
			[hidden] {
				display: none;
			}
			.badge {
				font-size: 0.7em;
				background: #151127;
				padding: 2px 5px;
				border-radius: 10px;
				color: #ccc;
			}
			</style>
			
			<ul id="folders">
				<li @click="${() => this.toggleAll()}" class="layout">
					<span class="flex">Select / Deselect all</span>
					<check-box ?checked="${this.activeFolders.length === this.folders.length}"></check-box>
				</li>
				${this.tree.map(folder => this.renderFolder(folder))}
			</ul>
		`
	}
}