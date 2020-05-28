import { LitElement, html, property, customElement, TemplateResult } from 'lit-element'
import { bound } from '../../lib/decorators'
import { scrollbarStyles } from '../../styles/theme'

@customElement('dropdown-menu')
export class DropdownMenu extends LitElement {

   
	@property({type: String})
	public label: string = ''

	@property({type: String, reflect: true})
	public value: string = ''

	// @property({type: String, reflect: true})
	// public set value(v){
	// 	// console.log('val', v)
	// 	this._value = v
	// 	this.onValueChanged()
	// }

	// public get value(){
	// 	return this._value
	// }

	@property({type: String})
	public type: string = 'text'

	@property({type: String})
	public name: string = ''
	
	@property({type: Object})
	public slot: any = {}

	@property({type: String})
	public placeholder: string = ''

	@property({type: String})
	public error: string = ''
	
	@property({type: String})
	public autocomplete: string = 'off'

	private _value: string = ''

	constructor(){
		super()
	}

	public firstUpdated(props: any){
		super.firstUpdated(props)
		this.tabIndex = 0
		const input = this.shadowRoot.querySelector('#input') as HTMLUListElement
		const field = this.shadowRoot.querySelector('#field') as HTMLDivElement
		const list = this.shadowRoot.querySelector('#list') as HTMLDivElement
		this.addEventListener('focus', () => input.focus())
		input.addEventListener('focus', () => field.classList.add('focus'))
		input.addEventListener('blur', () => {
			field.classList.remove('focus')
			setTimeout(() => {
				console.log(this.shadowRoot.activeElement)
			})
		})
		this.slot = this.shadowRoot.querySelector('#list slot') as any
		this.slot.addEventListener('slotchange', this.onSlotChanged)
		list.addEventListener('transitionend', () => {
			if (list.classList.contains('open')) list.style.overflow = 'auto'
			else list.style.overflow = 'hidden'
		})
		field.style.width = this.clientWidth + 'px'
		// console.log("v", this.getBoundingClientRect())
	}

	@bound
	onSlotChanged(){
		const lis = Array.from(this.querySelectorAll('li'))

		lis.forEach(li => {
			li.addEventListener('click', (e) => {
				const selected = this.querySelector('.selected')
				console.log('click', e)
				this.setValue(li)
				if (selected) selected.classList.remove('selected')
				li.classList.add('selected')
			})
			if (li.id === this.value){
				this.setValue(li)
				li.classList.add('selected')
			}
		})
	}

	

	setValue(li: HTMLLIElement){
		// console.log('set val', li.innerHTML)
		// const input = this.shadowRoot.querySelector('#input') as HTMLInputElement
		// input.innerHTML = ''
		// input.appendChild(li.cloneNode(true))
		// this.value = li.id
		this.shadowRoot.querySelector('#list').classList.remove('open')
		this.dispatchEvent(new CustomEvent('change', {detail: {value: this.value}, composed: true}))
	}

	@bound
	onInputChanged(e: Event){
		console.log('dispatch', (<HTMLInputElement>e.target).value)
		this.value = (<HTMLInputElement>e.target).value
		this.dispatchEvent(new CustomEvent('change', {detail: {value: this.value}, composed: true}))
	}

	onValueChanged(){
		const input = this.shadowRoot.querySelector('#input') as HTMLInputElement
		if (!input) return
		// const li = this.querySelector('#' + this.value)
		// input.innerHTML = ''
		// input.appendChild(li.cloneNode(true))
	}

	@bound
	toggleOpen(){
		this.shadowRoot.querySelector('#list').classList.toggle('open')
	}

	reset(){
		this.value = ''
	}
	
