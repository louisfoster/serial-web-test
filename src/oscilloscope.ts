import bind from "bind-decorator"

/**
 * Code adapted from:
 * - https://github.com/theanam/webaudio-oscilloscope
 * - Original author: Anam Ahmed (theanam) https://github.com/theanam
 * 
 * Please visit the above repo for more information regarding
 * the following code.
 */

export class Oscilloscope
{
	private anl: AnalyserNode

	private paused: boolean

	private WIDTH: number

	private HEIGHT: number

	private u8ar: Uint8Array

	private cctx: CanvasRenderingContext2D

	private DEFAULT_FILL: string

	private DEFAULT_STROKE: string
	
	private HLINE_COLOR: string

	constructor (
		private actx: AudioContext,
		private src: AudioNode,
		private cvs: HTMLCanvasElement,
		private dest?: AudioDestinationNode | null,
		private FFT: number = 2048
	)
	{
		this.DEFAULT_FILL = `#111111`

		this.DEFAULT_STROKE = `#11ff11`

		this.HLINE_COLOR = `#555555`

		this.paused = false

		this.anl = this.actx.createAnalyser()
    
		this.anl.fftSize = this.FFT
    
		this.src.connect( this.anl )
    
		if( this.dest ) this.anl.connect( this.dest )

		const { width = 300, height = 150 } = this.cvs
    
		this.WIDTH  = width
    
		this.HEIGHT = height
    
		this.u8ar = new Uint8Array( this.FFT )

		const ctx = this.cvs.getContext( `2d` )

		if ( !ctx ) throw `No rendering context`
    
		this.cctx = ctx
    
		this.initCVS( this.cctx )
	}

	private initCVS( ctx: CanvasRenderingContext2D )
	{
		ctx.fillStyle   = this.DEFAULT_FILL

		ctx.strokeStyle = this.DEFAULT_STROKE
	}

	private primer( ctx: CanvasRenderingContext2D, width: number, height: number )
	{
		ctx.fillRect( 0, 0, width, height )

		ctx.strokeStyle = this.HLINE_COLOR

		ctx.beginPath()

		ctx.moveTo( 0, height / 2 )

		ctx.lineTo( width, height / 2 )

		ctx.stroke()

		ctx.strokeStyle = this.DEFAULT_STROKE
	}

	private drawRawOsc( ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number )
	{
		ctx.beginPath()

		for( let i=0; i < data.length; i++ )
		{
			const x = i * ( width * 1.0 / data.length )

			const v = data[ i ] / 128.0

			const y = v * height / 2

			if( i === 0 ) ctx.moveTo( x, y )
			else ctx.lineTo( x, y )
		}

		ctx.stroke()
	}

	@bind
	public draw()
	{
		if( !this.paused ) requestAnimationFrame( this.draw )

		this.cctx.clearRect( 0, 0, this.WIDTH, this.HEIGHT )

		this.primer( this.cctx, this.WIDTH, this.HEIGHT )

		this.anl.getByteTimeDomainData( this.u8ar )

		this.drawRawOsc( this.cctx, this.u8ar, this.WIDTH, this.HEIGHT )
	}

	@bind
	public start()
	{
		this.paused = false

		this.draw()
	}

	@bind
	public pause()
	{
		this.paused = true
	}

	@bind
	public reset()
	{
		this.paused = true

		requestAnimationFrame( () => 
		{
			this.u8ar = new Uint8Array( this.FFT ).fill( 0 )

			this.cctx.clearRect( 0, 0, this.WIDTH, this.HEIGHT )

			this.primer( this.cctx, this.WIDTH, this.HEIGHT )

			this.drawRawOsc( this.cctx, this.u8ar, this.WIDTH, this.HEIGHT )
		} )
	}
}