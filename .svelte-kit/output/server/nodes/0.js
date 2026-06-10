

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.CVGRmQvY.js","_app/immutable/chunks/Gm8cJEhR.js","_app/immutable/chunks/DxI3WT-8.js","_app/immutable/chunks/DIEz9_GB.js"];
export const stylesheets = ["_app/immutable/assets/0.CZ68Rscb.css"];
export const fonts = [];
