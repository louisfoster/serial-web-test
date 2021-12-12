import { AudioSystem } from "./audioSystem"
import { el } from "./helpers"
import { LogSystem } from "./logSystem"
import { SerialSystem } from "./serialSystem"
import { View } from "./view"

class Main
{
	public static run()
	{
		new Main()
	}

	private logSystem: LogSystem

	private audioSystem: AudioSystem

	private serialSystem: SerialSystem

	private view?: View

	constructor()
	{
		this.logSystem = new LogSystem()

		this.audioSystem = new AudioSystem()

		this.serialSystem = new SerialSystem()

		this.setupUI()
		
		this.setupSerial()
	}

	private setupUI()
	{
		customElements.define( `main-view`, View )

		this.view = el<View>( `main-view` )

		// on "connect" button click
		this.view.emitObservable.subscribe( {
			next: this.serialSystem.setupSerial
		} )

		this.view.canvasObservable.subscribe( {
			next: data => void this.audioSystem.setOscilloscope( data )
		} )

		this.view.logObservable.subscribe( this.logSystem )
	}

	private setupSerial()
	{
		this.serialSystem.emitObservable.subscribe( {
			// only set audio if serial available
			next: () => void this.audioSystem.setupAudio(),
			// stop audio when serial is lost
			completed: this.audioSystem.stop
		} )

		// send input values to audio
		this.serialSystem.inputObservable.subscribe( {
			next: ( input ) =>
			{
				this.audioSystem.next( input )

				this.view?.next( input )
			}
		} )

		this.serialSystem.logObservable.subscribe( this.logSystem )
	}
}

Main.run()