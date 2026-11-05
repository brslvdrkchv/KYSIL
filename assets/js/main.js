/**
 * SNT IMENI KYSIL • INTERACTIVE CLIENT APPLICATION
 * Features: Neural Canvas, Circles Explorer, Audio FX, Application Modal, Smooth Nav
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initCirclesCatalog();
  initAudioFx();
  initModal();
  initClipboardActions();
  initNavScroll();
});

/* ==========================================================================
   1. NEURAL / BIO-PARTICLE BACKGROUND CANVAS
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
  const maxDistance = 140;

  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.4 ? 'rgba(37, 99, 235, ' : 'rgba(6, 182, 212, ';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse gentle interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = (1 - dist / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. SCIENTIFIC CIRCLES CATALOG
   ========================================================================== */
function initCirclesCatalog() {
  const container = document.getElementById('circles-grid');
  const searchInput = document.getElementById('circle-search');
  const countBadge = document.getElementById('circles-count');
  const filterButtons = document.querySelectorAll('.filter-btn');

  if (!container || typeof SNT_CIRCLES === 'undefined') return;

  let currentCategory = 'all';
  let searchQuery = '';

  function render() {
    const query = searchQuery.toLowerCase().trim();

    const filtered = SNT_CIRCLES.filter((item) => {
      const matchCategory =
        currentCategory === 'all' || item.category === currentCategory;
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.faculty.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });

    if (countBadge) {
      countBadge.textContent = `Знайдено: ${filtered.length} із ${SNT_CIRCLES.length}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <p style="font-family: var(--font-druk); font-size: 1.1rem; color: #ffffff; margin-bottom: 0.5rem;">
            Гуртків не знайдено
          </p>
          <p style="font-size: 0.9rem;">Спробуйте змінити пошуковий запит або категорію</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map(
        (c) => `
        <div class="circle-card" data-category="${c.category}">
          <div>
            <div class="circle-card-top">
              <span class="circle-cat-badge">${c.categoryLabel}</span>
              <span class="circle-freq-badge">⏱ ${c.schedule}</span>
            </div>
            <h3 class="circle-title">${c.name}</h3>
            <div class="circle-faculty">${c.faculty}</div>
            <p class="circle-desc">${c.description}</p>
          </div>
          <div class="circle-footer">
            <button class="btn-circle-join" onclick="openJoinModal('${c.name.replace(/'/g, "\\'")}')">
              Вступити в СНГ
            </button>
            <a href="${c.telegram}" target="_blank" rel="noopener" class="circle-channel-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              Telegram
            </a>
          </div>
        </div>
      `
      )
      .join('');
  }

  // Filter Click Handler
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      playUiSound('click');
      render();
    });
  });

  // Search Input Handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });
  }

  // Initial Render
  render();
}

/* ==========================================================================
   3. WEB AUDIO API SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioFx() {
  const toggleBtn = document.getElementById('sound-toggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      toggleBtn.style.opacity = soundEnabled ? '1' : '0.4';
      showToast(soundEnabled ? 'Звукові ефекти увімкнено' : 'Звукові ефекти вимкнено');
      if (soundEnabled) playUiSound('toggle');
    });
  }
}

function playUiSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'toggle') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (e) {
    // AudioContext blocked by browser policy until interaction
  }
}

/* ==========================================================================
   4. APPLICATION MODAL SYSTEM
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('join-modal');
  const openButtons = document.querySelectorAll('.js-open-modal');
  const closeButton = document.getElementById('modal-close');
  const form = document.getElementById('snt-apply-form');

  if (!modal) return;

  window.openJoinModal = function (prefilledCircle = '') {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    playUiSound('click');

    const select = document.getElementById('modal-circle-select');
    if (select && prefilledCircle) {
      select.value = prefilledCircle;
    }
  };

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openJoinModal();
    });
  });

  if (closeButton) closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      playUiSound('success');
      showToast('Заявку успішно надіслано! Ми зв’яжемося з вами.');
      setTimeout(() => {
        closeModal();
        form.reset();
      }, 1400);
    });
  }
}

/* ==========================================================================
   5. CLIPBOARD ACTIONS & TOAST
   ========================================================================== */
function initClipboardActions() {
  window.copyToClipboard = function (text, message = 'Скопійовано в буфер!') {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        playUiSound('click');
        showToast(message);
      })
      .catch(() => {
        showToast('Не вдалося скопіювати');
      });
  };
}

let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ==========================================================================
   6. NAVIGATION & SMOOTH SCROLL
   ========================================================================== */
function initNavScroll() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksList = document.querySelector('.nav-links');

  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navLinksList.style.display === 'flex';
      navLinksList.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinksList.style.flexDirection = 'column';
        navLinksList.style.position = 'absolute';
        navLinksList.style.top = '100%';
        navLinksList.style.left = '0';
        navLinksList.style.right = '0';
        navLinksList.style.background = 'rgba(9, 14, 26, 0.95)';
        navLinksList.style.padding = '1.5rem';
        navLinksList.style.borderRadius = '16px';
        navLinksList.style.marginTop = '0.5rem';
      }
    });
  }

  // Active section observer
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.pageYOffset + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
