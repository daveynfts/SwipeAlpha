let current = 0;
const total = 12;

function showSlide(n) {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  document.getElementById(`slide-${n}`).classList.add('active');
  document.getElementById('slideCounter').textContent = `${n + 1} / ${total}`;
  document.getElementById('progressFill').style.width = `${((n + 1) / total) * 100}%`;
}

function nextSlide() {
  if (current < total - 1) { current++; showSlide(current); }
}

function prevSlide() {
  if (current > 0) { current--; showSlide(current); }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
});

// Touch swipe
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
});

showSlide(0);
