<script lang="ts">
  import { walletStore }      from '$lib/stores/wallet.store';
  import { transactionStore } from '$lib/stores/transaction.store';
  import { toastStore }       from '$lib/stores/toast.store';
  import { txLimitsStore }    from '$lib/stores/txLimits.store';
  import { sendTransaction }  from '$lib/services/transaction.service';
  import { shortAddress }     from '$lib/utils/format';
  import { ethers }           from 'ethers';
  import { onDestroy }        from 'svelte';
  import FavoriteAddresses    from './FavoriteAddresses.svelte';

  // ── Form state ───────────────────────────────────────────────────────────────
  let recipientAddress = '';
  let amount           = '';
  let loading          = false;
  let showConfirm      = false;
  let gasEstimate      = '';
  let estimating       = false;

  // ── Rate limiting ─────────────────────────────────────────────────────────────
  let lastSentAt = 0;
  const COOLDOWN_MS = 5000;
  $: cooldownLeft = Math.max(0, COOLDOWN_MS - (Date.now() - lastSentAt));
  let cooldownInterval: ReturnType<typeof setInterval> | null = null;

  function startCooldown() {
    lastSentAt = Date.now();
    cooldownInterval = setInterval(() => {
      cooldownLeft = Math.max(0, COOLDOWN_MS - (Date.now() - lastSentAt));
      if (cooldownLeft === 0 && cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }
    }, 100);
  }

  onDestroy(() => { if (cooldownInterval) clearInterval(cooldownInterval); });

  // ── Real-time address validation ──────────────────────────────────────────────
  $: addressValid   = recipientAddress.length > 0 && ethers.isAddress(recipientAddress);
  $: addressInvalid = recipientAddress.length > 5 && !ethers.isAddress(recipientAddress);
  $: amountValid    = amount !== '' && parseFloat(amount) > 0 && !isNaN(parseFloat(amount));

  // ── Gas estimation (debounced) ────────────────────────────────────────────────
  let estimateTimer: ReturnType<typeof setTimeout> | null = null;

  $: if (addressValid && amountValid && window.ethereum) {
    if (estimateTimer) clearTimeout(estimateTimer);
    estimateTimer = setTimeout(estimateGas, 600);
  } else {
    gasEstimate = '';
  }

  async function estimateGas() {
    if (!window.ethereum || !addressValid || !amountValid) return;
    estimating = true;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const from     = await signer.getAddress();
      const gasUnits = await provider.estimateGas({
        from,
        to:    recipientAddress,
        value: ethers.parseEther(amount),
      });
      const feeData  = await provider.getFeeData();
      const price    = feeData.gasPrice ?? 0n;
      const totalWei = gasUnits * price;
      gasEstimate = parseFloat(ethers.formatEther(totalWei)).toFixed(8);
    } catch {
      gasEstimate = '';
    } finally {
      estimating = false;
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!recipientAddress || !amount) return 'Por favor completa todos los campos';
    if (!ethers.isAddress(recipientAddress)) return 'Dirección inválida';
    if (parseFloat(amount) <= 0)             return 'La cantidad debe ser mayor a 0';
    if (isNaN(parseFloat(amount)))           return 'Cantidad inválida';
    if (cooldownLeft > 0)                    return `Espera ${(cooldownLeft / 1000).toFixed(1)}s antes de enviar de nuevo`;
    return null;
  }

  function requestConfirm() {
    transactionStore.clearError();
    const err = validate();
    if (err) { toastStore.error(err); return; }

    // Validar límites de seguridad
    const limitErr = txLimitsStore.validate(recipientAddress, amount);
    if (limitErr) { toastStore.error(limitErr); return; }

    showConfirm = true;
  }

  function cancelConfirm() {
    showConfirm = false;
  }

  // ── Keyboard: Escape closes confirm ──────────────────────────────────────────
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showConfirm) cancelConfirm();
  }

  // ── Send ─────────────────────────────────────────────────────────────────────
  async function handleSendTransaction() {
    showConfirm = false;
    loading     = true;
    transactionStore.setLoading(true);

    const pendingId = toastStore.pending('Enviando transacción...');

    try {
      if (!$walletStore.currentNetwork) throw new Error('Red no seleccionada');

      const hash = await sendTransaction(
        recipientAddress,
        String(amount),
        $walletStore.currentNetwork
      );

      toastStore.remove(pendingId);
      const explorerUrl = $walletStore.currentNetwork?.blockExplorer;
      const linkHtml = explorerUrl 
        ? ` · <a href="${explorerUrl}/tx/${hash}" target="_blank" style="text-decoration: underline; color: #fbbf24; font-weight: bold;">Ver en Explorador</a>` 
        : ` · ${shortAddress(hash)}`;
      toastStore.success(`Transacción confirmada${linkHtml}`);
      startCooldown();

      recipientAddress = '';
      amount           = '';
      gasEstimate      = '';
    } catch (err: unknown) {
      toastStore.remove(pendingId);
      const message = err instanceof Error ? err.message : 'Error al enviar transacción';
      toastStore.error(message);
      transactionStore.setError(message);
    } finally {
      loading = false;
      transactionStore.setLoading(false);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- ── Send form ── -->
<div class="send-transaction">
  <div class="st-header">
    <h3>Enviar Transacción</h3>
    <p class="st-subtitle">
      Desde: <span class="mono">{shortAddress($walletStore.address)}</span>
    </p>
  </div>

  <!-- Favoritos -->
  <div class="st-favorites">
    <FavoriteAddresses on:select={(e) => { recipientAddress = e.detail; }} />
  </div>

  <form on:submit|preventDefault={requestConfirm} class="st-form">

    <!-- Recipient -->
    <div class="form-group">
      <label for="recipient">Dirección del Destinatario</label>
      <div class="input-wrap">
        <input
          id="recipient"
          type="text"
          placeholder="0x..."
          bind:value={recipientAddress}
          disabled={loading}
          class="form-input"
          class:valid={addressValid}
          class:invalid={addressInvalid}
          autocomplete="off"
          spellcheck="false"
          aria-label="Dirección del destinatario"
          aria-invalid={addressInvalid}
        />
        {#if addressValid}
          <span class="input-badge valid" aria-label="Dirección válida">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        {:else if addressInvalid}
          <span class="input-badge invalid" aria-label="Dirección inválida">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
        {/if}
      </div>
      {#if addressInvalid}
        <p class="field-error" role="alert">Dirección Ethereum inválida</p>
      {/if}
    </div>

    <!-- Amount -->
    <div class="form-group">
      <label for="amount">
        Cantidad ({$walletStore.currentNetwork?.currency || 'SYS'})
      </label>
      <input
        id="amount"
        type="number"
        placeholder="0.00"
        step="0.0001"
        min="0.0001"
        bind:value={amount}
        disabled={loading}
        class="form-input"
        class:valid={amountValid}
        aria-label="Cantidad a enviar"
      />
      <!-- Gas estimate -->
      {#if estimating}
        <p class="gas-hint">Estimando gas...</p>
      {:else if gasEstimate}
        <p class="gas-hint">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          Gas estimado: ~{gasEstimate} {$walletStore.currentNetwork?.currency || 'SYS'}
        </p>
      {/if}
    </div>

    <!-- Cooldown indicator -->
    {#if cooldownLeft > 0}
      <div class="cooldown-bar-wrap" aria-label="Cooldown activo">
        <div class="cooldown-bar" style="width: {(cooldownLeft / COOLDOWN_MS) * 100}%"></div>
        <span class="cooldown-label">Cooldown: {(cooldownLeft / 1000).toFixed(1)}s</span>
      </div>
    {/if}

    <button
      type="submit"
      disabled={loading || cooldownLeft > 0}
      class="btn-send"
      aria-label="Enviar transacción"
    >
      {#if loading}
        <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span>Enviando...</span>
      {:else if cooldownLeft > 0}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Espera {(cooldownLeft / 1000).toFixed(1)}s</span>
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        <span>Enviar Transacción</span>
      {/if}
    </button>

  </form>
</div>

<!-- ── Confirmation modal ── -->
{#if showConfirm}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="confirm-backdrop" on:click={cancelConfirm} role="dialog" aria-modal="true" aria-label="Confirmar transacción">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="confirm-box" on:click|stopPropagation>

      <div class="confirm-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </div>

      <h3 class="confirm-title">Confirmar Transacción</h3>
      <p class="confirm-sub">Revisa los detalles antes de firmar</p>

      <div class="confirm-rows">
        <div class="confirm-row">
          <span class="cr-label">PARA</span>
          <span class="cr-value mono">{shortAddress(recipientAddress)}</span>
        </div>
        <div class="confirm-row highlight">
          <span class="cr-label">CANTIDAD</span>
          <span class="cr-value amount">
            {amount} {$walletStore.currentNetwork?.currency || 'SYS'}
          </span>
        </div>
        {#if gasEstimate}
          <div class="confirm-row">
            <span class="cr-label">GAS EST.</span>
            <span class="cr-value mono">~{gasEstimate} {$walletStore.currentNetwork?.currency || 'SYS'}</span>
          </div>
        {/if}
        <div class="confirm-row">
          <span class="cr-label">RED</span>
          <span class="cr-value">{$walletStore.currentNetwork?.name || '—'}</span>
        </div>
      </div>

      <div class="confirm-actions">
        <button class="btn-cancel" on:click={cancelConfirm} aria-label="Cancelar transacción">Cancelar</button>
        <button class="btn-confirm" on:click={handleSendTransaction} aria-label="Confirmar y enviar transacción">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Confirmar y Enviar
        </button>
      </div>

    </div>
  </div>
{/if}

<style>
  .send-transaction {
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .st-header { margin-bottom: 1.5rem; }

  .st-header h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--n-white);
    margin-bottom: 0.5rem;
  }

  .st-subtitle {
    font-size: 0.85rem;
    color: rgba(245,158,11,0.6);
  }

  .st-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .form-group label {
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(245,158,11,0.7);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ── Input with validation badge ── */
  .input-wrap {
    position: relative;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 2.2rem 0.75rem 1rem;
    background: rgba(6,4,10,0.6);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 6px;
    color: var(--n-white);
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-input:not(.input-wrap .form-input) {
    padding-right: 1rem;
  }

  .form-input:focus {
    outline: none;
    border-color: rgba(245,158,11,0.5);
    background: rgba(6,4,10,0.8);
    box-shadow: 0 0 12px rgba(245,158,11,0.15);
  }

  .form-input.valid  { border-color: rgba(34,197,94,0.45); }
  .form-input.invalid { border-color: rgba(220,38,38,0.45); }

  .form-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-badge {
    position: absolute;
    right: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
    width: 18px; height: 18px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0;
  }

  .input-badge.valid  { background: rgba(34,197,94,0.15);  color: #22c55e; }
  .input-badge.invalid { background: rgba(220,38,38,0.15); color: #f87171; }

  .field-error {
    font-size: 0.72rem;
    color: #f87171;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  /* ── Gas hint ── */
  .gas-hint {
    font-size: 0.72rem;
    color: rgba(245,158,11,0.55);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  /* ── Cooldown bar ── */
  .cooldown-bar-wrap {
    position: relative;
    height: 4px;
    background: rgba(245,158,11,0.08);
    border-radius: 2px;
    overflow: hidden;
  }

  .cooldown-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--n-gold), var(--n-gold2));
    border-radius: 2px;
    transition: width 0.1s linear;
    box-shadow: 0 0 6px rgba(245,158,11,0.4);
  }

  .cooldown-label {
    position: absolute;
    right: 0;
    top: 6px;
    font-size: 0.62rem;
    color: rgba(245,158,11,0.5);
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  /* ── Send button ── */
  .btn-send {
    padding: 0.9rem 1.5rem;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    border: none;
    border-radius: 6px;
    font-family: 'Cinzel', serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: all 0.3s;
    box-shadow: 0 8px 24px rgba(124,58,237,0.3);
    margin-top: 0.25rem;
  }

  .btn-send:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124,58,237,0.5);
  }

  .btn-send:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin { animation: spinAnim 0.8s linear infinite; }

  @keyframes spinAnim { to { transform: rotate(360deg); } }

  /* ── Confirmation modal ── */
  .confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(6,4,10,0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .confirm-box {
    background: linear-gradient(145deg, #0e0a1a 0%, #160d28 60%, #0e0a1a 100%);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 0 40px rgba(245,158,11,0.15), 0 30px 60px rgba(0,0,0,0.8);
    animation: slideUp 0.25s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .confirm-icon {
    width: 56px; height: 56px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.22);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
  }

  .confirm-title {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--n-white);
    margin: 0 0 0.35rem;
  }

  .confirm-sub {
    font-size: 0.8rem;
    color: rgba(196,181,253,0.45);
    margin: 0 0 1.5rem;
  }

  .confirm-rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .confirm-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0.75rem;
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.07);
    border-radius: 6px;
  }

  .confirm-row.highlight {
    background: rgba(245,158,11,0.07);
    border-color: rgba(245,158,11,0.2);
  }

  .cr-label {
    font-size: 0.58rem;
    letter-spacing: 0.15em;
    color: rgba(245,158,11,0.5);
    font-weight: 700;
    flex-shrink: 0;
  }

  .cr-value {
    font-size: 0.85rem;
    color: var(--n-white);
    font-weight: 600;
    text-align: right;
    word-break: break-all;
  }

  .cr-value.amount {
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--n-gold2);
    text-shadow: 0 0 10px rgba(245,158,11,0.4);
  }

  .confirm-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-cancel {
    flex: 1;
    padding: 0.8rem;
    background: transparent;
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 6px;
    color: rgba(245,158,11,0.6);
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel:hover {
    background: rgba(245,158,11,0.06);
    border-color: rgba(245,158,11,0.4);
    color: var(--n-gold2);
  }

  .btn-confirm {
    flex: 2;
    padding: 0.8rem;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border: none;
    border-radius: 6px;
    color: white;
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
    box-shadow: 0 6px 20px rgba(124,58,237,0.35);
  }

  .btn-confirm:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(124,58,237,0.5);
  }
</style>
