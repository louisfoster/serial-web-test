module.exports = {
	"mount": {
		"public": "/",
		"src": "/_dist_",
		"test": {
			url: "/",
			static: true
		},
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
	"devOptions": {
		"port": 17171,
		"hmr": true
	}
}