import { LitElement, html, property, TemplateResult, customElement } from 'lit-element'
import { bound } from '../../lib/decorators'
import './app-icon'
import { scrollbarStyles } from '../../styles'

@customElement('panel-box')
export class PanelBox extends LitElement {

	@property({type: String})
	public title: string = ''

	@bound
	activate(){
		this.classList.toggle('active')
	}

	render(): TemplateResult {
		return html `
			${scrollbarStyles}
			<style>
			:host {
				display: flex;
				flex-direction: column;
				background: #232330;
				width: 100%;
				min-height: 25px;
			}
			h3 {
				font-weight: 700;
				font-size: 11px;
				text-transform: uppercase;
				margin: 0;
				color: #0969b8;
			}
			header {
				background: #14141f;
				padding: 4px 8px;
				border-bottom: 1px solid #0f0f18;
				display: flex;
				align-items: center;
			}
			app-icon {
				margin: auto 8px auto 0;
				width: 16px;
				height: 16px;
			}
			:host(.active) app-icon {
				transform: rotate(45deg);
			}
			.body {
				overflow: auto;
				flex:1;
			}
			
			</style>
			<header @click="${this.activate}">
				<app-icon class="mini" icon="caret-right"></app-icon>
				<h3>${this.title}</h3>
			</header>
			<div class="body">
				<slot></slot>
			</div>
			
		`
	}
}