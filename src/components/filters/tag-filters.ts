import { LitElement, html, customElement, property, TemplateResult } from 'lit-element'
import '../common/check-box'
import { listStyles, flexStyles } from '../../styles/'
import { store } from '../../store'
import { setActiveTags, toggleActiveTag } from '../../store/actions'
import { Tag } from '../../types'

@customElement('tag-filters')
export class TagFilters extends LitElement {

	@property({type: Array})
	public tags: Tag[] = []

	@property({type: Array})
	public activeTags: string[] = []

	constructor(){
		super()
		this.tags = store.getState().tags
		this.activeTags = store.getState().filters.activeTags
		store.subscribe(() => {
			this.tags = store.getState().tags
			this.activeTags = store.getState().filters.activeTags
		})
	}
	
	private toggleAll(){
		if (this.activeTags.length === this.tags.length){
			store.dispatch(setActiveTags([]))
		}
		else {
			store.dispatch(setActiveTags([...this.tags.map(t => t.name)]))
		}
	}

	private toggleTag(tag: string){
		store.dispatch(toggleActiveTag(tag))
	}

	private renderTag(tag: string){
		return html `<li @click="${() => this.toggleTag(tag)}" class="layout"><span class="flex">${tag}</span><check-box ?checked="${this.activeTags.includes(tag)}" /></li>`
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
				<li @click="${() => this.toggleAll()}" class="layout">
					<span class="flex">Select / Deselect all</span>
					<check-box ?checked="${this.activeTags.length === this.tags.length}"></check-box>
				</li>
				${this.tags.map(tag => this.renderTag(tag.name))}
			</ul>
		`
	}
}