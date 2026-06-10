const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["luffy.svg","manifest.json"]),
	mimeTypes: {".svg":"image/svg+xml",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.sP6D84j_.js",app:"_app/immutable/entry/app.BDyuPonA.js",imports:["_app/immutable/entry/start.sP6D84j_.js","_app/immutable/chunks/C5OE3Ra0.js","_app/immutable/chunks/Gm8cJEhR.js","_app/immutable/chunks/D6FbRZh4.js","_app/immutable/entry/app.BDyuPonA.js","_app/immutable/chunks/Gm8cJEhR.js","_app/immutable/chunks/DxI3WT-8.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CRKXSwsF.js')),
			__memo(() => import('./chunks/1-CkEVcCDV.js')),
			__memo(() => import('./chunks/2-D66oJ1RJ.js')),
			__memo(() => import('./chunks/3-D61wLWax.js')),
			__memo(() => import('./chunks/4-RV3jz4GY.js')),
			__memo(() => import('./chunks/5-CC846yJE.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/(app)/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/intro",
				pattern: /^\/intro\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
