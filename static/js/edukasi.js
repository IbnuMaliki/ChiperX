// ─── Tab handler per algoritma ────────────────────────────────────────────────
document.querySelectorAll('.algo-tabs').forEach(tabGroup => {
  const algo = tabGroup.id.replace('tabs-', '');
  tabGroup.querySelectorAll('.algo-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabGroup.querySelectorAll('.algo-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabName = btn.dataset.tab;
      document.querySelectorAll(`#${algo}-penjelasan, #${algo}-cara-kerja, #${algo}-simulasi`)
        .forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(`${algo}-${tabName}`);
      if (panel) panel.classList.add('active');
      // Auto-run simulation when tab opened
      if (tabName === 'simulasi') {
        if (algo === 'caesar')   updateCaesar();
        if (algo === 'vigenere') updateVigenere();
        if (algo === 'columnar') updateColumnar();
      }
    });
  });
});

// ─── Caesar Simulation ────────────────────────────────────────────────────────
function updateCaesar() {
  const key    = parseInt(document.getElementById('caesarKey').value) || 3;
  const input  = (document.getElementById('caesarInput').value.toUpperCase().replace(/[^A-Z]/g,'') || 'HELLO').slice(0,12);
  document.getElementById('caesarInput').value = input;

  const row    = document.getElementById('caesarDemo');
  const res    = document.getElementById('caesarResult');
  row.innerHTML = '';

  let output = '';
  for (const ch of input) {
    const enc = String.fromCharCode((ch.charCodeAt(0) - 65 + key) % 26 + 65);
    output += enc;
    const box = document.createElement('div');
    box.className = 'caesar-box';
    box.innerHTML = `
      <span class="cb-orig">${ch}</span>
      <span class="cb-arrow">+${key}</span>
      <span class="cb-enc">${enc}</span>`;
    row.appendChild(box);
  }
  res.innerHTML = `<span style="color:var(--text2)">${input}</span>
    <span style="color:var(--text3);margin:0 .5rem">+${key}</span>
    <span style="color:var(--text3);margin:0 .5rem">=</span>
    <span style="color:var(--primary);font-weight:bold">${output}</span>`;
}

document.getElementById('caesarKey')?.addEventListener('input', updateCaesar);
document.getElementById('caesarInput')?.addEventListener('input', function(){
  this.value = this.value.toUpperCase().replace(/[^A-Z]/g,'');
  updateCaesar();
});

// ─── Vigenère Simulation ──────────────────────────────────────────────────────
let vigActiveStep = 0;
let vigPairs = [];

function buildVigTable() {
  const tbl = document.getElementById('vigTable');
  if (!tbl || tbl.rows.length > 0) return;
  // Header row
  const hRow = tbl.insertRow();
  const corner = document.createElement('th');
  corner.textContent = 'K\\P';
  corner.style.cssText = 'padding:4px 6px;background:var(--bg3);color:var(--text4);border:1px solid var(--border);position:sticky;top:0;left:0;z-index:3;font-size:.6rem';
  hRow.appendChild(corner);
  for (let c = 0; c < 26; c++) {
    const th = document.createElement('th');
    th.textContent = String.fromCharCode(65 + c);
    th.id = `vth-col-${c}`;
    th.style.cssText = 'padding:4px 5px;background:var(--bg3);color:var(--text3);border:1px solid var(--border);min-width:22px;text-align:center;position:sticky;top:0;z-index:2;';
    hRow.appendChild(th);
  }
  // Data rows
  for (let r = 0; r < 26; r++) {
    const tr = tbl.insertRow();
    const rowTh = document.createElement('th');
    rowTh.textContent = String.fromCharCode(65 + r);
    rowTh.id = `vth-row-${r}`;
    rowTh.style.cssText = 'padding:4px 5px;background:var(--bg3);color:var(--accent);border:1px solid var(--border);text-align:center;position:sticky;left:0;z-index:1;font-weight:700;';
    tr.appendChild(rowTh);
    for (let c = 0; c < 26; c++) {
      const td = tr.insertCell();
      td.textContent = String.fromCharCode((r + c) % 26 + 65);
      td.id = `vtd-${r}-${c}`;
      td.style.cssText = 'padding:4px 5px;border:1px solid var(--border);color:var(--text4);text-align:center;transition:background .12s,color .12s;';
    }
  }
}

