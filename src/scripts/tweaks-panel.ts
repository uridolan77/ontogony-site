type TempMode = 'ivory' | 'bone' | 'graphite';
type DensityMode = 'dense' | 'canonical' | 'generous';

type TweaksState = {
  temp: TempMode;
  density: DensityMode;
};

const STORAGE_KEY = 'ontogony.tweaks';
const DEFAULTS: TweaksState = {
  temp: 'ivory',
  density: 'canonical',
};

function isTemp(value: unknown): value is TempMode {
  return value === 'ivory' || value === 'bone' || value === 'graphite';
}

function isDensity(value: unknown): value is DensityMode {
  return value === 'dense' || value === 'canonical' || value === 'generous';
}

function parseStoredState(raw: string | null): TweaksState {
  if (!raw) return DEFAULTS;
  try {
    const parsed = JSON.parse(raw) as Partial<TweaksState>;
    return {
      temp: isTemp(parsed.temp) ? parsed.temp : DEFAULTS.temp,
      density: isDensity(parsed.density) ? parsed.density : DEFAULTS.density,
    };
  } catch {
    return DEFAULTS;
  }
}

(function mountTweaksPanel() {
  if (typeof window === 'undefined') return;

  const state = parseStoredState(localStorage.getItem(STORAGE_KEY));

  const applyState = () => {
    document.documentElement.setAttribute('data-temp', state.temp);
    document.documentElement.setAttribute('data-density', state.density);
    document.body.setAttribute('data-temp', state.temp);
    document.body.setAttribute('data-density', state.density);
  };

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage failures in private mode or strict browser settings.
    }
  };

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'tweaks-trigger';
  trigger.textContent = 'Tweaks';
  trigger.setAttribute('aria-label', 'Open visual tweaks');
  trigger.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('section');
  panel.className = 'tweaks-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Visual tweaks');
  panel.hidden = true;

  panel.innerHTML = `
    <div class="tweaks-head">
      <span>Tweaks</span>
      <button type="button" class="tweaks-close" aria-label="Close tweaks">x</button>
    </div>
    <form class="tweaks-form">
      <fieldset class="tweaks-group">
        <legend>Temperature</legend>
        <div class="tweaks-options">
          <label class="tweaks-option"><input type="radio" name="temp" value="ivory"> Ivory</label>
          <label class="tweaks-option"><input type="radio" name="temp" value="bone"> Bone</label>
          <label class="tweaks-option"><input type="radio" name="temp" value="graphite"> Graphite</label>
        </div>
      </fieldset>
      <fieldset class="tweaks-group">
        <legend>Density</legend>
        <div class="tweaks-options">
          <label class="tweaks-option"><input type="radio" name="density" value="dense"> Dense</label>
          <label class="tweaks-option"><input type="radio" name="density" value="canonical"> Canonical</label>
          <label class="tweaks-option"><input type="radio" name="density" value="generous"> Generous</label>
        </div>
      </fieldset>
    </form>
  `;

  const closeButton = panel.querySelector('.tweaks-close') as HTMLButtonElement;

  const syncInputs = () => {
    const tempInput = panel.querySelector(
      `input[name="temp"][value="${state.temp}"]`,
    ) as HTMLInputElement | null;
    const densityInput = panel.querySelector(
      `input[name="density"][value="${state.density}"]`,
    ) as HTMLInputElement | null;

    if (tempInput) tempInput.checked = true;
    if (densityInput) densityInput.checked = true;
  };

  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      const firstInput = panel.querySelector('input') as HTMLInputElement | null;
      if (firstInput) firstInput.focus();
    }
  };

  const updateOffsets = () => {
    const hasRibbon = Boolean(document.querySelector('.path-ribbon'));
    const bottom = hasRibbon ? 76 : 16;
    trigger.style.setProperty('--tweaks-bottom', `${bottom}px`);
    panel.style.setProperty('--tweaks-panel-bottom', `${bottom + 40}px`);
  };

  panel.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name === 'temp' && isTemp(target.value)) {
      state.temp = target.value;
      applyState();
      persist();
    }

    if (target.name === 'density' && isDensity(target.value)) {
      state.density = target.value;
      applyState();
      persist();
    }
  });

  trigger.addEventListener('click', () => {
    setOpen(panel.hidden);
  });

  closeButton.addEventListener('click', () => {
    setOpen(false);
    trigger.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      trigger.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (panel.hidden) return;
    const target = event.target as Node;
    if (!panel.contains(target) && !trigger.contains(target)) {
      setOpen(false);
    }
  });

  document.body.appendChild(trigger);
  document.body.appendChild(panel);

  applyState();
  syncInputs();
  updateOffsets();

  const observer = new MutationObserver(() => updateOffsets());
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', updateOffsets);
})();
