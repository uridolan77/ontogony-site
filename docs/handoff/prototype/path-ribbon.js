// Path ribbon — persists across pages via localStorage.
// Reads { name, slug, stops:[{title, href, kind}], step } and renders bottom bar.
(function () {
  var raw;
  try { raw = JSON.parse(localStorage.getItem('ontogony.path') || 'null'); } catch (e) { raw = null; }
  if (!raw || !raw.stops || !raw.stops.length) return;

  var here = location.pathname.split('/').pop();
  var step = -1;
  raw.stops.forEach(function (s, i) {
    var slug = (s.href || '').split('/').pop();
    if (slug && slug === here) step = i;
  });
  if (step >= 0) raw.step = step;

  var el = document.createElement('nav');
  el.className = 'path-ribbon';
  el.setAttribute('role', 'navigation');
  el.setAttribute('aria-label', 'Reading path');

  var html = '<span class="label-name">PATH · ' + escapeHtml(raw.name) + '</span>';
  raw.stops.forEach(function (s, i) {
    if (i > 0) html += '<span class="sep">·</span>';
    var n = String(i + 1).padStart(2, '0');
    var cur = (i === raw.step) ? ' aria-current="true"' : '';
    var prefix = (i === raw.step) ? '<span class="step-num">' + n + '</span>' : '<span class="step-num">' + n + '</span>';
    html += '<a href="' + s.href + '"' + cur + '>' + prefix + escapeHtml(s.title) + '</a>';
  });
  el.innerHTML = html;
  document.body.appendChild(el);
  document.body.style.paddingBottom = '60px';

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
})();
