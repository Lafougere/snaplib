import { LitElement, html, property, customElement, TemplateResult } from 'lit-element'
import { bound } from '../../lib/decorators'
import { debounce } from 'lodash-es'
import './app-icon'

declare const ResizeObserver: any

@customElement('split-layout2')
export class SplitLayout2 extends LitElement {

	@property({type: String})
	public mode: string = 'horizontal'

	@property({type: Array})
	public panes: any[] = []
	
	private splitters: any[] = []
	private startPos: number = 0
	private startPosPct: number = 0
	private minDeltaPct: number = 0
	private maxDeltaPct: number = 100
	private splitSize: number = 0
	private startSizes: string[] = []
	private pctSizes: string[] = []

	firstUpdated(props: any){
		super.firstUpdated(props)
		const slot = this.shadowRoot.querySelector('slot') as HTMLSlotElement
		slot.addEventListener('slotchange', this.onSlotChanged)
		new ResizeObserver(debounce(this.onResize, 300)).observe(this)
	}

	@bound
	onResize(){
		console.log('resize!!', this.offsetWidth)
		this.onSlotChanged()
	}

	updated(props: any){
		super.updated(props)
		this.splitters = Array.from(this.shadowRoot.querySelectorAll('.splitter'))
		this.splitters.forEach((splitter, index) => {
			this.setSplitterPosition(index)
		})
	}

	@bound
	onSlotChanged(){
		const panes = Array.from(this.children)
		this.panes = panes
		// for (let i=1; i< this.panes.length; i++){
		// 	const pad = this.mode === 'horizontal' ? 'paddingLeft' : 'paddingTop'
		// 	this.panes[i].style[pad] = '10px'
		// }
		this.computeOwnConstraints()
		this.computePctSizes()
		this.applyPaneSizes()
		
	}

	computeOwnConstraints(){
		const rect = this.getBoundingClientRect()
		const thisStyle: any = window.getComputedStyle(this)
		const totalWidth = rect.width
		const totalHeight = rect.height
		let minWidth = 0
		let minHeight = 0
		let ownMinWidth = 0
		let ownMinHeight = 0
		if (thisStyle['min-width']){
			if (thisStyle['min-width'].endsWith('px')) ownMinWidth = parseFloat(thisStyle['min-width'])
			if (thisStyle['min-width'].endsWith('%')) ownMinWidth = (parseFloat(thisStyle['min-width']) / totalWidth) * 100
		}
		if (thisStyle['min-height']){
			if (thisStyle['min-height'].endsWith('px')) ownMinHeight = parseFloat(thisStyle['min-height'])
			if (thisStyle['min-height'].endsWith('%')) ownMinHeight = (parseFloat(thisStyle['min-height']) / totalHeight) * 100
		}
		this.panes.forEach(pane => {
			const paneStyle: any = window.getComputedStyle(pane)
			if (paneStyle['min-width']){
				if (paneStyle['min-width'].endsWith('px')) minWidth += parseFloat(paneStyle['min-width'])
				else if (paneStyle['min-width'].endsWith('%')) minWidth += (parseFloat(paneStyle['min-width']) / totalWidth) * 100
			}
			if (paneStyle['min-height']){
				if (paneStyle['min-height'].endsWith('px')) minHeight += parseFloat(paneStyle['min-height'])
				else if (paneStyle['min-height'].endsWith('%')) minHeight += (parseFloat(paneStyle['min-height']) / totalHeight) * 100
			}

		})
		
		this.style.minWidth = Math.max(minWidth, ownMinWidth) + 'px'
		this.style.minHeight = Math.max(minHeight, ownMinHeight) + 'px'
		
	}

	applyPaneSizes(){
		const dim = this.mode === 'horizontal' ? 'width' : 'height'
		this.pctSizes.forEach((s, index) => {
			const child = this.children[index] as HTMLElement
			// child.style[dim] = `calc(${s} - 8px)`
			child.style[dim] = s
		})
	}