function updateVigenere() {
  buildVigTable();
  const text     = (document.getElementById('vigInput').value.toUpperCase().replace(/[^A-Z]/g,'') || 'HELLO').slice(0,10);
  const keyRaw   = (document.getElementById('vigKey').value.toUpperCase().replace(/[^A-Z]/g,'') || 'KEY').slice(0,10);
  document.getElementById('vigInput').value = text;
  document.getElementById('vigKey').value   = keyRaw;

  vigPairs = [];
  let ki = 0, output = '';
  for (const ch of text) {
    const k  = keyRaw[ki % keyRaw.length];
    const pv = ch.charCodeAt(0) - 65;
    const kv = k.charCodeAt(0) - 65;
    const cv = (pv + kv) % 26;
    const c  = String.fromCharCode(cv + 65);
    output += c;
    vigPairs.push({ p: ch, k, c, pv, kv, cv });
    ki++;
  }

  // Build nav buttons
  const nav = document.getElementById('vigPairsNav');
  nav.innerHTML = '<div style="font-size:.65rem;font-weight:700;color:var(--text4);margin-bottom:.4rem;letter-spacing:.1em">PILIH HURUF UNTUK LIHAT DI TABEL:</div>';
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:.3rem';
  vigPairs.forEach((pair, idx) => {
    const btn = document.createElement('button');
    btn.style.cssText = 'font-family:var(--font-mono);font-size:.75rem;padding:.28rem .6rem;border:1.5px solid var(--border2);background:var(--bg);color:var(--text2);cursor:pointer;transition:all .15s;border-radius:6px;';
    btn.innerHTML = `<span style="color:var(--text2)">${pair.p}</span><span style="color:var(--text4);font-size:.6rem">+</span><span style="color:var(--accent)">${pair.k}</span><span style="color:var(--text4);font-size:.6rem">=</span><span style="color:var(--primary)">${pair.c}</span>`;
    btn.addEventListener('click', () => { vigActiveStep = idx; highlightVig(); updateVigNav(); });
    btnWrap.appendChild(btn);
  });
  nav.appendChild(btnWrap);

  vigActiveStep = 0;
  highlightVig();
  updateVigNav();

  document.getElementById('vigResult').innerHTML =
    `<span style="color:var(--text2)">${text}</span>
     <span style="color:var(--text3);margin:0 .5rem">+</span>
     <span style="color:var(--accent)">${keyRaw}</span>
     <span style="color:var(--text3);margin:0 .5rem">=</span>
     <span style="color:var(--primary);font-weight:bold">${output}</span>`;
}

function updateVigNav() {
  const btns = document.querySelectorAll('#vigPairsNav button');
  btns.forEach((btn, idx) => {
    btn.style.border = idx === vigActiveStep ? '1.5px solid var(--primary2)' : '1.5px solid var(--border2)';
    btn.style.background = idx === vigActiveStep ? 'var(--primary3)' : 'var(--bg)';
  });
}

