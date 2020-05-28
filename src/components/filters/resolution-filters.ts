import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import '../common/check-box'
import { listStyles, flexStyles } from '../../styles/'
import { store } from '../../store'
import { toggleActiveResolution, setActiveResolutions } from '../../store/actions'
import { ImageFile } from '../../types'

declare const window: any
const pathutil: any = window['pathutil'] as any

@customElement('resolution-filters')
export class ResolutionFilters extends LitElement {

	@property({type: Array})
	public files: ImageFile[] = []

	@property({type: Array})
	public activeResolutions: any[] = []

	@property({type: Array})
	public activeFolders: string[] = []

	@property({type: Array})
	public activeLabels: string[] = []

	@property({type: Array})
	public activeDates: any[] = []
	
	@property({type: Array})
	public resolutions: string[] = []

	constructor(){
		super()
		this.files = store.getState().files
		this.activeResolutions = store.getState().filters.activeResolutions
		this.activeFolders = store.getState().filters.activeFolders
		this.activeDates = store.getState().filters.activeDates
		this.activeLabels = store.getState().filters.activeLabels
		store.subscribe(() => {
			this.files = store.getState().files
			this.activeResolutions = store.getState().filters.activeResolutions
			this.activeFolders = store.getState().filters.activeFolders
			this.activeDates = store.getState().filters.activeDates
			this.activeLabels = store.getState().filters.activeLabels
		})
	}

	private setResolutions(){
		const filteredByPath = this.files.filter(f => {
			const p = pathutil.dirname(f.path)
			return this.activeFolders.includes(p)
		})
		const filteredByDate = filteredByPath.filter(file => {
			const m = `${file.dateModified.getFullYear()}-${file.dateModified.getMonth()}` 
			return this.activeDates.includes(m)
		})
		const filteredByLabel = filteredByDate.filter(file => this.activeLabels.every(l => file.faces.find(f => f.label === l)))
		const filesByResolution = filteredByLabel.reduce((prev: any, current: ImageFile) => {
			const res = `${current.w}x${current.h}`
			prev[res] = prev[res] || []
			prev[res].push(current)
			return prev
		}, {})
		
		this.resolutions = Object.keys(filesByResolution).sort((a, b) => {
			const resA = a.split('x')
			const resB = b.split('x')
			return (parseInt(resA[0]) - parseInt(resB[0])) || (parseInt(resA[1]) - parseInt(resB[1]))
		})
	}
	
	public updated(props: any){
		if (props.has('files') || props.has('activeFolders') || props.has('activeDates') || props.has('activeLabels')){
			this.setResolutions()
		}
	}

	private toggleAll(){
		if (this.activeResolutions.length === this.resolutions.length){
			store.dispatch(setActiveResolutions([]))
		}
		else {
			store.dispatch(setActiveResolutions([...this.resolutions]))
		}
	}

	private toggleResolution(res: string){
		store.dispatch(toggleActiveResolution(res))
	}

	private renderResolution(res: string){
		return html `<li @click="${() => this.toggleResolution(res)}" class="">
			<check-box ?checked="${this.activeResolutions.includes(res)}" ></check-box>
			<span class="">${res}</span>
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
			
			<ul id="resolutions">
				<li @click="${() => this.toggleAll()}" class="layout h">
					<span class="flex">Select / Deselect all</span>
					<check-box ?checked="${this.activeResolutions.length === this.resolutions.length}"></check-box>
				</li>
				${this.resolutions.map(res => this.renderResolution(res))}
			</ul>
		`
	}
}