import bind from "bind-decorator"

export class LogSystem implements Observer<Log>
{
	private genericLUT: Record<LogLevel, ( message: string ) => void>
	
	constructor()
	{
		this.genericLUT = {
			error: message => this.error( message ),
			warn: message => this.warn( message ),
			info: message => this.info( message )
		}
	}

	// TODO: handle errors in dev / prod modes

	@bind
	private error( message: string )
	{
		console.error( message )
	}

	@bind
	private warn( message: string )
	{
		console.warn( message )
	}

	@bind
	private info( message: string )
	{
		console.info( message )
	}

	public next( data: Log ): void
	{
		this.genericLUT[ data.level ]( data.message )
	}
}