// Auto-discover photos in /images (photo-1.jpg, photo-2.jpg, ...).
// Drop any new photo-N.{jpg,jpeg,png,webp} in the folder and it will appear.
const GALLERY_CAPTIONS = [
  'Commandeered. Returned. Mostly intact.',
  'Surveying his alleged property.',
  'The corridor senses a presence.',
  'Golden hour. Taking notes.',
  'The skyline kindly cooperates.',
  'A table for one, set for a legend.',
  'Caught mid-thought. The thought was snacks.',
  'Appears to be thriving. Hard to confirm.',
  'Posed, composed, and slightly over-caffeinated.',
  'Witness for the defense.',
  'Location undisclosed. Vibe, immaculate.',
  'Another one for the permanent record.',
];

const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_PHOTOS = 60;

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
  img.onerror = () => resolve(null);
  img.src = src;
});

const resolvePhoto = async (index) => {
  for (const ext of PHOTO_EXTENSIONS) {
    const hit = await loadImage(`images/photo-${index}.${ext}`);
    if (hit) return hit;
  }
  return null;
};

const padIndex = (n) => String(n).padStart(2, '0');

const buildCard = (photo, animDelay) => {
  const figure = document.createElement('figure');
  figure.className = 'card';
  figure.style.animationDelay = `${animDelay}ms`;

  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = `Koby Vinson, photo ${padIndex(photo.index)}`;
  img.loading = 'lazy';
  img.decoding = 'async';
  if (photo.width && photo.height) {
    img.width = photo.width;
    img.height = photo.height;
  }

  const caption = document.createElement('figcaption');
  const numSpan = document.createElement('span');
  numSpan.textContent = padIndex(photo.index);
  const text = document.createTextNode(
    ' ' + (GALLERY_CAPTIONS[photo.index - 1] || 'Further evidence, filed accordingly.')
  );
  caption.append(numSpan, text);

  figure.append(img, caption);
  figure.addEventListener('click', () => openLightbox(photo, caption.textContent.trim()));
  return figure;
};

const pickColumnCount = (width) => {
  if (width < 600) return 1;
  if (width < 900) return 2;
  return 3;
};

// Balanced masonry: place each photo into the currently shortest column,
// using the photo's natural aspect ratio to estimate rendered height.
const layoutPhotos = (grid, photos) => {
  grid.textContent = '';
  const gridWidth = grid.clientWidth || grid.getBoundingClientRect().width;
  const colCount = pickColumnCount(window.innerWidth);
  const gap = 16;
  const colWidth = Math.max(1, (gridWidth - gap * (colCount - 1)) / colCount);

  const cols = [];
  const heights = new Array(colCount).fill(0);
  for (let i = 0; i < colCount; i++) {
    const col = document.createElement('div');
    col.className = 'col';
    cols.push(col);
    grid.appendChild(col);
  }

  photos.forEach((photo, i) => {
    let target = 0;
    for (let c = 1; c < colCount; c++) {
      if (heights[c] < heights[target]) target = c;
    }
    const card = buildCard(photo, Math.min(i * 60, 600));
    cols[target].appendChild(card);
    const ratio = photo.height / photo.width;
    heights[target] += colWidth * ratio + gap;
  });
};

const renderGallery = async () => {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const indices = Array.from({ length: MAX_PHOTOS }, (_, i) => i + 1);
  const results = await Promise.all(indices.map(resolvePhoto));

  const photos = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i]) photos.push({ index: i + 1, ...results[i] });
  }

  grid.setAttribute('aria-busy', 'false');

  if (photos.length === 0) {
    grid.classList.add('empty');
    return;
  }

  layoutPhotos(grid, photos);

  let lastCols = pickColumnCount(window.innerWidth);
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    const next = pickColumnCount(window.innerWidth);
    if (next === lastCols) return;
    lastCols = next;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => layoutPhotos(grid, photos), 120);
  });
};

// Lightbox
let lightboxEl = null;
let lightboxImg = null;
let lightboxCaption = null;
const ensureLightbox = () => {
  if (lightboxEl) return;
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lb-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '\u00D7';

  lightboxImg = document.createElement('img');
  lightboxImg.alt = '';

  lightboxCaption = document.createElement('div');
  lightboxCaption.className = 'lb-caption';

  lightboxEl.append(closeBtn, lightboxImg, lightboxCaption);
  document.body.appendChild(lightboxEl);

  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl || e.target === closeBtn) {
      lightboxEl.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightboxEl.classList.remove('open');
  });
};
const openLightbox = (photo, captionText) => {
  ensureLightbox();
  lightboxImg.src = photo.src;
  lightboxCaption.textContent = captionText;
  lightboxEl.classList.add('open');
};

renderGallery();

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
