import { ComponentBase } from "./componentBase"
import { el, listen, using } from "./helpers"
import { LogHandler, LogLevel } from "./logHandler"
import { SubscriberHandler } from "./subscriberHandler"

export class View extends ComponentBase implements LogObservable, EmitObservable, CanvasObservable, Observer<Input>
{
	private log: LogHandler

	private init?: HTMLButtonElement

	private oscEl: HTMLParagraphElement[]

	private mainOsc?: HTMLDivElement

	private subOsc?: HTMLDivElement

	public logObservable: SubscriberHandler<Log>

	public emitObservable: SubscriberHandler<void>

	public canvasObservable: SubscriberHandler<CanvasData>

	constructor() 
	{
		super( `main-view` )

		this.oscEl = []

		this.log = new LogHandler()

		this.logObservable = this.log.logObservable

		this.emitObservable = new SubscriberHandler()

		this.canvasObservable = new SubscriberHandler()

		using( this.shadowRoot )
			.do( root => this.setElements( root ) )
	}

	private setElements( root: ShadowRoot )
	{
		this.mainOsc = el( `#main-osc`, root )

		this.subOsc = el( `#osc`, root )

		this.init = el( `button`, root )

		if ( !navigator.serial )
		{
			this.init.remove()

			this.mainOsc.innerText = `(;¬_¬)  --  looks like you need a different browser to use this application.`
		}

		/**
		 * Emit click event on "connect" button
		 */
		listen( this.init )
			.on( `click` )
			.do( () =>
			{
				this.log.log( LogLevel.info, `Requesting` )

				this.emitObservable.next()
			} )
	}

	private canvas()
	{  
		const canvas = document.createElement( `canvas` )

		return canvas
	}

	public next( { index, value }: Input )
	{
		/**
		 * Generates the output oscilloscope
		 */
		if ( this.oscEl.length === 0 )
		{
			const c = this.canvas()

			this.mainOsc?.appendChild( c )

			this.canvasObservable.next( { canvas: c, index: -1 } )
		}
    
		/**
		 * Creates an input's oscilloscope and frequency
		 * value and renders it in the UI
		 */
		if ( !this.oscEl[ index ] )
		{
			const p = document.createElement( `p` )

			this.oscEl[ index ] = p

			const c = this.canvas()

			const d = document.createElement( `div` )

			d.className = `scope-block`

			d.append( p, c )

			this.subOsc?.append( d )

			this.canvasObservable.next( { canvas: c, index } )
		}

		// Update the frequency reading
		// NOTE: Oscilloscope updates occur via the oscilloscope class, not here.
		this.oscEl[ index ].textContent = `Frequency [${index}]: ${~~( value * 990 + 10 )}`
	}
	
	onDefined()
	{
		this.log.log( LogLevel.info, `Loaded main view` )
	}
}