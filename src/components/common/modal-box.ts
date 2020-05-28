import { LitElement, html, property, customElement, TemplateResult } from 'lit-element'
import { bound } from '../../lib/decorators'
import './app-icon'
import { scrollbarStyles } from '../../styles'

@customElement('modal-box')
export class ModalBox extends LitElement {

	@property({type: String})
	public title: string = ''

	public confirmed: Promise<any>
	private $: any = {}
	private confirmedCallback: any

	public firstUpdated(){
		this.$ = {
			box: this.shadowRoot.querySelector('#box'),
			dismissButtons: Array.from(this.querySelectorAll('[dialog-dismiss]')) as HTMLElement[],
			confirmButtons: Array.from(this.querySelectorAll('[dialog-confirm]')) as HTMLElement[]
		}
		
		this.$.confirmButtons.forEach((b: HTMLElement) => b.addEventListener('click', this.confirm))
		this.$.dismissButtons.forEach((b: HTMLElement) => b.addEventListener('click', this.close))
	}

	@bound
	private confirm(e: Event){
		e.stopPropagation()
		this.confirmedCallback(this)
	}

	@bound
	public close(e?: Event): this {
		e && e.stopPropagation()
		this.$.box.classList.add('shrink')
		this.$.box.classList.add('animated')
		
		setTimeout(() => {
			this.removeAttribute('open')
			this.$.box.classList.remove('shrink')
			this.$.box.classList.add('grow')
		}, 200)
        
		return this
	}

	public open(): this {
		this.setAttribute('open', '')
		setTimeout(() => {
			this.$.box.classList.add('animated')
		})
		setTimeout(() => {
			this.$.box.classList.remove('grow')
			this.$.box.classList.remove('animated')
		}, 200)
		
		this.confirmed = new Promise((resolve) => {
			this.confirmedCallback = resolve
		})

		return this
	}

	public render(): TemplateResult {
		return html `
			${scrollbarStyles}
			<style>
			@-webkit-keyframes grow {
				from {
					-webkit-transform: scale(0);
					transform: scale(0);
					opacity: 0;
					visibility: visible;
				}

				to {
					-webkit-transform: scale(1);
					transform: scale(1);
					opacity: 1;
				}
			}

			@keyframes grow {
				from {
					-webkit-transform: scale(0);
					transform: scale(0);
					opacity: 0;
					visibility: visible;
				}

				to {
					-webkit-transform: scale(1);
					transform: scale(1);
					opacity: 1;
				}
			}

			.grow {
				-webkit-animation-name: grow;
				animation-name: grow;
			}
			.shrink {
				-webkit-animation-name: grow;
				animation-name: grow;
				-webkit-animation-direction: reverse;
				animation-direction: reverse;
				-webkit-animation-duration: .1s;
				animation-duration: .1s;
			}
			.animated {
				-webkit-animation-duration: .2s;
				animation-duration: .2s;
				-webkit-animation-fill-mode: both;
				animation-fill-mode: both;
				animation-timing-function: ease-in-out;
			}
			:host {
				position: absolute;
				top: 0;
				left: 0;
				height: 100%;
				width: 100%;
				background: rgba(0, 0, 0, 0.8);
				z-index: 1000;
				display: none;
				justify-content: center;
				align-items: center;
			}
			:host([open]){
				display: flex;
            }
            ::slotted(button){
                margin-left: 8px;
            }
			
			
			#box {
                /* background:#14141f; */
                background:#222;
				
				width:400px;
				/* padding: 12px 8px; */
				border-radius: 5px;
				box-shadow: 0px 10px 50px -5px #111;
				border: 2px solid #054d7e;
				max-height: 80%;
				max-width: 80%;
				overflow: auto;
				display: flex;
				flex-direction: column;
			}
			h3 {
				/* font-weight: 400;
				font-size: 1.1em; */
                margin: 0;
                background: #09091b;
                border-bottom: 2px solid #034b7c;
                padding: 6px 12px;
                /* text-align: center; */
			}
			#body {
                padding: 5px;
				text-align: center;
				overflow: auto;
				flex:1;
			}
			#buttons {
                /* text-align: right; */
				display: flex;
				justify-content: flex-end;
				align-items: center;
                padding: 12px 8px;
				/* margin-right: -2px;
				margin-bottom: -10px; */
			}
			</style>

			<div id="box" class="grow animated">
				<header><h3>${this.title}</h3></header>
				<div id="body">
					<slot></slot>
				</div>
				<div id="buttons">
					<slot name="buttons"></slot>
				</div>
			</div>
		`
	}
}