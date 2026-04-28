type StoredStop = {
  kind?: string;
  slug?: string;
  title: string;
  href: string;
};

type StoredPath = {
  name: string;
  slug?: string;
  step?: number;
  stops: StoredStop[];
};

(function mountPathRibbon() {
  if (typeof window === 'undefined') return;

  let raw: StoredPath | null = null;
  try {
    const text = localStorage.getItem('ontogony.path');
    raw = text ? (JSON.parse(text) as StoredPath) : null;
  } catch {
    raw = null;
  }
  if (!raw || !Array.isArray(raw.stops) || raw.stops.length === 0) return;

  const here = location.pathname.replace(/\/$/, '');
  let activeStep = -1;
  raw.stops.forEach((s, i) => {
    const stopPath = (s.href || '').replace(/\/$/, '');
    if (stopPath && stopPath === here) activeStep = i;
  });
  if (activeStep >= 0) raw.step = activeStep;

  const escape = (s: string) =>
    String(s).replace(/[&<>"']/g, (c) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return map[c];
    });

  const el = document.createElement('nav');
  el.className = 'path-ribbon';
  el.setAttribute('role', 'navigation');
  el.setAttribute('aria-label', 'Reading path');

  let html = `<span class="label-name">PATH · ${escape(raw.name)}</span>`;
  raw.stops.forEach((s, i) => {
    if (i > 0) html += '<span class="sep">·</span>';
    const n = String(i + 1).padStart(2, '0');
    const cur = i === raw!.step ? ' aria-current="true"' : '';
    html += `<a href="${s.href}"${cur}><span class="step-num">${n}</span>${escape(
      s.title,
    )}</a>`;
  });
  el.innerHTML = html;
  document.body.appendChild(el);
  document.body.style.paddingBottom = '60px';
})();
