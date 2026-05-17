import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Vercel inyecta automáticamente la variable de entorno VERCEL=1.
// Si estamos en Vercel usamos adapter-auto; si estamos en Docker usamos adapter-node.
const useAdapter = process.env.VERCEL ? adapterAuto() : adapterNode();

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: useAdapter,
    alias: {
      $lib: './src/lib'
    }
  }
};
