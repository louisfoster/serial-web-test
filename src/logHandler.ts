import { SubscriberHandler } from './subscriberHandler'

export enum LogLevel
{
	error = `error`,
	warn = `warn`,
	info = `info`
}

export class LogHandler implements LogObservable
{
	public readonly logObservable: SubscriberHandler<Log>

	constructor()
	{
		this.logObservable = new SubscriberHandler()
	}

	public log( level: LogLevel, message: string )
	{
		this.logObservable.next( { level, message } )
	}
}