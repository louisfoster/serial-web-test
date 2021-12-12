export function el<T extends HTMLElement | SVGElement>( selector: string, root?: HTMLElement | Document | ShadowRoot | DocumentFragment ): T
{
	const el = ( root ?? document ).querySelector<T>( selector )

	if ( !el ) throw Error( `No element ${selector}` )

	return el
}

export function using<T, V>( results: T | undefined | null )
{
	return {
		do: ( fn: ( results: T ) => V ) =>
		{
			if ( results !== undefined && results !== null )
				return fn( results )
		}
	}
}

export function listen<T extends HTMLElement>( element: T )
{
	return {
		on: <K extends keyof EventExtended>( type: K ) =>
			( {
				do: ( listener: ( ( event: EventExtended[K] ) => void ) ) =>
				{
					element.addEventListener(
						type as keyof GlobalEventHandlersEventMap,
						listener as ( event: GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap] ) => void )

					return () => element.removeEventListener(
						type as keyof GlobalEventHandlersEventMap,
						listener as ( event: GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap] ) => void  )
				}
			} )
	}
}