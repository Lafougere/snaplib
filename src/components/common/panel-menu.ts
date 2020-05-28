import { LitElement, html, customElement, TemplateResult } from 'lit-element'

@customElement('panel-menu')
export class PanelMenu extends LitElement {

	public render(): TemplateResult {
		return html `
            <style>
            :host {
                display: flex;
                flex-direction: column;
                position: relative;
                height: 100%;
                overflow: auto;
            }
            slot {
                display:flex;
                flex-direction: column;
                height: 100%;
            }
            ::slotted(*){
                flex: 0;
                transition: all 0.2s ease-in-out;
            }
            ::slotted(.active){
                flex: 1;
            }
            </style>
            
            <slot></slot>
        `
	}
}