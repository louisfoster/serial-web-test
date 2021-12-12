import bind from "bind-decorator"
import { el } from "./helpers"

export class ComponentBase extends HTMLElement
{
	private stylesheets: string[]

	private isDefined: boolean

	constructor( protected tag: string ) 
	{
		super()

		this.isDefined = false

		this.stylesheets = []

		const template = el<HTMLTemplateElement>( `#${tag}` )

		const templateContent = template.content

		this.attachShadow( { mode: `open` } ).appendChild(
			templateContent.cloneNode( true )
		)

		this.registerStylesheet( `main.css` )

		customElements.whenDefined( this.tag ).then( () => 
		{
			this.isDefined = true

			for ( const stylesheet of this.stylesheets )
			{
				this.setStylesheet( stylesheet )
			}

			this.onDefined()
		} ) 
	}

	@bind
	private setStylesheet( path: string )
	{
		const linkElem = document.createElement( `link` )

		linkElem.setAttribute( `rel`, `stylesheet` )

		linkElem.setAttribute( `href`, path )

		this.shadowRoot?.appendChild( linkElem )
	}

	@bind
	protected registerStylesheet( path: string )
	{
		if ( !this.isDefined ) this.stylesheets.push( path )
		else this.setStylesheet( path )
	}

	protected onDefined()
	{
		// set in inheriting class
	}
}