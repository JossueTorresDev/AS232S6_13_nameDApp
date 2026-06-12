

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/faucet/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.7ePz8Xrn.js","_app/immutable/chunks/-MhqrU0A.js","_app/immutable/chunks/cpmTzFNQ.js","_app/immutable/chunks/cJfCZ4q5.js","_app/immutable/chunks/C8kmS8zC.js","_app/immutable/chunks/FzLlpdUv.js","_app/immutable/chunks/orEALXqG.js","_app/immutable/chunks/BEuSe3kA.js"];
export const stylesheets = ["_app/immutable/assets/5.C0Uenk70.css"];
export const fonts = [];
