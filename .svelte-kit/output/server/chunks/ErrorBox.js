import { c as create_ssr_component, e as escape } from "./ssr.js";
const css = {
  code: ".error-box.svelte-qcf7d4{margin-top:1rem;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.28);border-radius:6px;padding:0.75rem 1rem;color:#fca5a5;font-size:0.8rem;display:flex;align-items:center;gap:0.5rem;box-shadow:0 0 15px rgba(220,38,38,0.1);letter-spacing:0.02em}",
  map: '{"version":3,"file":"ErrorBox.svelte","sources":["ErrorBox.svelte"],"sourcesContent":["<script lang=\\"ts\\">export let message;\\n<\/script>\\r\\n\\r\\n{#if message}\\r\\n  <div class=\\"error-box\\">\\r\\n    <svg width=\\"15\\" height=\\"15\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\">\\r\\n      <circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/>\\r\\n      <line x1=\\"12\\" y1=\\"8\\" x2=\\"12\\" y2=\\"12\\"/>\\r\\n      <line x1=\\"12\\" y1=\\"16\\" x2=\\"12.01\\" y2=\\"16\\"/>\\r\\n    </svg>\\r\\n    {message}\\r\\n  </div>\\r\\n{/if}\\r\\n\\r\\n<style>\\r\\n  .error-box {\\r\\n    margin-top: 1rem;\\r\\n    background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.28);\\r\\n    border-radius: 6px; padding: 0.75rem 1rem;\\r\\n    color: #fca5a5; font-size: 0.8rem;\\r\\n    display: flex; align-items: center; gap: 0.5rem;\\r\\n    box-shadow: 0 0 15px rgba(220,38,38,0.1); letter-spacing: 0.02em;\\r\\n  }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAeE,wBAAW,CACT,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,KAAK,GAAG,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CAAE,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,GAAG,CAAC,EAAE,CAAC,EAAE,CAAC,IAAI,CAAC,CACxE,aAAa,CAAE,GAAG,CAAE,OAAO,CAAE,OAAO,CAAC,IAAI,CACzC,KAAK,CAAE,OAAO,CAAE,SAAS,CAAE,MAAM,CACjC,OAAO,CAAE,IAAI,CAAE,WAAW,CAAE,MAAM,CAAE,GAAG,CAAE,MAAM,CAC/C,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,KAAK,GAAG,CAAC,EAAE,CAAC,EAAE,CAAC,GAAG,CAAC,CAAE,cAAc,CAAE,MAC5D"}'
};
const ErrorBox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { message } = $$props;
  if ($$props.message === void 0 && $$bindings.message && message !== void 0) $$bindings.message(message);
  $$result.css.add(css);
  return `${message ? `<div class="error-box svelte-qcf7d4"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${escape(message)}</div>` : ``}`;
});
export {
  ErrorBox as E
};