function highlightVig() {
  if (!vigPairs.length) return;
  // Reset all
  for (let r = 0; r < 26; r++) {
    const rTh = document.getElementById(`vth-row-${r}`);
    if (rTh) rTh.style.cssText = 'padding:4px 5px;background:var(--bg3);color:var(--accent);border:1px solid var(--border);text-align:center;position:sticky;left:0;z-index:1;font-weight:700;';
    for (let c = 0; c < 26; c++) {
      const td = document.getElementById(`vtd-${r}-${c}`);
      if (td) { td.style.background=''; td.style.color='var(--text4)'; td.style.fontWeight=''; td.style.border='1px solid var(--border)'; }
    }
  }
  for (let c = 0; c < 26; c++) {
    const cTh = document.getElementById(`vth-col-${c}`);
    if (cTh) cTh.style.cssText = 'padding:4px 5px;background:var(--bg3);color:var(--text3);border:1px solid var(--border);min-width:22px;text-align:center;position:sticky;top:0;z-index:2;';
  }

  const pr = vigPairs[vigActiveStep];
  // Highlight col (plaintext)
  const colTh = document.getElementById(`vth-col-${pr.pv}`);
  if (colTh) colTh.style.cssText = 'padding:4px 5px;background:var(--cyan2);color:var(--cyan);border:1.5px solid var(--cyan);min-width:22px;text-align:center;font-weight:700;position:sticky;top:0;z-index:2;';
  // Highlight row (key)
  const rowTh = document.getElementById(`vth-row-${pr.kv}`);
  if (rowTh) rowTh.style.cssText = 'padding:4px 5px;background:var(--accent2);color:var(--amber);border:1.5px solid var(--amber);text-align:center;font-weight:700;position:sticky;left:0;z-index:1;';
  // Tint column and row
  for (let r = 0; r < 26; r++) if (r !== pr.kv) { const td = document.getElementById(`vtd-${r}-${pr.pv}`); if(td) td.style.background='rgba(8,145,178,.07)'; }
  for (let c = 0; c < 26; c++) if (c !== pr.pv) { const td = document.getElementById(`vtd-${pr.kv}-${c}`); if(td) td.style.background='rgba(217,119,6,.07)'; }
  // Highlight result cell
  const resultTd = document.getElementById(`vtd-${pr.kv}-${pr.pv}`);
  if (resultTd) {
    resultTd.style.background = 'var(--primary3)';
    resultTd.style.color = 'var(--primary)';
    resultTd.style.fontWeight = '700';
    resultTd.style.border = '2px solid var(--primary2)';
    resultTd.scrollIntoView({ block:'nearest', inline:'nearest', behavior:'smooth' });
  }
  // Info card
  const info = document.getElementById('vigInfoCard');
  if (info) {
    info.style.display = 'flex';
    info.style.flexWrap = 'wrap';
    info.style.gap = '.4rem 1.2rem';
    info.innerHTML = `
      <span>PLAIN: <strong style="color:var(--text)">${pr.p}</strong> <span style="color:var(--text4)">(pos ${pr.pv})</span></span>
      <span style="color:var(--text4)">kolom ke-${pr.pv+1}</span>
      <span>KUNCI: <strong style="color:var(--accent)">${pr.k}</strong> <span style="color:var(--text4)">(geser ${pr.kv})</span></span>
      <span style="color:var(--text4)">baris ke-${pr.kv+1}</span>
      <span>HASIL: <strong style="color:var(--primary);font-size:.95rem">${pr.c}</strong>
        <span style="color:var(--text4);font-size:.65rem">(${pr.pv}+${pr.kv}=${pr.pv+pr.kv}${pr.pv+pr.kv>25?` mod26=${pr.cv}`:''} = ${pr.c})</span></span>`;
  }
}

document.getElementById('vigInput')?.addEventListener('input', function(){ this.value = this.value.toUpperCase().replace(/[^A-Z]/g,''); });
document.getElementById('vigKey')?.addEventListener('input',   function(){ this.value = this.value.toUpperCase().replace(/[^A-Z]/g,''); });

