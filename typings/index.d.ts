interface Observer<T>
{
	next?: (data: T) => void
	completed?: () => void
}

/* LOGGING */

interface LogObservable
{
	readonly logObservable: {
		subscribe(logObserver: Observer<Log>): void
	}
}

type LogLevel = `info` | `warn` | `error`

interface Log
{
	level: LogLevel
	message: string
}



/* APP VIEW */

interface AppViewObservable
{
	readonly appViewObservable: {
		subscribe(appViewObserver: Observer<View>): void
	}
}

type AppView = `home`


/* STRING */

interface StringObservable
{
	readonly stringObservable: {
		subscribe(stringObserver: Observer<string>): void
	}
}


/* MODE */


interface ModeObservable
{
	readonly modeObservable: {
		subscribe(modeObserver: Observer<Mode>): void
	}
}

interface Mode
{
	name: string
	mode: string
}


/* EMIT */

interface EmitObservable
{
	readonly emitObservable: {
		subscribe(emitObserver: Observer<void>): void
	}
}


/* INPUT STATE */

interface InputObservable
{
	readonly inputObservable: {
		subscribe(inputObserver: Observer<Input>): void
	}
}

interface Input
{
	index: number
	value: number
}


/* CANVAS */

interface CanvasObservable
{
	readonly canvasObservable: {
		subscribe(canvasObserver: Observer<CanvasData>): void
	}
}

interface CanvasData
{
	canvas: HTMLCanvasElement
	index: number
}


/* EventExtended */

interface EventExtended extends GlobalEventHandlersEventMap
{
	//
}

interface Window
{
	webkitAudioContext: AudioContext
}


type DrawFn = (context: CanvasRenderingContext2D, width: number, height: number) => void
