import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import '../common/check-box'
import { listStyles, flexStyles } from '../../styles/'
import { store } from '../../store'
import { toggleActiveLabel, setActiveLabels } from '../../store/actions'
import { ImageFile } from '../../types'

declare const window: any
const pathutil: any = window['pathutil'] as any

@customElement('face-filters')
export class FaceFilters extends LitElement {

	@property({type: Array})
	public files: ImageFile[] = []

	@property({type: Array})
	public activeLabels: any[] = []

	@property({type: Array})
	public activeFolders: any[] = []

	@property({type: Array})
	public activeDates: any[] = []
	
	@property({type: Array})
	public labels: string[] = []

	constructor(){
		super()
		this.files = store.getState().files
		this.activeLabels = store.getState().filters.activeLabels
		this.activeFolders = store.getState().filters.activeFolders
		this.activeDates = store.getState().filters.activeDates
		store.subscribe(() => {
			this.files = store.getState().files
			this.activeLabels = store.getState().filters.activeLabels
			this.activeFolders = store.getState().filters.activeFolders
			this.activeDates = store.getState().filters.activeDates
		})
	}

	private setLabels(){
		const filteredByPath = this.files.filter(f => {
			const p = pathutil.dirname(f.path)
			return this.activeFolders.includes(p)
		})
		const filteredByDate = filteredByPath.filter(file => {
			const m = `${file.dateModified.getFullYear()}-${file.dateModified.getMonth()}` 
			return this.activeDates.includes(m)
		})
		const filesByLabel = filteredByDate.reduce((prev: any, current: ImageFile) => {
			const labels = current.faces.filter(face => !!face.label).map(f => f.label)
			labels.forEach(label => {
				prev[label] = prev[label] || []
				prev[label].push(current)
			})
			return prev
		}, {})
		
		this.labels = Object.keys(filesByLabel).sort()
	}
	
	public updated(props: any){
		if (props.has('files') || props.has('activeFolders') || props.has('activeDates')){
			this.setLabels()
		}
	}

	private toggleAll(){
		if (this.activeLabels.length === this.labels.length){
			store.dispatch(setActiveLabels([]))
		}
		else {
			store.dispatch(setActiveLabels([...this.labels]))
		}
	}

	private toggleLabel(label: string){
		store.dispatch(toggleActiveLabel(label))
	}

	private renderLabel(label: string){
		return html `<li @click="${() => this.toggleLabel(label)}" class="">
			<check-box ?checked="${this.activeLabels.includes(label)}" ></check-box>
			<span class="">${label}</span>
		</li>`
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
			
			</style>
			
			<ul id="labels">
				<li @click="${() => this.toggleAll()}" class="layout h">
					<span class="flex">Select / Deselect all</span>
					<check-box ?checked="${this.activeLabels.length >= this.labels.length}"></check-box>
				</li>
				${this.labels.map(label => this.renderLabel(label))}
			</ul>
		`
	}
}