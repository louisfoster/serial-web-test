export class SubscriberHandler<T>
{
	private subscriber?: Observer<T>

	public next( data: T )
	{
		this.subscriber?.next?.( data )
	}

	public completed()
	{
		this.subscriber?.completed?.()
	}

	public subscribe( observer: Observer<T> )
	{
		this.subscriber = observer
	}
}