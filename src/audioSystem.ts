import bind from "bind-decorator"
import { Oscilloscope } from "./oscilloscope"

export class AudioSystem implements Observer<Input>
{
	private audioContext?: AudioContext

	private osc: OscillatorNode[]

	private gain: GainNode[]

	private scopes: {index: number; scope: Oscilloscope}[]

	constructor() 
	{
		this.osc = []

		this.gain = []

		this.scopes = []
	}

	@bind
	public setupAudio()
	{
		// create web audio api context, requires a user input event
		this.audioContext = new ( window.AudioContext || window.webkitAudioContext )()

		this.gain.push( this.audioContext.createGain() )

		this.gain[ 0 ].connect( this.audioContext.destination )
	}

	private createOsc( ctx: AudioContext, type: OscillatorType = `sine`, freq = 50 )
	{
		const osc = ctx.createOscillator()

		osc.type = type

		osc.frequency.setValueAtTime( freq, ctx.currentTime )

		osc.connect( this.gain[ 0 ] )

		osc.start()

		return osc
	}

	@bind
	public next( { index, value }: {value: number, index: number} )
	{
		if ( !this.audioContext || !this.osc[ index ] ) return

		// Frequency range is: 10 - 1000 Hz
		const freq = ~~( value * 990 + 10 )

		// If change is only a couple of Hz, don't change (ADC noise mitigation)
		if ( Math.abs( freq - this.osc[ index ].frequency.value ) < 3 ) return

		const time = this.audioContext.currentTime + 0.0001

		this.osc[ index ].frequency.linearRampToValueAtTime( freq, time )
	}

	@bind
	public stop()
	{
		this.audioContext?.suspend()
			.then( () => this.audioContext?.close() )
	}

	public setOscilloscope( { canvas, index }: CanvasData )
	{
		if ( !this.audioContext ) return

		if ( this.scopes.find( item => item.index === index ) ) return

		// Create an oscillator if this isn't the output oscilloscope
		if ( index > -1 )
		{
			this.osc[ index ] = this.createOsc( this.audioContext, index ? `sawtooth` : `square` )

			// Set gain proportial to number of source oscillators to prevent clipping
			const gain = this.osc.length > 0 ? 1 / this.osc.length : 1
	
			this.gain[ 0 ].gain.setValueAtTime( gain, this.audioContext.currentTime )
		}	

		// Index of -1 corresponds to the output oscilloscope
		const source = index === -1
			? this.gain[ 0 ]
			: this.osc[ index ]

		const scope = new Oscilloscope( this.audioContext, source, canvas, undefined, 256 )

		scope.start()

		this.scopes.push( { index, scope } )
	}
}