// ─── Columnar Simulation ──────────────────────────────────────────────────────
function updateColumnar() {
  const text    = (document.getElementById('colInput').value.toUpperCase().replace(/[^A-Z]/g,'') || 'ATTACK').slice(0,12);
  const keyRaw  = (document.getElementById('colKey').value.toUpperCase().replace(/[^A-Z]/g,'') || 'KEY').slice(0,8);
  document.getElementById('colInput').value = text;
  document.getElementById('colKey').value   = keyRaw;

  const numCols = keyRaw.length;
  const pad     = (numCols - text.length % numCols) % numCols;
  const padded  = text + 'X'.repeat(pad);
  const numRows = padded.length / numCols;
  const grid    = [];
  for (let r = 0; r < numRows; r++) grid.push(padded.slice(r * numCols, (r+1) * numCols).split(''));
  const order   = [...keyRaw].map((c,i) => ({c,i})).sort((a,b) => a.c < b.c ? -1 : a.c > b.c ? 1 : 0).map(x => x.i);

  let output = '';
  for (const col of order) for (const row of grid) output += row[col];

  const demo = document.getElementById('colDemo');
  // Order row
  let html = `<div style="display:flex;gap:.3rem;margin-bottom:.5rem;flex-wrap:wrap;align-items:center">
    <span style="font-size:.65rem;font-weight:700;color:var(--text4);margin-right:.3rem">URUTAN BACA:</span>`;
  order.forEach((col, rank) => {
    html += `<span style="font-family:var(--font-mono);font-size:.68rem;padding:.18rem .5rem;background:var(--primary3);border:1.5px solid var(--primary2);color:var(--primary);border-radius:4px;font-weight:700">${rank+1}:${keyRaw[col]}</span>`;
  });
  html += '</div>';

  // Grid
  html += '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-family:var(--font-mono);font-size:.9rem">';
  // Key header
  html += '<tr>';
  for (let c = 0; c < numCols; c++) {
    html += `<th style="padding:6px 10px;background:var(--purple2);color:var(--purple);border:1.5px solid var(--purple);font-weight:700;min-width:38px;text-align:center">${keyRaw[c]}<sub style="font-size:.55rem;color:var(--text4)">(${order.indexOf(c)+1})</sub></th>`;
  }
  html += '</tr>';
  // Grid rows
  for (let r = 0; r < Math.min(numRows, 6); r++) {
    html += '<tr>';
    for (let c = 0; c < numCols; c++) {
      const isPad = r * numCols + c >= text.length;
      const isFirst = c === order[0];
      const bg    = isPad ? 'var(--bg)' : isFirst ? 'var(--primary3)' : 'var(--bg)';
      const color = isPad ? 'var(--text4)' : isFirst ? 'var(--primary)' : 'var(--text)';
      const border= isFirst ? '1.5px solid var(--primary2)' : '1px solid var(--border)';
      html += `<td style="padding:6px 10px;background:${bg};color:${color};border:${border};text-align:center;font-weight:${isFirst?'700':'400'}">${grid[r][c]}</td>`;
    }
    html += '</tr>';
  }
  html += '</table></div>';
  html += `<div style="font-size:.78rem;color:var(--text3);margin-top:.5rem">
    Kolom <strong style="color:var(--primary)">${keyRaw[order[0]]}</strong> dibaca duluan karena paling awal di urutan abjad.
  </div>`;

  demo.innerHTML = html;
  document.getElementById('colResult').innerHTML =
    `<span style="color:var(--text2)">${text}</span>
     <span style="color:var(--text3);margin:0 .5rem">+</span>
     <span style="color:var(--accent)">${keyRaw}</span>
     <span style="color:var(--text3);margin:0 .5rem">=</span>
     <span style="color:var(--primary);font-weight:bold">${output}</span>`;
}

document.getElementById('colInput')?.addEventListener('input', function(){ this.value = this.value.toUpperCase().replace(/[^A-Z]/g,''); });
document.getElementById('colKey')?.addEventListener('input',   function(){ this.value = this.value.toUpperCase().replace(/[^A-Z]/g,''); });

