import { LitElement, html, property, customElement, TemplateResult } from 'lit-element'

@customElement('infinite-scroll')
export class InfiniteScroll extends LitElement {
   
	@property({ type: Array })
	public collection: any[] = ['']



	public render(): TemplateResult {
		return html `
			<style>
				:host {
                    display:inline-block;
                    
                }
			</style>
			is
            
		`
	}
}
