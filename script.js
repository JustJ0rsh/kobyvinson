// Count-up animation for stats
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  if (!Number.isFinite(target)) return;
  const suffix = el.querySelector('.tiny');
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(target * eased).toLocaleString();
    el.childNodes[0].nodeValue = value;
    if (t < 1) requestAnimationFrame(step);
  };
  // preserve .tiny suffix
  el.textContent = '0';
  if (suffix) el.appendChild(suffix);
  requestAnimationFrame(step);
};

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.stat .n').forEach((el) => io.observe(el));

// Copy-to-clipboard for the share button
const shareBtn = document.getElementById('share');
const toast = document.getElementById('share-toast');
if (shareBtn && toast) {
  shareBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.textContent = 'Link copied. Go ruin his day.';
    } catch {
      toast.textContent = window.location.href;
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  });
}