	computePctSizes(){
		const dim = this.mode === 'horizontal' ? 'width' : 'height'
		const pctSizes = this.panes.map(pane => {
			if (pane.style && pane.style[dim]) {
				if (pane.style[dim].endsWith('%')) return pane.style[dim]
				if (pane.style[dim].endsWith('px')) {
					const totalSize = this.getBoundingClientRect()[dim]
					return (parseFloat(pane.style[dim]) / totalSize) * 100 + '%'
				}
			}
			return '*'
		})
		const determinedSizes = pctSizes.filter(s => s !== '*')
		const totalDeterminedSizePct = determinedSizes.reduce((prev, current) => {
			prev += parseFloat(current)
			return prev
		}, 0)
		const numberOfWildcards = pctSizes.filter(s => s === '*').length
		const wildcardSize = (100 - totalDeterminedSizePct) / numberOfWildcards
		this.pctSizes = pctSizes.map(s => {
			if (s === '*') return wildcardSize + '%'
			return s
		})
		// console.log('this.pctSizes', this.pctSizes)
	}

	caclulateMinSizePct(pane: any, dim: string, totalSize: number){
		const paneStyle: any = window.getComputedStyle(pane)
		const paneMinSize = paneStyle['min-' + dim]
		let paneMinSizePct = 0
		if (paneMinSize.endsWith('px')){
			paneMinSizePct = (parseFloat(paneMinSize) / totalSize) * 100
		}
		else if (paneMinSize.endsWith('%')){
			paneMinSizePct = parseFloat(paneMinSize)
		}
		return paneMinSizePct
	}

	caclulateMaxSizePct(pane: any, dim: string, totalSize: number){
		const paneStyle: any = window.getComputedStyle(pane)
		const paneMaxSize = paneStyle['max-' + dim]
		let paneMaxSizePct = 100
		if (paneMaxSize.endsWith('px')){
			paneMaxSizePct = (parseFloat(paneMaxSize) / totalSize) * 100
		}
		else if (paneMaxSize.endsWith('%')){
			paneMaxSizePct = parseFloat(paneMaxSize)
		}
		return paneMaxSizePct
	}

	getPaneSize(pane: any, dim: string){
		const rect = pane.getBoundingClientRect()
		return rect[dim]
	}

	@bound
	splitterDragStart(e: DragEvent, pane: any, index: number){
		console.log('dragstart')
		this.style.userSelect = 'none'
		this.cancelDragImage(e)
		
		this.startPosPct = parseFloat(this.pctSizes[index])
		this.startPos = this.mode === 'horizontal' ? e.clientX : e.clientY
		this.startSizes = [...this.pctSizes]

		const dim = this.mode === 'horizontal' ? 'width' :'height'
		const prevPane = this.panes[index]
		const nextPane = this.panes[index + 1]
		const prevPaneSize = this.getPaneSize(prevPane, dim)
		const nextPaneSize = this.getPaneSize(nextPane, dim)
		const totalSize = this.getBoundingClientRect()[dim]
		this.splitSize = prevPaneSize + nextPaneSize
		
		const prevPaneMinSizePct = this.caclulateMinSizePct(prevPane, dim, totalSize)
		this.minDeltaPct = prevPaneMinSizePct - this.startPosPct
		
		const prevPaneMaxSizePct = this.caclulateMaxSizePct(prevPane, dim, totalSize)
		this.maxDeltaPct = prevPaneMaxSizePct - parseFloat(this.startSizes[index])
		
		const nextPaneMinSizePct = this.caclulateMinSizePct(nextPane, dim, totalSize)
		this.maxDeltaPct = Math.min(this.maxDeltaPct, parseFloat(this.startSizes[index+1]) - nextPaneMinSizePct )
		
		const nextPaneMaxSizePct = this.caclulateMaxSizePct(nextPane, dim, totalSize)
		this.minDeltaPct = Math.max(this.minDeltaPct, parseFloat(this.startSizes[index+1]) - nextPaneMaxSizePct)
		
	}

