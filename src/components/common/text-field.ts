import { LitElement, html, property, TemplateResult, customElement } from 'lit-element'

@customElement('text-field')
export class TextField extends LitElement {

	@property({ type: String })
	public label: string = ''
	
	@property({type: String, reflect: true})
	public value: string = ''

	@property({ type: String })
	public type: 'hidden' | 'text' | 'search' | 'tel' | 'url' | 'email' | 'password' | 'datetime' | 'date' | 'month' | 'week' | 'time' | 'datetime-local' | 'number' | 'range' | 'color' | 'checkbox' | 'radio' | 'file' | 'submit' | 'image' | 'reset' | 'button' = 'text'

	@property({ type: String })
	public model: string = ''

	@property({ type: Number })
	public min: number = -Infinity

	@property({ type: Number })
	public max: number = -Infinity

	@property({ type: Number })
	public step: number = 1

	@property({ type: String })
	public placeholder: string = ''

	@property({ type: String })
	public error: string = ''

	@property({ type: String })
	public errorMessage: string = ''

	@property({ type: String })
	public autocomplete: 'on' | 'off' | 'additional-name' | 'address-level1' | 'address-level2' | 'address-level3' | 'address-level4' | 'address-line1' | 'address-line2' | 'address-line3' | 'bday' | 'bday-year' | 'bday-day' | 'bday-month' | 'billing' | 'cc-additional-name' | 'cc-csc' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-family-name' | 'cc-given-name' | 'cc-name' | 'cc-number' | 'cc-type' | 'country' | 'country-name' | 'current-password' | 'email' | 'family-name' | 'fax' | 'given-name' | 'home' | 'honorific-prefix' | 'honorific-suffix' | 'impp' | 'language' | 'mobile' | 'name' | 'new-password' | 'nickname' | 'organization' | 'organization-title' | 'pager' | 'photo' | 'postal-code' | 'sex' | 'shipping' | 'street-address' | 'tel-area-code' | 'tel' | 'tel-country-code' | 'tel-extension' | 'tel-local' | 'tel-local-prefix' | 'tel-local-suffix' | 'tel-national' | 'transaction-amount' | 'transaction-currency' | 'url' | 'username' | 'work' = 'off'

	public firstUpdated(props: any): void {
		super.firstUpdated(props)
		this.tabIndex = 0
		const input = this.shadowRoot.querySelector('input') as HTMLInputElement
		const field = this.shadowRoot.querySelector('#field') as HTMLDivElement
		this.addEventListener('focus', () => input.focus())
		input.addEventListener('focus', () => field.classList.add('focus'))
		input.addEventListener('blur', () => {
			field.classList.remove('focus')
			this.validate()
		})
	}

	private validate(): void {
		this.error = ''
		if (this.hasAttribute('required') && !this.value.trim().length) {
			this.error = this.getAttribute('required')
			return
		}
	}

	public reset(): void {
		this.value = ''
	}

	public render(): TemplateResult {
		return html`
			<style>
				:host {
					display:block;
					color: #ccc;
					width: 100%;
					position: relative;
					outline: 0;
				}
				:host * {
					box-sizing: border-box;
				}
				:host ::slotted(app-icon) {
					color: #053a66;
					width: 18px;
					height: 18px;
					margin-right: 8px;
				}
				
				input {
					width: 100%;
					border:0;
					height: 100%;
					background: none;
					display: block;
					border-radius: 4px;
					padding-left: 4px;
					color: #ccc;
					outline: 0;
					font-size: 16px;
				}
				#field {
					height: 36px;
					border: 2px solid #0969b8;
					border-radius: 4px;
					outline: 0;
					display: flex;
					background: #0b0b16;
					align-items: center;
					position: relative;
					overflow: hidden;
				}
				:host(.mini) #field {
					height: 24px;
					border: 1px solid #0969b8;
				}
				:host(.mini) {
					height: 24px;
					
				}
				:host(.mini) input {
					font-size: 13px;
				}
				:host(.mini) label {
					font-size: 12px;
				}
				:host #field.focus {
					border-color: #58a8e9;
				}
				
				label {
					color: #999;
					font-size: 0.8em;
					margin-left: -1px;
				}
				span {
					font-size: 0.8em;
					display: block;
					text-align: right;
					color: #ac0f31;
					position: absolute;
					right:0;
				}
				
				app-icon {
					color: #0969b8;
					margin: 0;
				}
				:host ::slotted(button){
					height: 100% !important;
					border-top-left-radius: 0 !important;
					border-bottom-left-radius: 0 !important;
					border: 0 !important;
					outline: 0;
				}
				
			</style>
			<label for="input" tabindex="-1" ?hidden="${!this.label}">${this.label}</label>
			<div id="field">
				<slot name="prepend"></slot>
				<input 
					id="input"
					autocomplete="${this.autocomplete}"
					type="${this.type}"
					placeholder="${this.placeholder}"
					tabindex="0"
					?autofocus="${this.hasAttribute('autofocus')}"
					min="${this.min}"
					max="${this.max}"
					step="${this.step}"
					.value=${this.value}
					@input="${(e: Event) => this.value = (e.target as HTMLInputElement).value}"
					>
				<slot name="append"></slot>
			</div>
			<span ?hidden="${!this.error}">${this.error}</span>
		`
	}
}
