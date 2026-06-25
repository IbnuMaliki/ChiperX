// Algo card entrance animation — modal sudah dipindah ke halaman Tentang Kriptografi
document.querySelectorAll('.algo-card').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(16px)';
  setTimeout(() => {
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, 400 + i * 80);
});
