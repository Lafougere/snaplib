import { LitElement, html, property, customElement, TemplateResult } from 'lit-element'
import { IconSet } from './icon-set'

@customElement('app-icon')
export class AppIcon extends LitElement {
   
	@property({type: String})
	public icon: string = ''

	@property({type: String})
	public href: string = ''

	private iconset: IconSet = document.querySelector('icon-set')

	public getIcon(name: string): SVGElement {
		return this.iconset && this.iconset.getIconPath(name)
	}

	public updated(): void {
		const svg = this.shadowRoot.querySelector('svg')
		const iconG = this.getIcon(this.icon)
		svg.innerHTML = ''
		Array.from(iconG.querySelectorAll('path')).forEach((p: any) => {
			svg.appendChild(p.cloneNode(true))
		})
		
	}

	public render(): TemplateResult {
		// this.iconset = this.iconset || document.querySelector('icon-set')
		const iconG = this.getIcon(this.icon)
		if (!iconG) throw 'Missing icon ' + this.icon 
		const vb = iconG.getAttribute('viewBox') || '0 0 24 24'
		return html `
			<style>
				:host {display:inline-block; width: 24px; height: 24px; margin: 2px; color:inherit;}
				svg {width:100%; height:100%;display: block;color:inherit;}
				path {fill:currentColor;}
			</style>
			<svg viewBox="${vb}"></svg>
		`
	}
}
