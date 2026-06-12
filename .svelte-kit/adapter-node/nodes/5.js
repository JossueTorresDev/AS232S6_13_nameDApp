

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/faucet/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.DG-bj_y4.js","_app/immutable/chunks/-MhqrU0A.js","_app/immutable/chunks/cpmTzFNQ.js","_app/immutable/chunks/CpgjVRCa.js","_app/immutable/chunks/C8kmS8zC.js","_app/immutable/chunks/FzLlpdUv.js","_app/immutable/chunks/CaRFQzC6.js","_app/immutable/chunks/bjmCWRu_.js"];
export const stylesheets = ["_app/immutable/assets/5.C0Uenk70.css"];
export const fonts = [];