	render(): TemplateResult {
		
		return html `
			${scrollbarStyles}
			<style>
				:host {
					display:block;
					/* width: 100%; */
					min-width: 60px;
					height: 40px;
					margin: 2px;
					color: #ccc;
					text-align:left;
					box-sizing: border-box;
					outline: 0;
					font-size:0.8em;
					position: relative;
					/* z-index:1000; */
				}
				:host * {
					box-sizing: border-box;
				}
				:host([inline]) {
					display: flex;
					flex-direction: row;
					align-items: center;
					min-width: 120px;
					height: 24px;
				}
				:host ::slotted(app-icon) {
					color: #053a66;
					width: 18px;
					height: 18px;
					margin-right: 8px;
				}
				#input {
					width: 100%;
					border:0;
					height: 100%;
					background: none;
					display: flex;
					flex-direction: row;
					align-items: center;
					border-radius: 4px;
					padding: 0 4px;
					color: #ccc;
					outline: 0;
					list-style: none;
					margin: 0;
					
				}
				li {
					width: 100%;
					display: flex;
					align-items: center;
					height:24px;
				}
				li img {
					margin-right: 8px;
				}
				#field {
					height: 24px;
					border: 1px solid #0969b8;
					border-radius: 4px;
					/* width: 100%; */
					max-width: 100%;
					outline: 0;
					display: flex;
					background: #0b0b16;
					align-items: center;
					padding-left: 4px;
					padding-right: 4px;
					position: relative;
					cursor: pointer;
					position: relative;
					z-index:100;
					
					/* z-index:1; */
				}
				#field.focus,#field.focus #list {
					border-color: #58a8e9;
				}
				#field.focus .append {
					border-left-color: #58a8e9;
				}
				label {
					color: #999;
					font-size: 12px;
					margin-left: -1px;
					margin-right:5px;
				}
				span.error {
					font-size: 0.8em;
					display: block;
					text-align: right;
					color: #ac0f31;
				}
				#list {
					position: absolute;
					left: -1px;
					top: 20px;
					width: calc(100% + 2px);
					background: #0b0b16;
					border: 1px solid #0969b8;
					border-radius: 4px;
					z-index:1000;
					margin:0;
					border-top:0;
					border-top-left-radius: 0;
					border-top-right-radius: 0;
					max-height:0;
					overflow: hidden;
					transition: max-height 0.3s ease-out;
					padding: 3px;
					opacity: 0;
					z-index:10;
				}
				#list.open {
					max-height: 250px;
					opacity: 1;
				}
				.append{
					position:absolute;
					left: calc(100% - 0px);
					/* margin-left:-4px; */
					border-left: 1px solid #0969b8;
					padding: 0;
					height: calc(100% - 2px);
					overflow: hidden;
					border-top-right-radius: 4px;
					border-bottom-right-radius: 4px;
					border-top-left-radius: 0;
					border-bottom-left-radius: 0;
					z-index:0;
					cursor: pointer;
				}
				app-icon {
					color: #0969b8;
					margin: 0;
				}
				:host ::slotted(.button){
					position: relative;
					/* top:-2px; */
					/* left:100%; */
					margin: 0 0 0 4px !important;
					left: -4px;
					padding-top: 4px !important;
					/* padding-left: 12px !important; */
					border-left:0 !important;
					border-top-left-radius: 0 !important;
					border-bottom-left-radius: 0 !important;
					/* border: 0 !important;
					border-radius: 0 !important; */
					width: 100% !important;
					cursor: pointer !important;
					
				}
				:host ::slotted(.button:active){
					top: 0 !important;
				}
			</style>
			
			<label for="input" tabindex="-1">${this.label}</label>
			<div id="field">
				<slot name="prepend"></slot>
				
				<ul id="input" tabindex="-1" @click="${this.toggleOpen}">
					<li>${this.value}</li>
				</ul>
				<app-icon icon="chevron-down" @click="${this.toggleOpen}"></app-icon>
				<div class="append"><slot name="append"></slot></div>
				
				<ul id="list">
					<slot></slot>
				</ul>
			</div>
			<span class="error" ?hidden="${!this.error}">${this.error}</span>
		`
	}
}
