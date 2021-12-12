module.exports = {
	"mount": {
		"public": "/",
		"src": "/_dist_"
	},
	"plugins": [
		[
			"@snowpack/plugin-run-script",
			{
				"cmd": "tsc --project tsconfig.json --noEmit",
				"watch": "$1 --watch"
			}
		]
	],
	"optimize": {
		"bundle": true,
		"minify": true,
		"target": "es2020",
		"sourcemap": "external",
		"splitting": true,
		"treeshake": true
	},
	"buildOptions": {
		"out": "docs"
	}
}