// ─── Reading Progress Bar ─────────────────────────────────────────────────────
function initProgress() {
  const fill = document.getElementById('readProgress');
  const pct  = document.getElementById('readPct');
  if (!fill) return;
  window.addEventListener('scroll', () => {
    const docH   = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = Math.min(100, Math.round((window.scrollY / docH) * 100));
    fill.style.width = scrolled + '%';
    if (pct) pct.textContent = scrolled + '%';
  });
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const QUESTION_BANK = [
  // === DASAR KRIPTOGRAFI ===
  { q: 'Pesan asli yang belum dienkripsi disebut apa?', opts: ['Ciphertext','Plaintext','Kunci','Algoritma'], ans: 1, exp: 'Plaintext adalah pesan asli sebelum dienkripsi. Ciphertext adalah hasil setelah pesan dienkripsi.' },
  { q: 'Proses mengubah ciphertext kembali menjadi pesan asli disebut?', opts: ['Enkripsi','Hashing','Dekripsi','Kompresi'], ans: 2, exp: 'Dekripsi adalah kebalikan dari enkripsi — mengubah ciphertext kembali menjadi plaintext menggunakan kunci.' },
  { q: 'Apa yang dimaksud dengan "kunci" dalam kriptografi?', opts: ['Password akun','Informasi rahasia yang digunakan untuk enkripsi/dekripsi','Nama algoritma yang dipakai','Panjang pesan yang dienkripsi'], ans: 1, exp: 'Kunci adalah informasi rahasia yang digunakan bersama algoritma untuk mengenkripsi atau mendekripsi pesan.' },
  { q: 'Kriptografi berasal dari bahasa Yunani yang berarti?', opts: ['Tulisan tersembunyi','Kode rahasia','Sandi angka','Pesan terenkripsi'], ans: 0, exp: 'Kriptografi berasal dari "kryptos" (tersembunyi) dan "graphein" (menulis) — artinya tulisan tersembunyi.' },
  { q: 'Mana yang BUKAN termasuk tujuan kriptografi?', opts: ['Menjaga kerahasiaan pesan','Memastikan integritas data','Mempercepat pengiriman data','Autentikasi identitas'], ans: 2, exp: 'Kriptografi bertujuan menjaga kerahasiaan, integritas, dan autentikasi — bukan mempercepat pengiriman data.' },
  { q: 'Kriptografi klasik bekerja dengan cara?', opts: ['Mengenkripsi data dalam bentuk bit','Memanipulasi huruf atau karakter teks','Menggunakan kunci publik dan privat','Mengompresi ukuran pesan'], ans: 1, exp: 'Kriptografi klasik bekerja pada level huruf/karakter, berbeda dengan kriptografi modern yang bekerja pada level bit.' },

  // === CAESAR CIPHER ===
  { q: 'Caesar Cipher dengan kunci 3 — huruf A berubah menjadi apa?', opts: ['C','D','E','B'], ans: 1, exp: 'A (posisi 0) digeser 3 langkah ke kanan = posisi 3 = huruf D.' },
  { q: 'KHOOR adalah hasil enkripsi Caesar dengan kunci 3. Apa pesan aslinya?', opts: ['WORLD','HELLO','CIPHER','KUNCI'], ans: 1, exp: 'KHOOR didekripsi dengan geser balik 3: K→H, H→E, O→L, O→L, R→O = HELLO.' },
  { q: 'Berapa jumlah kemungkinan kunci pada Caesar Cipher (alfabet 26 huruf)?', opts: ['26','25','13','52'], ans: 1, exp: 'Hanya ada 25 kunci yang berguna (1-25). Kunci 0 atau 26 tidak mengubah pesan sama sekali.' },
  { q: 'Huruf Z dienkripsi Caesar dengan kunci 2. Hasilnya?', opts: ['Y','A','B','X'], ans: 2, exp: 'Z (posisi 25) + 2 = 27, mod 26 = 1 = huruf B. Hitungannya memutar balik ke awal alfabet.' },
  { q: 'Mengapa Caesar Cipher dianggap tidak aman?', opts: ['Algoritmanya terlalu rumit','Hanya ada 25 kemungkinan kunci, mudah ditebak paksa','Tidak bisa enkripsi angka','Kuncinya terlalu panjang'], ans: 1, exp: 'Dengan hanya 25 kemungkinan kunci, penyerang bisa mencoba semua kemungkinan (brute force) dalam hitungan detik.' },
  { q: 'Caesar Cipher dengan kunci 13 sering disebut juga?', opts: ['XOR Cipher','ROT13','Base64','Shift Cipher'], ans: 1, exp: 'ROT13 adalah Caesar Cipher dengan geser 13. Karena 26/2=13, enkripsi dan dekripsinya menggunakan operasi yang sama.' },
  { q: 'Enkripsi Caesar: huruf M dengan kunci 5 menghasilkan?', opts: ['R','S','Q','P'], ans: 0, exp: 'M adalah huruf ke-13 (0-index: 12). 12 + 5 = 17 = huruf R.' },
  { q: 'Caesar Cipher termasuk jenis cipher apa?', opts: ['Transposition cipher','Substitution cipher','Block cipher','Stream cipher'], ans: 1, exp: 'Caesar adalah substitution cipher — setiap huruf diganti dengan huruf lain berdasarkan aturan tertentu.' },

  // === VIGENERE CIPHER ===
  { q: 'Apa perbedaan utama Vigenere dengan Caesar Cipher?', opts: ['Vigenere tidak menggunakan kunci','Vigenere memakai kata sebagai kunci bukan satu angka','Vigenere hanya bisa enkripsi angka','Vigenere tidak mengubah huruf sama sekali'], ans: 1, exp: 'Vigenere menggunakan kata kunci. Setiap huruf kunci memberikan nilai geser yang berbeda-beda.' },
  { q: 'Pada Vigenere Cipher, huruf A di kunci memberikan geser sebesar?', opts: ['1','0','26','Tergantung plaintext'], ans: 1, exp: 'A adalah huruf pertama (posisi 0), sehingga memberikan geser 0 — huruf tidak berubah.' },
  { q: 'Enkripsi Vigenere: plaintext A dengan kunci K menghasilkan?', opts: ['A','K','L','J'], ans: 1, exp: 'K adalah huruf ke-11 (nilai 10). A (0) + K (10) = 10 = huruf K.' },
  { q: 'Mengapa Vigenere lebih aman dari Caesar?', opts: ['Menggunakan huruf yang lebih banyak','Huruf yang sama di plaintext bisa menghasilkan ciphertext yang berbeda','Kuncinya tidak bisa ditebak','Panjang pesannya selalu berubah'], ans: 1, exp: 'Karena kuncinya berulang dengan variasi, huruf "A" yang sama bisa jadi "K", "F", atau huruf lain tergantung posisinya.' },
  { q: 'Jika kunci Vigenere lebih pendek dari pesan, apa yang terjadi?', opts: ['Sisanya tidak dienkripsi','Kunci diulang dari awal','Enkripsi gagal','Kunci diperpanjang otomatis dengan huruf A'], ans: 1, exp: 'Kunci diulang (repeated) terus menerus sepanjang pesan. Ini disebut "running key" yang berulang.' },
  { q: 'Siapa yang mempopulerkan cipher yang dikenal sebagai Vigenere?', opts: ['Julius Caesar','Blaise de Vigenère','Alan Turing','Leon Battista Alberti'], ans: 1, exp: 'Blaise de Vigenère adalah diplomat Prancis yang mempopulerkan cipher ini di abad ke-16, meski bukan ia yang pertama menemukannya.' },

  // === COLUMNAR TRANSPOSITION ===
  { q: 'Pada Columnar Transposition, apa yang berubah dari pesan asli?', opts: ['Huruf-hurufnya diganti huruf lain','Huruf dihapus yang tidak penting','Urutan/posisi hurufnya diacak','Semua huruf diubah menjadi angka'], ans: 2, exp: 'Columnar Transposition tidak mengubah huruf — hanya mengacak posisi/urutan huruf dengan cara ditata dalam grid.' },
  { q: 'Columnar Transposition termasuk jenis cipher apa?', opts: ['Substitution cipher','Transposition cipher','Hash cipher','Asymmetric cipher'], ans: 1, exp: 'Transposition cipher mengacak posisi huruf tanpa menggantinya. Berbeda dengan substitution cipher yang mengganti hurufnya.' },
  { q: 'Pada Columnar Transposition, apa fungsi kunci yang digunakan?', opts: ['Menentukan berapa huruf yang digeser','Menentukan urutan kolom saat membaca ciphertext','Menentukan jumlah baris grid','Menentukan huruf pengganti'], ans: 1, exp: 'Kunci menentukan urutan pengambilan kolom. Kolom diambil berdasarkan urutan alfabetis huruf-huruf kunci.' },
  { q: 'Kelemahan Columnar Transposition adalah?', opts: ['Terlalu banyak kunci yang mungkin','Huruf yang digunakan tetap sama sehingga bisa dianalisis frekuensinya','Tidak bisa mendekripsi pesan','Hanya bisa digunakan untuk pesan pendek'], ans: 1, exp: 'Karena huruf tidak diganti, analisis frekuensi huruf bisa membantu memecahkan cipher ini.' },
  { q: 'Apa yang dimaksud dengan "padding" pada Columnar Transposition?', opts: ['Menambah spasi antar kata','Mengulang kunci jika terlalu pendek','Menambah huruf pengisi (misal X) agar grid penuh','Memotong pesan yang terlalu panjang'], ans: 2, exp: 'Jika pesan tidak mengisi grid secara penuh, huruf pengisi (biasanya X) ditambahkan di akhir agar semua kolom memiliki panjang sama.' },

  // === PERBANDINGAN & UMUM ===
  { q: 'Mana yang termasuk transposition cipher?', opts: ['Caesar Cipher','Vigenere Cipher','Columnar Transposition','ROT13'], ans: 2, exp: 'Columnar Transposition mengacak posisi huruf (transposition). Caesar dan Vigenere mengganti huruf (substitution).' },
  { q: 'Analisis frekuensi huruf paling efektif untuk memecahkan cipher mana?', opts: ['Columnar Transposition','Vigenere dengan kunci panjang','Caesar Cipher','One-Time Pad'], ans: 2, exp: 'Caesar Cipher mudah dipecahkan dengan analisis frekuensi karena setiap huruf selalu digeser dengan jumlah yang sama.' },
  { q: 'Mana urutan tingkat keamanan dari yang paling lemah ke kuat?', opts: ['Caesar → Columnar → Vigenere','Caesar → Vigenere → Columnar','Columnar → Caesar → Vigenere','Vigenere → Caesar → Columnar'], ans: 0, exp: 'Caesar paling lemah (25 kunci), Columnar lebih baik tapi rentan analisis frekuensi, Vigenere lebih kuat karena kunci bervariasi.' },
  { q: 'Huruf E paling sering muncul dalam bahasa Inggris. Teknik apa yang memanfaatkan ini?', opts: ['Brute force','Analisis frekuensi','Dictionary attack','Rainbow table'], ans: 1, exp: 'Analisis frekuensi memanfaatkan fakta bahwa huruf tertentu lebih sering muncul dalam bahasa tertentu untuk memecahkan cipher.' },
  { q: 'Apa yang membuat One-Time Pad menjadi cipher yang sempurna secara teori?', opts: ['Algoritmanya sangat rumit','Kuncinya sepanjang pesan dan hanya digunakan sekali','Menggunakan komputer untuk enkripsi','Kuncinya sangat pendek'], ans: 1, exp: 'One-Time Pad menggunakan kunci acak sepanjang pesan yang hanya dipakai sekali — secara matematis tidak bisa dipecahkan.' },
];

// Shuffle array helper
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick 5 random questions from bank
function pickQuestions() {
  return shuffleArray(QUESTION_BANK).slice(0, 5);
}

let QUESTIONS = pickQuestions();

let userAnswers = [], quizDone = false;

function initQuiz() {
  userAnswers = new Array(QUESTIONS.length).fill(null);
  quizDone    = false;
  document.getElementById('quizResult').style.display = 'none';
  renderQuiz();
}

function renderQuiz() {
  const wrap = document.getElementById('quizWrap');
  wrap.innerHTML = '';
  QUESTIONS.forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'quiz-card';
    div.innerHTML = `
      <div class="quiz-q-num">Soal ${qi+1} dari ${QUESTIONS.length}</div>
      <div class="quiz-q-text">${q.q}</div>
      <div class="quiz-opts" id="opts-${qi}">
        ${q.opts.map((opt,oi) => `
          <button class="quiz-opt" onclick="selectOpt(${qi},${oi})">
            <span class="quiz-opt-letter">${'ABCD'[oi]}</span>
            <span>${opt}</span>
          </button>`).join('')}
      </div>
      <div class="quiz-explain" id="exp-${qi}" style="display:none">${q.exp}</div>`;
    wrap.appendChild(div);
  });
  const submitBtn = document.createElement('button');
  submitBtn.className = 'quiz-submit-btn';
  submitBtn.id = 'quizSubmit';
  submitBtn.textContent = 'Lihat Hasil';
  submitBtn.onclick = submitQuiz;
  submitBtn.disabled = true;
  wrap.appendChild(submitBtn);
}

