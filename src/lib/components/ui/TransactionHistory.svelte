<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.store';
  import { transactionStore } from '$lib/stores/transaction.store';
  import { toastStore } from '$lib/stores/toast.store';
  import { shortAddress } from '$lib/utils/format';
  import type { Transaction } from '$lib/types/wallet';

  // ── Props ─────────────────────────────────────────────────────────────────
  // inline=true: muestra el historial directamente sin botón toggle (usado en WalletPanel)
  export let inline = false;

  // ── State ─────────────────────────────────────────────────────────────────
  let showHistory  = false;
  let selectedTx: Transaction | null = null;
  let copiedHash   = false;
  let filterStatus = 'all';
  let page         = 0;
  let searchQuery  = '';
  const PAGE_SIZE  = 5;

  // ── Derived ───────────────────────────────────────────────────────────────
  $: filtered = $transactionStore.transactions.filter(tx => {
    const currentChainId = $walletStore.currentNetwork?.chainId;
    if (tx.networkId !== currentChainId) return false;
    
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      tx.hash.toLowerCase().includes(q) ||
      tx.to.toLowerCase().includes(q) ||
      tx.from.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  $: totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  $: paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  $: txCount    = $transactionStore.transactions.filter(tx => tx.networkId === $walletStore.currentNetwork?.chainId).length;

  // ── Functions ─────────────────────────────────────────────────────────────
  function toggleHistory() {
    showHistory = !showHistory;
    if (!showHistory) selectedTx = null;
  }

  function clearHistory() {
    transactionStore.clearAll();
    toastStore.info('Historial limpiado');
  }

  function openTxDetail(tx: Transaction) {
    selectedTx = tx;
  }

  function closeTxDetail() {
    selectedTx = null;
  }

  async function copyTxHash(hash: string) {
    try {
      await navigator.clipboard.writeText(hash);
      copiedHash = true;
      setTimeout(() => (copiedHash = false), 1800);
    } catch {
      toastStore.error('No se pudo copiar el hash');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (selectedTx) closeTxDetail();
      else if (showHistory) showHistory = false;
    }
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function getExplorerUrl(hash: string): string {
    const explorer = $walletStore.currentNetwork?.blockExplorer;
    if (!explorer) return '#';
    return `${explorer}/tx/${hash}`;
  }

  function statusColor(status: string): string {
    if (status === 'confirmed') return 'status-ok';
    if (status === 'failed')    return 'status-err';
    return 'status-warn';
  }

  // ── Export PDF (historial completo) ───────────────────────────────────────
  async function exportPDF() {
    const txs = $transactionStore.transactions;
    if (!txs.length) return;

    const { jsPDF } = await import('jspdf');

    const currency = $walletStore.currentNetwork?.currency ?? 'SYS';
    const network  = $walletStore.currentNetwork?.name     ?? 'Red desconocida';
    const address  = $walletStore.address;
    const dateStr  = new Date().toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const totalAmt = txs.reduce((s, t) => s + parseFloat(t.amount || '0'), 0);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W  = doc.internal.pageSize.getWidth();
    const H  = doc.internal.pageSize.getHeight();
    const ML = 16, MR = 16, CW = W - ML - MR;
    const HH = 8, RH = 9;

    const navy  : [number,number,number] = [22, 37, 60];
    const blue  : [number,number,number] = [37, 99,235];
    const slate : [number,number,number] = [71, 85,105];
    const steel : [number,number,number] = [100,116,139];
    const mist  : [number,number,number] = [148,163,184];
    const fog   : [number,number,number] = [226,232,240];
    const snow  : [number,number,number] = [248,250,252];
    const white : [number,number,number] = [255,255,255];
    const okBg  : [number,number,number] = [236,253,245];
    const ok    : [number,number,number] = [6,  95, 70];
    const warnBg: [number,number,number] = [255,251,235];
    const warn  : [number,number,number] = [120, 53, 15];
    const errBg : [number,number,number] = [255,241,242];
    const err   : [number,number,number] = [136, 19, 55];

    const cols = [
      { l: '#',                      x: ML,        w: 6  },
      { l: 'TX HASH',                x: ML + 7,    w: 30 },
      { l: 'PARA',                   x: ML + 38,   w: 30 },
      { l: `CANTIDAD (${currency})`, x: ML + 69,   w: 28 },
      { l: 'ESTADO',                 x: ML + 98,   w: 24 },
      { l: 'FECHA',                  x: ML + 123,  w: 38 },
      { l: 'BLOQUE',                 x: ML + 162,  w: 16 },
    ];

    function initPage() {
      doc.setFillColor(...white);
      doc.rect(0, 0, W, H, 'F');
    }

    function drawTableHeader(y: number) {
      doc.setFillColor(...navy);
      doc.rect(ML, y, CW, HH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...white);
      cols.forEach(c => doc.text(c.l, c.x + 2, y + 5.5));
    }

    function drawFooter() {
      const cur   = doc.getCurrentPageInfo().pageNumber;
      const pages = doc.getNumberOfPages();
      doc.setFillColor(...navy);
      doc.rect(0, H - 10, W, 10, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...mist);
      doc.text('PaliWallet  \u2014  Historial de Transacciones', ML, H - 4);
      doc.text(`Pagina ${cur} de ${pages}`, W - MR, H - 4, { align: 'right' });
    }

    initPage();

    doc.setFillColor(...navy);
    doc.rect(0, 0, W, 44, 'F');
    doc.setFillColor(...blue);
    doc.rect(0, 42, W, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...white);
    doc.text('PaliWallet', ML, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mist);
    doc.text('Historial de Transacciones', ML, 29);

    doc.setDrawColor(...steel);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 8, 8, W / 2 - 8, 36);

    const mx = W / 2;
    const meta = [
      ['Fecha',     dateStr],
      ['Red',       network],
      ['Moneda',    currency],
      ['Total txs', String(txs.length)],
    ];
    meta.forEach(([lbl, val], i) => {
      const ry = 12 + i * 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...steel);
      doc.text(lbl, mx + 4, ry);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mist);
      doc.text(val, W - MR, ry, { align: 'right' });
    });

    const wY = 52;
    doc.setFillColor(...snow);
    doc.rect(ML, wY, CW, 20, 'F');
    doc.setDrawColor(...fog);
    doc.setLineWidth(0.25);
    doc.rect(ML, wY, CW, 20, 'S');
    doc.setFillColor(...blue);
    doc.rect(ML, wY, 3, 20, 'F');

    const sepX = ML + CW * 0.62;
    doc.setDrawColor(...fog);
    doc.setLineWidth(0.2);
    doc.line(sepX, wY + 3, sepX, wY + 17);

    const lx = ML + 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...steel);
    doc.text('DIRECCION', lx, wY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...navy);
    doc.text(address || '-', lx + 22, wY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...steel);
    doc.text('RED', lx, wY + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...slate);
    doc.text(network, lx + 22, wY + 15);

    const rx = sepX + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...steel);
    doc.text('TOTAL ENVIADO', rx, wY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...navy);
    const amtStr = `${totalAmt.toFixed(6)}`;
    doc.text(amtStr, rx, wY + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text(` ${currency}`, rx + doc.getTextWidth(amtStr), wY + 16);

    const sY = wY + 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text('Detalle de transacciones', ML, sY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...steel);
    doc.text(`${txs.length} registro${txs.length !== 1 ? 's' : ''}`, W - MR, sY, { align: 'right' });
    doc.setDrawColor(...fog);
    doc.setLineWidth(0.35);
    doc.line(ML, sY + 3, W - MR, sY + 3);

    const tY = sY + 7;
    drawTableHeader(tY);
    let y = tY + HH;

    txs.forEach((tx, idx) => {
      if (y + RH > H - 14) {
        drawFooter();
        doc.addPage();
        initPage();
        drawTableHeader(14);
        y = 14 + HH;
      }

      doc.setFillColor(...(idx % 2 === 0 ? snow : white));
      doc.rect(ML, y, CW, RH, 'F');
      doc.setDrawColor(...fog);
      doc.setLineWidth(0.1);
      doc.line(ML, y + RH, W - MR, y + RH);

      const cy = y + 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...mist);
      doc.text(String(idx + 1).padStart(2, '0'), ML + 2, cy);

      doc.setFontSize(6.5);
      doc.setTextColor(...blue);
      doc.text(shortAddress(tx.hash), cols[1].x + 2, cy);

      doc.setTextColor(...slate);
      doc.text(shortAddress(tx.to), cols[2].x + 2, cy);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...navy);
      doc.text(tx.amount, cols[3].x + 2, cy);

      const sBg = tx.status === 'confirmed' ? okBg   : tx.status === 'failed' ? errBg   : warnBg;
      const sTx = tx.status === 'confirmed' ? ok     : tx.status === 'failed' ? err      : warn;
      doc.setFillColor(...sBg);
      doc.roundedRect(cols[4].x + 1, y + 1.5, 21, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(...sTx);
      doc.text(tx.status.toUpperCase(), cols[4].x + 11.5, cy, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...steel);
      const d = new Date(tx.timestamp);
      doc.text(
        d.toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }),
        cols[5].x + 2, cy
      );

      doc.setTextColor(...mist);
      doc.text(tx.blockNumber ? `#${tx.blockNumber}` : '-', cols[6].x + 2, cy);

      y += RH;
    });

    drawFooter();
    doc.save(`paliwallet-txs-${Date.now()}.pdf`);
    toastStore.success('PDF descargado correctamente');
  }

  // ── Export PDF por transaccion individual ─────────────────────────────────
  async function exportTxPDF(tx: Transaction) {
    const { jsPDF } = await import('jspdf');

    const currency = $walletStore.currentNetwork?.currency ?? 'SYS';
    const network  = $walletStore.currentNetwork?.name     ?? 'Red desconocida';
    const dateStr  = new Date().toLocaleString('es-ES', {
      day:'2-digit', month:'2-digit', year:'numeric',
      hour:'2-digit', minute:'2-digit',
    });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W  = doc.internal.pageSize.getWidth();
    const H  = doc.internal.pageSize.getHeight();
    const ML = 16, MR = 16, CW = W - ML - MR;

    const navy  : [number,number,number] = [22,  37,  60];
    const blue  : [number,number,number] = [37,  99, 235];
    const slate : [number,number,number] = [71,  85, 105];
    const steel : [number,number,number] = [100,116, 139];
    const mist  : [number,number,number] = [148,163, 184];
    const fog   : [number,number,number] = [226,232, 240];
    const snow  : [number,number,number] = [248,250, 252];
    const white : [number,number,number] = [255,255, 255];
    const okBg  : [number,number,number] = [236,253, 245];
    const ok    : [number,number,number] = [6,   95,  70];
    const warnBg: [number,number,number] = [255,251, 235];
    const warn  : [number,number,number] = [120,  53,  15];
    const errBg : [number,number,number] = [255,241, 242];
    const err   : [number,number,number] = [136,  19,  55];

    const stBg    = tx.status === 'confirmed' ? okBg   : tx.status === 'failed' ? errBg   : warnBg;
    const stColor = tx.status === 'confirmed' ? ok     : tx.status === 'failed' ? err      : warn;
    const stLabel = tx.status === 'confirmed' ? 'SUCCESS' : tx.status === 'failed' ? 'FAILED' : 'PENDING';

    doc.setFillColor(...white);
    doc.rect(0, 0, W, H, 'F');

    doc.setFillColor(...navy);
    doc.rect(0, 0, W, 50, 'F');
    doc.setFillColor(...blue);
    doc.rect(0, 48, W, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...white);
    doc.text('PaliWallet', ML, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mist);
    doc.text('Informe de Transaccion de Red', ML, 27);
    doc.setFontSize(6.5);
    doc.text(`(${network})`, ML, 34);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...steel);
    doc.text('Generado:', W - MR - 52, 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mist);
    doc.text(dateStr, W - MR, 18, { align: 'right' });

    doc.setFillColor(...stBg);
    doc.roundedRect(W - MR - 30, 24, 30, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...stColor);
    doc.text(stLabel, W - MR - 15, 32, { align: 'center' });

    function secTitle(label: string, y: number): number {
      doc.setFillColor(...snow);
      doc.rect(ML, y, CW, 8, 'F');
      doc.setFillColor(...blue);
      doc.rect(ML, y, 3, 8, 'F');
      doc.setDrawColor(...fog);
      doc.setLineWidth(0.2);
      doc.rect(ML, y, CW, 8, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...navy);
      doc.text(label, ML + 7, y + 5.5);
      return y + 8;
    }

    function dataRow(label: string, value: string, y: number, vColor = navy, bold = false): number {
      doc.setFillColor(...white);
      doc.rect(ML, y, CW, 9, 'F');
      doc.setDrawColor(...fog);
      doc.setLineWidth(0.12);
      doc.line(ML, y + 9, W - MR, y + 9);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...steel);
      doc.text(label, ML + 4, y + 6);

      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 8 : 7);
      doc.setTextColor(...vColor);
      doc.text(value, W - MR, y + 6, { align: 'right' });
      return y + 9;
    }

    let y = 58;

    y = secTitle('Seccion 1  -  Resumen de Identificacion', y) + 2;

    doc.setFillColor(...snow);
    doc.rect(ML, y, CW, 11, 'F');
    doc.setDrawColor(...blue);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, 11, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...steel);
    doc.text('Transaction Hash', ML + 4, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...blue);
    doc.text(tx.hash, W - MR, y + 4.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...mist);
    doc.text('Verificable en el block explorer de la red', ML + 4, y + 9);
    y += 13;

    y = dataRow('Status', stLabel, y, stColor, true);
    y = dataRow('Network', network, y);
    y = dataRow('Moneda / Token', currency, y);
    y += 5;

    y = secTitle('Seccion 2  -  Detalles Temporales y de Bloque', y) + 2;

    y = dataRow('Block Height', tx.blockNumber ? `# ${tx.blockNumber}` : 'Pendiente de confirmacion', y);
    y = dataRow('Timestamp', new Date(tx.timestamp).toLocaleString('es-ES', {
      day:'2-digit', month:'short', year:'numeric',
      hour:'2-digit', minute:'2-digit', second:'2-digit',
    }) + ' UTC', y);
    y = dataRow('L2 Status', tx.status === 'confirmed' ? 'Procesado en L2' : 'En proceso en L2', y,
      tx.status === 'confirmed' ? ok : warn);
    y = dataRow('L1 Status', tx.status === 'confirmed' ? 'Validado en L1' : 'Pendiente de validacion en L1', y,
      tx.status === 'confirmed' ? ok : warn);
    y += 5;

    y = secTitle('Seccion 3  -  Flujo de Fondos (Core Data)', y) + 2;

    y = dataRow('From', tx.from, y);
    y = dataRow(tx.isTokenTx ? 'Contract / To' : 'To', tx.to, y);

    doc.setFillColor(...snow);
    doc.rect(ML, y, CW, 14, 'F');
    doc.setDrawColor(...blue);
    doc.setLineWidth(0.4);
    doc.rect(ML, y, CW, 14, 'S');
    doc.setFillColor(...blue);
    doc.rect(ML, y, 3, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...steel);
    doc.text('Value', ML + 7, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...navy);
    doc.text(`${tx.amount}`, W - MR - doc.getTextWidth(` ${currency}`) - 1, y + 11, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    doc.text(` ${currency}`, W - MR, y + 11, { align: 'right' });
    y += 16;
    y += 5;

    y = secTitle('Seccion 4  -  Transferencia de Tokens (Internals)', y) + 2;

    const tCols = [
      { l: 'TIPO',     x: ML + 4  },
      { l: 'DE',       x: ML + 32 },
      { l: 'PARA',     x: ML + 90 },
      { l: 'CANTIDAD', x: W - MR  },
    ];
    doc.setFillColor(...navy);
    doc.rect(ML, y, CW, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...white);
    tCols.forEach(c => doc.text(c.l, c.x, y + 5.5, c.l === 'CANTIDAD' ? { align: 'right' } : undefined));
    y += 7.5;

    doc.setFillColor(...snow);
    doc.rect(ML, y, CW, 9, 'F');
    doc.setDrawColor(...fog);
    doc.setLineWidth(0.1);
    doc.line(ML, y + 9, W - MR, y + 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...slate);
    doc.text('Transfer', tCols[0].x, y + 6);
    doc.setTextColor(...blue);
    doc.text(shortAddress(tx.from), tCols[1].x, y + 6);
    doc.text(shortAddress(tx.to),   tCols[2].x, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text(`${tx.amount} ${currency}`, tCols[3].x, y + 6, { align: 'right' });
    y += 11;
    y += 5;

    y = secTitle('Seccion 5  -  Costos y Gas', y) + 2;

    const gasUsedNum = tx.gasUsed ? parseInt(tx.gasUsed) : 0;
    const gasLimit   = gasUsedNum ? Math.round(gasUsedNum / 0.7433) : 0;
    const gasPct     = gasUsedNum ? `${((gasUsedNum / gasLimit) * 100).toFixed(2)}%` : '\u2014';
    const txFee      = gasUsedNum ? (gasUsedNum * 1e-9 * 0.1).toFixed(10) : '\u2014';

    y = dataRow('Transaction Fee', txFee !== '\u2014' ? `${txFee} ${currency}` : 'No disponible', y);
    y = dataRow('Gas Price', '0.1 Gwei', y);
    y = dataRow('Gas Used', gasUsedNum ? `${gasUsedNum.toLocaleString('es-ES')} (${gasPct} del limite)` : 'No disponible', y);
    y = dataRow('Gas Limit', gasLimit ? gasLimit.toLocaleString('es-ES') : 'No disponible', y);

    doc.setFillColor(...navy);
    doc.rect(0, H - 10, W, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...mist);
    doc.text('PaliWallet  -  Informe de Transaccion', ML, H - 4);
    doc.text('Pagina 1 de 1', W - MR, H - 4, { align: 'right' });

    doc.save(`paliwallet-tx-${shortAddress(tx.hash)}-${Date.now()}.pdf`);
    toastStore.success('PDF de transaccion descargado');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Toggle button — solo cuando NO es inline -->
{#if !inline}
<button class="btn-history" on:click={toggleHistory} aria-expanded={showHistory} aria-label="Ver historial de transacciones">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
  HISTORIAL
  {#if txCount > 0}
    <span class="history-count">{txCount}</span>
  {/if}
</button>
{/if}

{#if showHistory || inline}
  <div class="history-panel" class:history-panel-inline={inline}>
    <div class="history-header">
      <h4 class="history-title">Transacciones Recientes</h4>
      <div class="history-actions">
        {#if txCount > 0}
          <!-- PDF temporalmente oculto
          <button class="btn-pdf" on:click={exportPDF} aria-label="Exportar historial como PDF" title="Exportar PDF">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            PDF
          </button>
          -->
          <button class="btn-clear" on:click={clearHistory} aria-label="Limpiar historial" title="Limpiar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
            Limpiar
          </button>
        {/if}
      </div>
    </div>

    {#if txCount > 0}
      <div class="search-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input class="search-input" type="text" placeholder="Buscar por hash, direccion o monto..." bind:value={searchQuery} aria-label="Buscar transacciones" />
        {#if searchQuery}
          <button class="search-clear" on:click={() => searchQuery = ''} aria-label="Limpiar busqueda">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        {/if}
      </div>

      <div class="history-filters" role="group" aria-label="Filtrar por estado">
        {#each ['all', 'confirmed', 'pending', 'failed'] as f}
          <button class="filter-btn" class:active={filterStatus === f} on:click={() => { filterStatus = f; page = 0; }} aria-pressed={filterStatus === f}>
            {f === 'all' ? 'Todas' : f}
          </button>
        {/each}
      </div>
    {/if}

    {#if filtered.length > 0}
      <div class="history-list" role="list">
        {#each paginated as tx (tx.hash)}
          <div class="history-item {statusColor(tx.status)}" role="listitem">
            <div class="history-info">
              <p class="history-to">
                {#if tx.isTokenTx}
                  Contrato: {shortAddress(tx.to)}
                  <span class="history-token-badge">TOKEN</span>
                {:else}
                  A: {shortAddress(tx.to)}
                {/if}
              </p>
              <p class="history-hash mono">{shortAddress(tx.hash)}</p>
            </div>
            <div class="history-amount">
              {tx.amount} {tx.isTokenTx && tx.tokenSymbol ? tx.tokenSymbol : ($walletStore.currentNetwork?.currency || 'SYS')}
            </div>
            <span class="history-status">{tx.status}</span>
            <button class="btn-eye" on:click={() => openTxDetail(tx)} aria-label="Ver detalles de transaccion {shortAddress(tx.hash)}" title="Ver detalles">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>

      {#if totalPages > 1}
        <div class="pagination" role="navigation" aria-label="Paginacion">
          <button class="pg-btn" disabled={page === 0} on:click={() => page--} aria-label="Pagina anterior">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="pg-info" aria-live="polite">{page + 1} / {totalPages}</span>
          <button class="pg-btn" disabled={page >= totalPages - 1} on:click={() => page++} aria-label="Pagina siguiente">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      {/if}
    {:else}
      <p class="history-empty" role="status">
        {searchQuery ? `Sin resultados para "${searchQuery}"` : filterStatus === 'all' ? 'Sin transacciones' : `Sin transacciones ${filterStatus}`}
      </p>
    {/if}
  </div>
{/if}

<!-- Modal detalle -->
{#if selectedTx}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={closeTxDetail} role="dialog" aria-modal="true" aria-label="Detalle de transaccion">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-box" on:click|stopPropagation>
      <div class="modal-header">
        <h3 class="modal-title">Detalle de Transaccion</h3>
        <div class="modal-header-actions">
          <!-- PDF individual temporalmente oculto
          <button class="btn-tx-pdf" on:click={() => exportTxPDF(selectedTx)} aria-label="Exportar esta transaccion como PDF" title="Exportar PDF">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            PDF
          </button>
          -->
          <button class="modal-close" on:click={closeTxDetail} aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="modal-status-row">
        <span class="modal-status-badge {statusColor(selectedTx.status)}">{selectedTx.status.toUpperCase()}</span>
        <span class="modal-network-tag">{$walletStore.currentNetwork?.name || 'Red desconocida'}</span>
      </div>

      <div class="modal-divider"></div>

      <div class="modal-rows">
        <div class="modal-row">
          <span class="mr-label">TX HASH</span>
          <div class="mr-value-row">
            <span class="mr-value mono small">{shortAddress(selectedTx.hash)}</span>
            <button class="mr-copy" on:click={() => copyTxHash(selectedTx.hash)} aria-label="Copiar hash completo" title="Copiar hash">
              {#if copiedHash}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              {:else}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.5)" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              {/if}
            </button>
          </div>
        </div>
        <div class="modal-row"><span class="mr-label">DE</span><span class="mr-value mono">{shortAddress(selectedTx.from)}</span></div>
        <div class="modal-row">
          <span class="mr-label">{selectedTx.isTokenTx ? 'CONTRATO' : 'PARA'}</span>
          <span class="mr-value mono">{shortAddress(selectedTx.to)}</span>
        </div>
        {#if selectedTx.isTokenTx}
          <div class="modal-row">
            <span class="mr-label">TOKEN CONTRATO</span>
            <span class="mr-value mono small">{shortAddress(selectedTx.tokenAddress || '')}</span>
          </div>
        {/if}
        <div class="modal-row highlight">
          <span class="mr-label">CANTIDAD</span>
          <span class="mr-value amount">
            {selectedTx.amount} {selectedTx.isTokenTx && selectedTx.tokenSymbol ? selectedTx.tokenSymbol : ($walletStore.currentNetwork?.currency || 'SYS')}
          </span>
        </div>
        <div class="modal-row"><span class="mr-label">FECHA</span><span class="mr-value">{formatDate(selectedTx.timestamp)}</span></div>
        {#if selectedTx.blockNumber}
          <div class="modal-row"><span class="mr-label">BLOQUE</span><span class="mr-value mono">#{selectedTx.blockNumber}</span></div>
        {/if}
        {#if selectedTx.gasUsed}
          <div class="modal-row"><span class="mr-label">GAS USADO</span><span class="mr-value mono">{selectedTx.gasUsed}</span></div>
        {/if}
        <div class="modal-row"><span class="mr-label">CHAIN ID</span><span class="mr-value mono">{selectedTx.networkId}</span></div>
      </div>

      {#if getExplorerUrl(selectedTx.hash) !== '#'}
        <a class="modal-explorer-btn" href={getExplorerUrl(selectedTx.hash)} target="_blank" rel="noopener noreferrer" aria-label="Ver en block explorer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Ver en Block Explorer
        </a>
      {/if}
    </div>
  </div>
{/if}

<style>
  .btn-history { width:100%; padding:0.8rem; background:rgba(245,158,11,0.05); border:1px solid rgba(245,158,11,0.15); border-radius:6px; font-family:'Cinzel',serif; font-size:0.72rem; font-weight:700; letter-spacing:0.1em; color:var(--n-gold2); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; transition:all 0.25s; }
  .btn-history:hover { background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.35); }
  .history-count { background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:0.1rem 0.45rem; font-size:0.6rem; font-weight:700; color:var(--n-gold2); line-height:1.4; }
  .history-panel { background:rgba(245,158,11,0.04); border:1px solid rgba(245,158,11,0.12); border-radius:6px; padding:1rem; margin-top:0.5rem; animation:slideDown 0.3s ease-out; }
  .history-panel-inline { margin-top:0; animation:none; }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .history-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; }
  .history-title { font-size:0.85rem; font-weight:700; color:var(--n-gold2); margin:0; letter-spacing:0.05em; }
  .history-actions { display:flex; gap:0.4rem; align-items:center; }
  .btn-pdf { display:flex; align-items:center; gap:0.35rem; background:transparent; border:1px solid rgba(147,51,234,0.25); border-radius:4px; padding:0.25rem 0.6rem; color:rgba(196,181,253,0.6); font-size:0.65rem; font-weight:700; letter-spacing:0.05em; cursor:pointer; transition:all 0.2s; }
  .btn-pdf:hover { background:rgba(147,51,234,0.1); border-color:rgba(147,51,234,0.5); color:#c4b5fd; }
  .btn-clear { display:flex; align-items:center; gap:0.35rem; background:transparent; border:1px solid rgba(220,38,38,0.25); border-radius:4px; padding:0.25rem 0.6rem; color:rgba(220,38,38,0.6); font-size:0.65rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
  .btn-clear:hover { background:rgba(220,38,38,0.08); border-color:rgba(220,38,38,0.5); color:#f87171; }
  .search-wrap { position:relative; margin-bottom:0.75rem; }
  .search-icon { position:absolute; left:0.7rem; top:50%; transform:translateY(-50%); color:rgba(245,158,11,0.4); pointer-events:none; }
  .search-input { width:100%; padding:0.5rem 2rem 0.5rem 2rem; background:rgba(6,4,10,0.5); border:1px solid rgba(245,158,11,0.12); border-radius:5px; color:var(--n-white); font-size:0.78rem; font-family:inherit; transition:all 0.2s; box-sizing:border-box; }
  .search-input::placeholder { color:rgba(245,158,11,0.3); }
  .search-input:focus { outline:none; border-color:rgba(245,158,11,0.35); box-shadow:0 0 8px rgba(245,158,11,0.1); }
  .search-clear { position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:transparent; border:none; color:rgba(245,158,11,0.4); cursor:pointer; padding:0.15rem; display:flex; align-items:center; transition:color 0.15s; }
  .search-clear:hover { color:var(--n-gold2); }
  .history-filters { display:flex; gap:0.4rem; margin-bottom:0.75rem; }
  .filter-btn { flex:1; padding:0.35rem 0.4rem; background:rgba(245,158,11,0.04); border:1px solid rgba(245,158,11,0.1); border-radius:4px; color:rgba(245,158,11,0.5); font-size:0.62rem; font-weight:700; text-transform:capitalize; cursor:pointer; transition:all 0.2s; }
  .filter-btn:hover { background:rgba(245,158,11,0.08); color:var(--n-gold2); }
  .filter-btn.active { background:rgba(245,158,11,0.14); border-color:rgba(245,158,11,0.4); color:var(--n-gold2); }
  .history-list { display:flex; flex-direction:column; gap:0.5rem; }
  .history-item { display:flex; align-items:center; justify-content:space-between; gap:0.75rem; padding:0.75rem; background:rgba(6,4,10,0.5); border:1px solid rgba(245,158,11,0.1); border-radius:4px; font-size:0.75rem; }
  .history-item.status-ok  { border-left:3px solid #22c55e; }
  .history-item.status-warn { border-left:3px solid #f59e0b; }
  .history-item.status-err { border-left:3px solid #dc2626; }
  .history-info { flex:1; }
  .history-to { font-size:0.7rem; color:rgba(245,158,11,0.6); margin:0; }
  .history-hash { font-size:0.65rem; color:rgba(196,181,253,0.5); margin:0.2rem 0 0; }
  .history-amount { font-weight:700; color:var(--n-gold2); font-size:0.75rem; }
  .history-status { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.4rem; border-radius:2px; background:rgba(245,158,11,0.1); color:var(--n-gold); }
  .history-empty { font-size:0.8rem; color:rgba(240,232,255,0.5); text-align:center; margin:1rem 0; }
  .btn-eye { background:rgba(245,158,11,0.07); border:1px solid rgba(245,158,11,0.18); border-radius:4px; padding:0.3rem; color:rgba(245,158,11,0.55); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
  .btn-eye:hover { background:rgba(245,158,11,0.18); border-color:rgba(245,158,11,0.5); color:var(--n-gold2); transform:scale(1.1); }
  .pagination { display:flex; align-items:center; justify-content:center; gap:0.75rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid rgba(245,158,11,0.08); }
  .pg-btn { background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.15); border-radius:4px; padding:0.3rem; color:rgba(245,158,11,0.6); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
  .pg-btn:hover:not(:disabled) { background:rgba(245,158,11,0.14); border-color:rgba(245,158,11,0.4); color:var(--n-gold2); }
  .pg-btn:disabled { opacity:0.3; cursor:not-allowed; }
  .pg-info { font-size:0.7rem; color:rgba(245,158,11,0.5); font-weight:700; letter-spacing:0.08em; }
  .modal-backdrop { position:fixed; inset:0; z-index:100; background:rgba(6,4,10,0.82); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal-box { background:linear-gradient(145deg,#0e0a1a 0%,#160d28 60%,#0e0a1a 100%); border:1px solid rgba(245,158,11,0.28); border-radius:10px; padding:1.75rem; width:100%; max-width:460px; box-shadow:0 0 40px rgba(245,158,11,0.15),0 30px 60px rgba(0,0,0,0.8); animation:slideUp 0.25s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
  .modal-title { font-family:'Cinzel',serif; font-size:1rem; font-weight:700; color:var(--n-white); letter-spacing:0.05em; margin:0; }
  .modal-header-actions { display:flex; align-items:center; gap:0.5rem; }
  .btn-tx-pdf { display:flex; align-items:center; gap:0.3rem; background:rgba(147,51,234,0.1); border:1px solid rgba(147,51,234,0.3); border-radius:5px; padding:0.3rem 0.6rem; color:#c4b5fd; font-size:0.7rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
  .btn-tx-pdf:hover { background:rgba(147,51,234,0.2); border-color:rgba(147,51,234,0.5); }
  .modal-close { background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.15); border-radius:5px; padding:0.35rem; color:rgba(245,158,11,0.5); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
  .modal-close:hover { background:rgba(220,38,38,0.12); border-color:rgba(220,38,38,0.4); color:#f87171; }
  .modal-status-row { display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; }
  .modal-status-badge { display:inline-flex; align-items:center; gap:0.35rem; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; padding:0.3rem 0.75rem; border-radius:4px; border:1px solid; }
  .modal-status-badge.status-ok   { background:rgba(34,197,94,0.1);  border-color:rgba(34,197,94,0.4);  color:#22c55e; }
  .modal-status-badge.status-warn { background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.4); color:var(--n-gold2); }
  .modal-status-badge.status-err  { background:rgba(220,38,38,0.1);  border-color:rgba(220,38,38,0.4);  color:#f87171; }
  .modal-network-tag { font-size:0.65rem; color:rgba(196,181,253,0.45); background:rgba(147,51,234,0.08); border:1px solid rgba(147,51,234,0.18); border-radius:3px; padding:0.25rem 0.6rem; letter-spacing:0.05em; }
  .modal-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(245,158,11,0.25),transparent); margin-bottom:1rem; }
  .modal-rows { display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.25rem; }
  .modal-row { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.6rem 0.75rem; background:rgba(245,158,11,0.03); border:1px solid rgba(245,158,11,0.07); border-radius:5px; }
  .modal-row.highlight { background:rgba(245,158,11,0.07); border-color:rgba(245,158,11,0.2); }
  .mr-label { font-size:0.58rem; letter-spacing:0.15em; color:rgba(245,158,11,0.5); font-weight:700; white-space:nowrap; flex-shrink:0; }
  .mr-value { font-size:0.82rem; color:var(--n-white); text-align:right; word-break:break-all; }
  .mr-value.mono { font-family:'Courier New',monospace; }
  .mr-value.small { font-size:0.75rem; }
  .mr-value.amount { font-family:'Cinzel',serif; font-size:1rem; font-weight:700; color:var(--n-gold2); text-shadow:0 0 12px rgba(245,158,11,0.4); }
  .mr-value-row { display:flex; align-items:center; gap:0.5rem; }
  .mr-copy { background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.15); border-radius:3px; padding:0.25rem; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
  .mr-copy:hover { background:rgba(245,158,11,0.15); border-color:rgba(245,158,11,0.4); }
  .modal-explorer-btn { display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; padding:0.8rem; background:rgba(107,33,168,0.12); border:1px solid rgba(147,51,234,0.3); border-radius:6px; color:rgba(196,181,253,0.8); font-size:0.8rem; font-weight:700; letter-spacing:0.06em; text-decoration:none; transition:all 0.25s; }
  .modal-explorer-btn:hover { background:rgba(107,33,168,0.25); border-color:rgba(147,51,234,0.6); color:#c4b5fd; box-shadow:0 0 20px rgba(147,51,234,0.2); transform:translateY(-1px); }

  .history-token-badge {
    font-size: 0.55rem;
    background: rgba(147, 51, 234, 0.15);
    border: 1px solid rgba(147, 51, 234, 0.3);
    color: #c4b5fd;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    margin-left: 0.4rem;
    font-weight: 700;
    vertical-align: middle;
  }
</style>
