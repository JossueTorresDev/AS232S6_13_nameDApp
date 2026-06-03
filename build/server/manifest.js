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
		client: {start:"_app/immutable/entry/start.Bqr7zWS0.js",app:"_app/immutable/entry/app.6Xd6ROd2.js",imports:["_app/immutable/entry/start.Bqr7zWS0.js","_app/immutable/chunks/Bcn0cbbV.js","_app/immutable/chunks/OF6E9Be3.js","_app/immutable/chunks/CwMMMJpk.js","_app/immutable/entry/app.6Xd6ROd2.js","_app/immutable/chunks/OF6E9Be3.js","_app/immutable/chunks/0NO40-1G.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DEOw4ugo.js')),
			__memo(() => import('./chunks/1-BqhAsSLZ.js')),
			__memo(() => import('./chunks/2-D1lFbEJ3.js')),
			__memo(() => import('./chunks/3-B4PSr6PP.js')),
			__memo(() => import('./chunks/4-DT28o8gE.js')),
			__memo(() => import('./chunks/5-CctUiHIo.js'))
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
