import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import '../common/check-box'
import { listStyles, flexStyles } from '../../styles/'
import { store } from '../../store'
import { toggleActiveDate, setActiveDates } from '../../store/actions'
import { ImageFile } from '../../types'
import { toggleCollection } from '../../lib/utils'

declare const window: any
const pathutil: any = window['pathutil'] as any

@customElement('date-filters')
export class DateFilters extends LitElement {

	@property({type: Array})
	public files: ImageFile[] = []
	
	@property({type: Array})
	public activeDates: string[] = []

	@property({type: Array})
	public activeFolders: string[] = []
	
	@property({type: Array})
	public expandedYears: number[] = []

	@property({type: Object })
	public grouped: any = {}
	
	private get years(){
		return Object.keys(this.grouped).map(y => parseInt(y, 10)).sort().reverse()
	}

	private get isAllSelected(){
		return this.years.every(year => this.isYearSelected(year))
	}

	constructor(){
		super()
		this.files = store.getState().files
		this.activeFolders = store.getState().filters.activeFolders
		this.activeDates = store.getState().filters.activeDates
		store.subscribe(() => {
			this.files = store.getState().files
			this.activeDates = store.getState().filters.activeDates
			this.activeFolders = store.getState().filters.activeFolders
		})
	}

	public updated(props: any){
		if (props.has('files') || props.has('activeFolders')){
			this.buildGroups()
		}
	}

	private buildGroups(){
		const filteredByPath = this.files.filter(f => {
			const p = pathutil.dirname(f.path)
			return this.activeFolders.includes(p)
		})
		this.grouped = filteredByPath.reduce((prev: any, current: ImageFile) => {
			const year = current.dateModified.getFullYear()
			const month = current.dateModified.getMonth()
			const day = current.dateModified.getDate()
			prev[year] = prev[year] || {}
			prev[year][month] = prev[year][month] || {}

			prev[year][month][day] = prev[year][month][day] || 0
			prev[year][month][day]++
			return prev
		}, {})
	}
	
	private toggleAll(){
		if (this.isAllSelected){
			store.dispatch(setActiveDates([]))
		}
		else {
			const allMonths: string[] = []
			this.years.forEach(year => {
				Object.keys(this.grouped[year]).forEach(month => {
					const m = `${year}-${month}`
					allMonths.push(m)
				})
			})
			store.dispatch(setActiveDates(allMonths))
		}
	}

	private toggleYear(year: number){
		const months: string[] = Object.keys(this.grouped[year]).map(month => `${year}-${month}`)
		if (this.isYearSelected(year)){
			const filtered = this.activeDates.filter(active => !months.includes(active))
			store.dispatch(setActiveDates(filtered))
		}
		else {
			const added = [...this.activeDates, ...months]
			store.dispatch(setActiveDates(added))
		}
	}
	
	private toggleMonth(year: number, month: number){
		const m = `${year}-${month}`
		store.dispatch(toggleActiveDate(m))
	}

	private toggleCollapse(e: MouseEvent, year: number){
		e.stopPropagation()
		toggleCollection(this.expandedYears, year)
		this.expandedYears = [...this.expandedYears]
	}

	private getMonthName(month: number): string {
		const date = new Date(2000, month, 1)
		return date.toLocaleString('default', { month: 'long' })
	}

	private isYearSelected(year: number): boolean {
		return this.activeDates.some(monthStr => monthStr.startsWith(year.toString()))
	}

	private isMonthSelected(year: number, month: number): boolean {
		const m = `${year}-${month}`
		return this.activeDates.includes(m)
	}

	private renderMonth(year: number, month: number){
		return html `
			<li @click="${() => this.toggleMonth(year, month)}" class="layout">
				<check-box ?checked="${this.isMonthSelected(year, month)}" /></check-box>
				<span class="flex">${this.getMonthName(month)}</span>
			</li>
			
		`
	}

	private renderYear(year: number){
		return html `
			<li @click="${() => this.toggleYear(year)}" class="${this.expandedYears.includes(year) ? '' : 'collapsed'}">
				<app-icon icon="caret-right" @click="${(e: MouseEvent)  => this.toggleCollapse(e, year)}"></app-icon>
				<check-box ?checked="${this.isYearSelected(year)}"></check-box>
				<span class="flex">${year}</span>
			</li>
			<li class="children">
				<ul>
					${this.expandedYears.includes(year) && Object.keys(this.grouped[year]).map(month => this.renderMonth(year, parseInt(month, 10)))}
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
			li.children {
				height: auto;
				padding: 0;
				border: 0;
				overflow: hidden;
				max-height: auto;
			}
			li.collapsed + .children {
				max-height: 0;
				
			}
			ul ul {
				display: flex;
				flex-direction: column;
				width: 100%;
			}
			ul ul li:not(.children) {
				padding-left: 32px;
			}
			app-icon[icon="caret-right"] {
				margin-left: -5px;
				margin-right: -5px;
				transform: rotate(90deg);
			}
			li.collapsed app-icon[icon="caret-right"] {
				transform: rotate(0deg);
			}
			</style>
			
			<ul id="dates">
				<li @click="${() => this.toggleAll()}" class="layout">
					<span class="flex">Select / Deselect all</span>
					<check-box ?checked="${this.isAllSelected}"></check-box>
				</li>
				${this.years.map(year => this.renderYear(year))}
			</ul>
		`
	}
}