	dragSplitter(e: DragEvent, pane: any, index: number){
		const mouse = this.mode === 'horizontal' ? e.clientX : e.clientY
		if (!mouse) return
		const pixelOffset = this.mode === 'horizontal' ? e.clientX - this.startPos : e.clientY - this.startPos
		const dim = this.mode === 'horizontal' ? 'width' :'height'
		const ratio = this.splitSize / this.getBoundingClientRect()[dim]
		
		let pctDelta = (pixelOffset / this.splitSize) * 100 * ratio
		pctDelta = Math.max(pctDelta, this.minDeltaPct)
		pctDelta = Math.min(pctDelta, this.maxDeltaPct)

		this.pctSizes[index] = parseFloat(this.startSizes[index]) + pctDelta + '%'
		this.pctSizes[index + 1] = (parseFloat(this.startSizes[index]) + parseFloat(this.startSizes[index+1])) - parseFloat(this.pctSizes[index]) + '%'
		this.applyPaneSizes()
		this.setSplitterPosition(index)

	}

	@bound
	splitterDragEnd(): void {
		this.style.userSelect = 'auto'
	}

	cancelDragImage(e: DragEvent): void {
		const img = document.createElement('img')
		img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
		e.dataTransfer.setDragImage(img, 0, 0)
	}

	setSplitterPosition(index: number): void {
		const fullRect = this.getBoundingClientRect()
		const rect = this.panes[index].getBoundingClientRect()
		const dim = this.mode === 'horizontal' ? 'width' : 'height'
		const dir = this.mode === 'horizontal' ? 'left' : 'top'
		const pos = (rect[dir] + rect[dim]) - fullRect[dir]
		const posPct = (pos) / fullRect[dim] * 100 + '%'
		this.splitters[index].style[dir] = posPct
	}

	public renderSplitter(pane: any, index: number): TemplateResult {
		if (index === this.panes.length - 1) return
		return html `
			<div class="splitter" draggable="true"
				@dragend="${this.splitterDragEnd}"
				@dragstart="${(e: DragEvent) => this.splitterDragStart(e, pane, index)}"
				@drag="${(e: DragEvent) => this.dragSplitter(e, pane, index)}">
				<div class="bar">
					<app-icon icon="${this.mode === 'horizontal' ? 'drag-vertical': 'drag-horizontal'}"></app-icon>
				</div>
			</div>
		`
	}

	public render(): TemplateResult {
		return html `
			<style>
			:host {
				display: flex;
				height: 100%;
				width: 100%;
				position: relative;
				user-select: auto;
				overflow: auto;
			}
			:host * {
				box-sizing: border-box;
			}
			:host([mode='vertical']){
				flex-direction: column;
			}
			.splitter {
				width: 8px;
				height: 100%;
				left: 0;
				position: absolute;
				cursor: ew-resize;
			}
			.bar {
				width: 8px;
				height: 100%;
				margin: auto;
				background: #222;
				position: relative;
			}
			:host([mode='vertical']) .splitter {
				width: 100%;
				height: 8px;
				cursor: ns-resize;
				left: 0;
			}
			:host([mode='vertical']) .bar {
				width: 100%;
				height: 8px;
				/* margin-top:  6px; */
			}
			app-icon {
				position: absolute;
				top: 50%;
				left: -8px;
				margin:  -12px 0 0 0;
				color: #444;
				
			}
			:host([mode='vertical']) app-icon {
				position: absolute;
				top: -8px;
				left: 50%;
				margin:  0 0 0 -12px;
			}
			:host ::slotted(*){
				overflow: auto;
			}
			:host([mode='horizontal']) ::slotted(:not(:first-child)){
				padding-left: 8px;
			}
			:host([mode='vertical']) ::slotted(:not(:first-child)){
				padding-top: 8px;
			}
			</style>

			<slot></slot>
			${this.panes.map((pane, index) => this.renderSplitter(pane, index))}
			
			
		`
	}
}