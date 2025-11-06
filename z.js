// z.js — modern micro-animations & UX helpers (no libs)

/* ========== 0) Helpers ========== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== 1) Theme toggle (Dark/Light + persist + system default) ========== */
document.addEventListener('DOMContentLoaded', () => {
  const checkbox = $('#checkboxInput');
  const body = document.body;

  const saved = localStorage.getItem('theme'); // 'light' | 'dark' | null
  const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const applyTheme = (mode) => {
    if (mode === 'light') {
      body.classList.add('light');
      checkbox?.checked = true;
    } else {
      body.classList.remove('light');
      checkbox?.checked = false;
    }
  };

  applyTheme(saved ?? (systemLight ? 'light' : 'dark'));

  // Live update on system change (only if user hasn't explicitly chosen)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  mediaQuery.addEventListener?.('change', (e) => {
    const saved2 = localStorage.getItem('theme');
    if (!saved2) applyTheme(e.matches ? 'light' : 'dark');
  });

  checkbox?.addEventListener('change', () => {
    const mode = checkbox.checked ? 'light' : 'dark';
    localStorage.setItem('theme', mode);
    applyTheme(mode);
  });
});

/* ========== 2) Animated nav indicator (spring) ========== */
document.addEventListener('DOMContentLoaded', () => {
  const navList = $('.navbar .nav-links');
  const items = $$('.navbar .nav-links a');
  if (!navList || !items.length) return;

  // Create indicator element (self-styled)
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  Object.assign(indicator.style, {
    position: 'absolute',
    bottom: '-6px',
    height: '2px',
    background: 'linear-gradient(90deg, #ff2b85, #a365ff)',
    borderRadius: '999px',
    boxShadow: '0 0 18px rgba(163,101,255,.45)',
    transform: 'translateX(0)',
    transition: prefersReduced ? 'none' : 'opacity .25s ease',
    opacity: '0',
  });

  navList.style.position ||= 'relative';
  navList.appendChild(indicator);

  let targetX = 0, targetW = 0;
  let x = 0, w = 0;
  let rafId = null;

  const setTarget = (el) => {
    const rNav = navList.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    targetX = r.left - rNav.left;
    targetW = r.width;
    indicator.style.opacity = '1';
    animate();
  };

  const animate = () => {
    if (prefersReduced) {
      x = targetX; w = targetW;
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.width = `${w}px`;
      return;
    }
    cancelAnimationFrame(rafId);
    const step = () => {
      x = lerp(x, targetX, 0.18);
      w = lerp(w, targetW, 0.18);
      if (Math.abs(x - targetX) < 0.5) x = targetX;
      if (Math.abs(w - targetW) < 0.5) w = targetW;
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.width = `${w}px`;
      if (x !== targetX || w !== targetW) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  };

  setTimeout(() => setTarget(items[0]), 100);

  items.forEach(a => {
    a.addEventListener('mouseenter', () => setTarget(a));
    a.addEventListener('focus', () => setTarget(a));
  });

  items.forEach(a => a.addEventListener('click', () => {
    items.forEach(i => i.classList.remove('active'));
    a.classList.add('active');
    setTarget(a);
  }));

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const active = $('.navbar .nav-links a.active') || items[0];
      active && setTarget(active);
    }, 200);
  });
});

/* ========== 3) Card reveal on scroll (IntersectionObserver) ========== */
document.addEventListener('DOMContentLoaded', () => {
  const cards = $$('.project-card');
  if (!cards.length) return;

  const reveal = (el, i) => {
    const delay = prefersReduced ? 0 : Math.min(i * 60, 300);
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px) scale(.98)';
    setTimeout(() => {
      el.style.transition = prefersReduced ? 'none' : 'transform .55s cubic-bezier(.2,.8,.2,1), opacity .55s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    }, delay);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          reveal(e.target, Number(e.target.dataset._i || 0));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach((c, i) => { c.dataset._i = i; io.observe(c); });
  } else {
    cards.forEach(reveal);
  }
});




function activate(e) {
  if (!slider) return;
  const items = slider.querySelectorAll('.item');
  if (!items.length) return;

  if (e.target.matches('.next')) {
    slider.append(items[0]);
  }
  if (e.target.matches('.prev')) {
    slider.prepend(items[items.length - 1]);
  }
}

document.addEventListener('click', activate, false);


