const KEY_INFO = {
  caesar: {
    hint: '— masukkan angka pergeseran (contoh: 3)',
    desc: '<strong>Caesar Cipher:</strong> Key berupa angka (1–25). Setiap huruf digeser sejumlah posisi tersebut.',
    placeholder: 'Contoh: 3'
  },
  vigenere: {
    hint: '— masukkan kata kunci (contoh: SECRET)',
    desc: '<strong>Vigenere Cipher:</strong> Key berupa kata/frasa huruf (A–Z). Diulang sepanjang teks.',
    placeholder: 'Contoh: SECRET'
  },
  columnar: {
    hint: '— masukkan kata kunci (contoh: ZEBRAS)',
    desc: '<strong>Columnar Transposition:</strong> Key berupa kata huruf. Urutan kolom ditentukan oleh urutan abjad.',
    placeholder: 'Contoh: ZEBRAS'
  }
};

const ALGO_LABELS = {
  caesar:   'Caesar Cipher',
  vigenere: 'Vigenere Cipher',
  columnar: 'Columnar Transposition'
};

function initCryptoPage(mode) {
  const algoSelector = document.getElementById('algoSelector');
  const keyInput     = document.getElementById('keyInput');
  const keyHint      = document.getElementById('keyHint');
  const keyDesc      = document.getElementById('keyDesc');
  const inputText    = document.getElementById('inputText');
  const charCount    = document.getElementById('charCount');
  const executeBtn   = document.getElementById('executeBtn');
  const btnText      = executeBtn.querySelector('.btn-text');
  const btnLoader    = executeBtn.querySelector('.btn-loader');
  const resultArea   = document.getElementById('resultArea');
  const resultMeta   = document.getElementById('resultMeta');
  const copyBtn      = document.getElementById('copyBtn');
  const metaAlgo     = document.getElementById('metaAlgo');
  const metaKey      = document.getElementById('metaKey');
  const metaLen      = document.getElementById('metaLen');

  let selectedAlgo = 'caesar';

  // Algo selector
  algoSelector.querySelectorAll('.algo-option').forEach(opt => {
    opt.addEventListener('click', () => {
      algoSelector.querySelectorAll('.algo-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedAlgo = opt.dataset.algo;
      const info = KEY_INFO[selectedAlgo];
      keyHint.textContent  = info.hint;
      keyDesc.innerHTML    = info.desc;
      keyInput.placeholder = info.placeholder;
      keyInput.value = '';
      keyInput.focus();
    });
  });

  // Char counter
  inputText.addEventListener('input', () => {
    charCount.textContent = inputText.value.length;
  });

  // Paste button (decrypt only)
  const pasteBtn = document.getElementById('pasteBtn');
  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        inputText.value = text;
        charCount.textContent = text.length;
        inputText.focus();
        const origHTML = pasteBtn.innerHTML;
        pasteBtn.innerHTML = '<svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tertempel!';
        setTimeout(() => { pasteBtn.innerHTML = origHTML; }, 1500);
      } catch (err) {
        const origHTML = pasteBtn.innerHTML;
        pasteBtn.innerHTML = 'Gagal';
        setTimeout(() => { pasteBtn.innerHTML = origHTML; }, 1500);
      }
    });
  }

  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      inputText.value = '';
      keyInput.value  = '';
      charCount.textContent = '0';
      resultArea.className  = 'result-area result-idle';
      resultArea.innerHTML  = `<div class="result-idle-msg">
        <svg class="idle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <p>Menunggu input...</p>
        <p class="idle-sub">Hasil ${mode === 'encrypt' ? 'enkripsi' : 'dekripsi'} akan muncul di sini</p>
      </div>`;
      resultMeta.style.display = 'none';
      copyBtn.style.display    = 'none';
      inputText.focus();
    });
  }

  // Execute
  executeBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    const key  = keyInput.value.trim();
    if (!text || !key) {
      showError(resultArea, !text ? 'Masukkan teks terlebih dahulu.' : 'Masukkan key terlebih dahulu.');
      resultMeta.style.display = 'none';
      copyBtn.style.display    = 'none';
      return;
    }
    btnText.style.display   = 'none';
    btnLoader.style.display = 'inline';
    executeBtn.disabled     = true;

    try {
      const endpoint = mode === 'encrypt' ? '/api/encrypt' : '/api/decrypt';
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, algorithm: selectedAlgo, key })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showError(resultArea, data.error || 'Terjadi kesalahan.');
        resultMeta.style.display = 'none';
        copyBtn.style.display    = 'none';
      } else {
        showResult(resultArea, data.result);
        metaAlgo.textContent = ALGO_LABELS[data.algorithm] || data.algorithm;
        metaKey.textContent  = data.key;
        metaLen.textContent  = data.result.length + ' karakter';
        resultMeta.style.display = 'flex';
        copyBtn.style.display    = 'block';
        copyBtn._result = data.result;
      }
    } catch (err) {
      showError(resultArea, 'Koneksi gagal. Coba lagi.');
      resultMeta.style.display = 'none';
      copyBtn.style.display    = 'none';
    } finally {
      btnText.style.display   = 'inline';
      btnLoader.style.display = 'none';
      executeBtn.disabled     = false;
    }
  });

  // Copy
  copyBtn.addEventListener('click', () => {
    if (!copyBtn._result) return;
    navigator.clipboard.writeText(copyBtn._result).then(() => {
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '<svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!';
      setTimeout(() => { copyBtn.innerHTML = orig; }, 1800);
    });
  });

  // Ctrl+Enter shortcut
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') executeBtn.click();
  });
}

function showResult(el, text) {
  el.className = 'result-area result-success';
  el.textContent = '';
  let i = 0;
  const max = Math.min(text.length, 400);
  const step = () => {
    if (i < max) { el.textContent += text[i++]; requestAnimationFrame(step); }
    else if (text.length > max) { el.textContent = text; }
  };
  requestAnimationFrame(step);
}

function showError(el, msg) {
  el.className = 'result-area result-error';
  el.innerHTML = `<div style="display:flex;align-items:center;gap:.65rem;">
    <svg style="width:20px;height:20px;flex-shrink:0;color:var(--red)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span style="font-family:var(--font-body);font-size:.92rem">${msg}</span>
  </div>`;
}