function selectOpt(qi, oi) {
  if (quizDone) return;
  userAnswers[qi] = oi;
  document.querySelectorAll(`#opts-${qi} .quiz-opt`).forEach((btn,i) => btn.classList.toggle('selected', i === oi));
  document.getElementById('quizSubmit').disabled = userAnswers.some(a => a === null);
}

function submitQuiz() {
  quizDone = true;
  let score = 0;
  QUESTIONS.forEach((q,qi) => {
    document.querySelectorAll(`#opts-${qi} .quiz-opt`).forEach((btn,oi) => {
      btn.disabled = true;
      if (oi === q.ans) btn.classList.add('correct');
      else if (oi === userAnswers[qi] && oi !== q.ans) btn.classList.add('wrong');
    });
    if (userAnswers[qi] === q.ans) score++;
    document.getElementById(`exp-${qi}`).style.display = 'block';
  });
  document.getElementById('quizSubmit').style.display = 'none';

  const pct  = Math.round((score / QUESTIONS.length) * 100);
  const msgs = [
    { min:0,  max:39,  msg:'Jangan menyerah! Baca lagi materinya ya 💪', cls:'bad'   },
    { min:40, max:59,  msg:'Lumayan! Masih ada beberapa yang perlu dipelajari ulang 📖', cls:'ok' },
    { min:60, max:79,  msg:'Bagus! Kamu sudah paham sebagian besar materinya 👍', cls:'good'  },
    { min:80, max:100, msg:'Luar biasa! Kamu sudah paham kriptografi klasik! 🎉', cls:'great' },
  ];
  const { msg, cls } = msgs.find(m => pct >= m.min && pct <= m.max);
  document.getElementById('quizScore').innerHTML =
    `<span class="score-num score-${cls}">${score}</span><span class="score-total">/${QUESTIONS.length}</span>
     <span class="score-pct">(${pct}%)</span>`;
  document.getElementById('quizMsg').textContent = msg;
  const result = document.getElementById('quizResult');
  result.style.display = 'block';
  result.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

// ─── Ganti Pertanyaan dari bank soal lokal ────────────────────────────────────
function gantiPertanyaan() {
  // Ambil 5 soal baru yang berbeda dari yang sekarang
  let newQuestions;
  let attempts = 0;
  do {
    newQuestions = pickQuestions();
    attempts++;
  } while (attempts < 10 && newQuestions[0].q === QUESTIONS[0].q);

  QUESTIONS = newQuestions;
  document.getElementById('quizResult').style.display = 'none';
  initQuiz();
  document.getElementById('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Smooth scroll TOC ────────────────────────────────────────────────────────
document.querySelectorAll('.edu-toc-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
initProgress();
initQuiz();
updateCaesar();
buildVigTable();
updateVigenere();
updateColumnar();
