import { LitElement, html, property, TemplateResult, customElement } from 'lit-element'
import './app-icon'

@customElement('check-box')
export class CheckBox extends LitElement {

	@property({type: Boolean})
	public checked: boolean = false
	
	@property({type: Boolean})
	public partial: boolean = false

	@property({type: String})
	public label: string = ''

	constructor(){
		super()
		this.addEventListener('click', () => {
			if (this.partial){
				this.checked = false
			}
			else {
				this.checked = !this.checked
			}
		})
	}

	public render(): TemplateResult {
		return html `
			<style>
			:host {
				display: flex;
				position: relative;
				margin: 4px;
				/* width: 16px; */
				height: 24px;
				align-items: center;
				cursor: pointer;
				padding: 2px 4px;
			}
			:host * {
				box-sizing: border-box;
			}
			app-icon {
				position:absolute;
				/* top: 0; */
				left: 4px;
				width: 14px;
				height: 14px;
				opacity: 0;
				color: #444;
				transition: all .1s ease-in;
				border-radius: 3px;
				margin:0;
			}
			[checked] {
				opacity: 1;
				
			}
			#on {
				color: #06558a;
				background: #ccc;
				background-clip: padding-box;
			}
			#partial {
				color: #06558a;
				background: none;
				width: 18px;
				height: 18px;
				position: absolute;
				top:-2px;
				left:-2px;
			}
			.wrapper {
				position: absolute;
				width: 14px;
				height: 14px;
				max-width: 14px;
				max-height: 14px;
				overflow: hidden;
				border-radius: 3px;
				display: none;
			}
			#off {
				position:absolute;
				/* top: 0; */
				left: 4px;
				width: 14px;
				height: 14px;
				border: 1px solid #444;
				border-radius: 3px;
				margin:0;
			}
			label{
				margin-left: 20px;
				font-size: 13px;
			}
			:host([partial]) #off {
				display: none;
			}
			:host([partial]) .wrapper {
				display: block;
			}
			</style>
			
			<div id=off></div>
			<app-icon id="on" ?checked="${this.checked}" icon="checkbox-on"></app-icon>
			<div class="wrapper">
				<app-icon id="partial" ?checked="${this.partial}" icon="checkbox-partial"></app-icon>
			</div>
			<label>${this.label}</label>
		`
	}
}