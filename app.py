from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

# ─── Caesar Cipher ────────────────────────────────────────────────────────────
def caesar_encrypt(text, shift):
    shift = int(shift) % 26
    result = []
    for ch in text:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return ''.join(result)

def caesar_decrypt(text, shift):
    return caesar_encrypt(text, -int(shift))

# ─── Vigenere Cipher ──────────────────────────────────────────────────────────
def vigenere_encrypt(text, key):
    key = key.upper()
    key = ''.join(c for c in key if c.isalpha())
    if not key:
        return text
    result = []
    ki = 0
    for ch in text:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            shift = ord(key[ki % len(key)]) - ord('A')
            result.append(chr((ord(ch) - base + shift) % 26 + base))
            ki += 1
        else:
            result.append(ch)
    return ''.join(result)

def vigenere_decrypt(text, key):
    key = key.upper()
    key = ''.join(c for c in key if c.isalpha())
    if not key:
        return text
    result = []
    ki = 0
    for ch in text:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            shift = ord(key[ki % len(key)]) - ord('A')
            result.append(chr((ord(ch) - base - shift) % 26 + base))
            ki += 1
        else:
            result.append(ch)
    return ''.join(result)

# ─── Columnar Transposition Cipher ────────────────────────────────────────────
def columnar_encrypt(text, key):
    key = key.upper()
    key_clean = ''.join(c for c in key if c.isalpha())
    if not key_clean:
        return text
    num_cols = len(key_clean)
    text_clean = ''.join(c for c in text if c.isalpha()).upper()
    pad = (num_cols - len(text_clean) % num_cols) % num_cols
    text_clean += 'X' * pad

    num_rows = len(text_clean) // num_cols
    grid = [list(text_clean[i*num_cols:(i+1)*num_cols]) for i in range(num_rows)]

    order = sorted(range(num_cols), key=lambda i: key_clean[i])
    result = []
    for col in order:
        for row in grid:
            result.append(row[col])
    return ''.join(result)

def columnar_decrypt(text, key):
    key = key.upper()
    key_clean = ''.join(c for c in key if c.isalpha())
    if not key_clean:
        return text
    num_cols = len(key_clean)
    text_clean = ''.join(c for c in text if c.isalpha()).upper()
    num_rows = math.ceil(len(text_clean) / num_cols)

    order = sorted(range(num_cols), key=lambda i: key_clean[i])
    col_lengths = [num_rows] * num_cols
    extra = len(text_clean) % num_cols
    if extra:
        for col in order[extra:]:
            col_lengths[col] -= 1

    columns = {}
    idx = 0
    for col in order:
        columns[col] = list(text_clean[idx:idx + col_lengths[col]])
        idx += col_lengths[col]

    result = []
    for row in range(num_rows):
        for col in range(num_cols):
            if row < len(columns[col]):
                result.append(columns[col][row])
    return ''.join(result)

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tentang-kriptografi')
def tentang_kriptografi():
    return render_template('tentang_kriptografi.html')

@app.route('/encrypt')
def encrypt_page():
    return render_template('encrypt.html')

@app.route('/decrypt')
def decrypt_page():
    return render_template('decrypt.html')

@app.route('/api/encrypt', methods=['POST'])
def api_encrypt():
    data = request.get_json()
    text = data.get('text', '')
    algo = data.get('algorithm', '')
    key  = data.get('key', '')

    if not text:
        return jsonify({'error': 'Teks tidak boleh kosong'}), 400
    if not key:
        return jsonify({'error': 'Key tidak boleh kosong'}), 400

    try:
        if algo == 'caesar':
            if not key.lstrip('-').isdigit():
                return jsonify({'error': 'Caesar: Key harus berupa angka'}), 400
            result = caesar_encrypt(text, key)
        elif algo == 'vigenere':
            result = vigenere_encrypt(text, key)
        elif algo == 'columnar':
            result = columnar_encrypt(text, key)
        else:
            return jsonify({'error': 'Algoritma tidak dikenali'}), 400

        return jsonify({'result': result, 'algorithm': algo, 'key': key})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/decrypt', methods=['POST'])
def api_decrypt():
    data = request.get_json()
    text = data.get('text', '')
    algo = data.get('algorithm', '')
    key  = data.get('key', '')

    if not text:
        return jsonify({'error': 'Ciphertext tidak boleh kosong'}), 400
    if not key:
        return jsonify({'error': 'Key tidak boleh kosong'}), 400

    try:
        if algo == 'caesar':
            if not key.lstrip('-').isdigit():
                return jsonify({'error': 'Caesar: Key harus berupa angka'}), 400
            result = caesar_decrypt(text, key)
        elif algo == 'vigenere':
            result = vigenere_decrypt(text, key)
        elif algo == 'columnar':
            result = columnar_decrypt(text, key)
        else:
            return jsonify({'error': 'Algoritma tidak dikenali'}), 400

        return jsonify({'result': result, 'algorithm': algo, 'key': key})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
