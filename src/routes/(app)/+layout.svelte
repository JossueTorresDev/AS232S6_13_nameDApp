<script lang="ts">
  import { walletStore }      from '$lib/stores/wallet.store';
  import { tryAutoReconnect, refreshBalance } from '$lib/services/wallet.service';
  import { goto }             from '$app/navigation';
  import { browser }          from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
  import Header               from '$lib/components/layout/Header.svelte';
  import Sidebar              from '$lib/components/layout/Sidebar.svelte';
  import ToastContainer       from '$lib/components/ui/ToastContainer.svelte';
  import LoadingScreen        from '$lib/components/ui/LoadingScreen.svelte';
  import { sidebarStore }     from '$lib/stores/sidebar.store';

  export const params = {};

  $: if (browser && !$walletStore.connected) goto('/');
  $: panelVisible = $sidebarStore !== 'dashboard';

  let loading = true;
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  onMount(async () => {
    await tryAutoReconnect();
    // Pequeño delay para que el loading se vea al menos un momento
    setTimeout(() => { loading = false; }, 800);

    pollingInterval = setInterval(() => {
      if ($walletStore.connected) {
        refreshBalance(true).catch(() => {});
      }
    }, 30_000);
  });

  onDestroy(() => {
    if (pollingInterval) clearInterval(pollingInterval);
  });
</script>

{#if loading}
  <LoadingScreen message="Conectando a la Grand Line..." />
{:else}
  <Header />
  <ToastContainer />

  <div class="app-body">
    <Sidebar />
    {#if !panelVisible}
      <main>
        <slot />
      </main>
    {/if}
  </div>
{/if}

<style>
  .app-body {
    display: flex;
    align-items: stretch;
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 53px); /* descontar el header */
  }

  main {
    flex: 1;
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    height: calc(100vh - 53px);
  }

  main::-webkit-scrollbar {
    width: 6px;
  }

  main::-webkit-scrollbar-track {
    background: rgba(10,14,26,0.8);
  }

  main::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(220,38,38,0.5), rgba(245,158,11,0.4));
    border-radius: 3px;
  }

  main::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(220,38,38,0.8), rgba(245,158,11,0.7));
  }
</style>
