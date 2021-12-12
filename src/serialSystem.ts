import bind from "bind-decorator"
import { LogHandler, LogLevel } from "./logHandler"
import { SubscriberHandler } from "./subscriberHandler"

export class SerialSystem implements InputObservable, LogObservable, EmitObservable
{
	private port?: SerialPort

	private curr: number[]

	private debounce: number[]

	private log: LogHandler

	public inputObservable: SubscriberHandler<Input>

	public logObservable: SubscriberHandler<Log>

	public emitObservable: SubscriberHandler<void>

	constructor()
	{
		this.curr = []

		this.debounce = []

		this.inputObservable = new SubscriberHandler()

		this.emitObservable = new SubscriberHandler()

		this.log = new LogHandler()

		this.logObservable = this.log.logObservable
	}

	@bind
	public setupSerial()
	{
		// Permissions are required to access serial port
		navigator.serial.requestPort()
			.then( ( port: SerialPort ) => 
			{
				// Connect to `port` or add it to the list of available ports.
				this.port = port

				// Emit to intialise audio / UI
				this.emitObservable.next()

				return this.readPort()
			} )
			.catch( ( e ) => 
			{
				// The user didn't select a port.
				this.log.log( LogLevel.warn, e )
			} )
	}

	private async readPort()
	{
		if ( !this.port )
		{
			this.log.log( LogLevel.warn, `No port available` )

			return
		}

		// Pico has baud rate of 115200
		await this.port.open( { baudRate: 115200 } )

		this.log.log( LogLevel.info, `Serial connected` )

		if ( this.port.readable ) 
		{
			const reader = this.port.readable.getReader()

			let run = true

			try 
			{
				while ( run ) 
				{
					// Exit if serial reading returns false (done)
					if ( !this.handleSerial( await reader.read() ) )
					{
						run = false

						break
					}
				}
			}
			catch ( error ) 
			{
				this.log.log( LogLevel.error, ( error as Error ).message )
			}
			finally 
			{
				this.log.log( LogLevel.warn, `Serial exiting` )

				reader.releaseLock()

				this.emitObservable.completed()
			}
		}
	}

	private handleSerial( { value, done }: ReadableStreamDefaultReadResult<Uint8Array> )
	{
		if ( done )
		{
			return false
		}

		const messageLength = 5

		if ( value && value[ 0 ] === 0xc0 && value.length >= messageLength )
		{
			const bytesPerInput = 2
	
			const noiseThreshold = 100

			for ( let i = 1; i < messageLength; i += bytesPerInput )
			{
				// The index is taken by taking the previous
				// index (due to the 1 byte initial value)
				// and dividing by the number of inputs
				const inputNum = ( i - 1 ) / 2

				// Get the two bytes for this value
				// The byte order is "big" endian, so
				// the first byte is shifted (<<) by 8 '0's
				// Then the two values are OR'd (|) together
				// Which places are 1 binary value whereever
				// Either value has a 1, or 0 when both have 0.
				const val = value[ i + 1 ] | value[ i ] << 8


				/**
				 * Set values if not yet instantiated
				 */

				if ( this.debounce[ inputNum ] === undefined ) this.debounce[ inputNum ] = 0

				if ( this.curr[ inputNum ] === undefined ) this.curr[ inputNum ] = 0


				/**
				 * Before emitting the reading, ensure that the change in
				 * value is lower than a general noise threshold to reduce
				 * unnecessary frequency changes that might cause "wobbling"
				 * in the audio
				 */
				if ( Math.abs( val - this.curr[ inputNum ] ) > noiseThreshold )
				{
					this.curr[ inputNum ] = val

					this.inputObservable.next( {
						index: inputNum,
						value: this.curr[ inputNum ] / 65535
					} )

					this.debounce[ inputNum ] = 0
				}
				/**
				 * Deboucer is used to continually emit values even
				 * when there's no change. This is moreso to ensure
				 * the UI updates if the initial readings are available
				 * before the UI has initialised.
				 */
				else if ( this.debounce[ inputNum ] > 10 )
				{
					this.inputObservable.next( {
						index: inputNum,
						value: this.curr[ inputNum ] / 65535
					} )

					this.debounce[ inputNum ] = 0
				}
				else
				{
					this.debounce[ inputNum ] = this.debounce[ inputNum ] + 1
				}
			}
		}
		else
		{
			this.log.log( LogLevel.warn, `Received ${value}` )
		}

		return true
	}
}