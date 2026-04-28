import { useEffect, useState } from 'react';

type Posture = 'descend' | 'ascend' | 'level';
type Temperature = 'ivory' | 'bone' | 'graphite';
type Density = 'generous' | 'canonical' | 'dense';

interface Tweaks {
  posture: Posture;
  temperature: Temperature;
  density: Density;
}

const DEFAULTS: Tweaks = {
  posture: 'descend',
  temperature: 'ivory',
  density: 'canonical',
};

const STORAGE_KEY = 'ontogony.tweaks';

const POSTURES: Posture[] = ['descend', 'ascend', 'level'];
const TEMPERATURES: Temperature[] = ['ivory', 'bone', 'graphite'];
const DENSITIES: Density[] = ['generous', 'canonical', 'dense'];

function readStored(): Tweaks {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Tweaks>;
    return {
      posture: POSTURES.includes(parsed.posture as Posture)
        ? (parsed.posture as Posture)
        : DEFAULTS.posture,
      temperature: TEMPERATURES.includes(parsed.temperature as Temperature)
        ? (parsed.temperature as Temperature)
        : DEFAULTS.temperature,
      density: DENSITIES.includes(parsed.density as Density)
        ? (parsed.density as Density)
        : DEFAULTS.density,
    };
  } catch {
    return DEFAULTS;
  }
}

function applyTweaks(t: Tweaks) {
  if (typeof document === 'undefined') return;
  document.body.setAttribute('data-posture', t.posture);
  document.body.setAttribute('data-temp', t.temperature);
  document.body.setAttribute('data-density', t.density);
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function RadioGroup<T extends string>(props: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="tweaks-section">
      <p className="tweaks-section-label">{props.label}</p>
      <div className="tweaks-radio-group" role="radiogroup" aria-label={props.label}>
        {props.options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={props.value === opt}
            className={props.value === opt ? 'is-active' : undefined}
            onClick={() => props.onChange(opt)}
          >
            {cap(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULTS);

  useEffect(() => {
    const stored = readStored();
    setTweaks(stored);
    applyTweaks(stored);
  }, []);

  const update = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    const next = { ...tweaks, [key]: value };
    setTweaks(next);
    applyTweaks(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button
        type="button"
        className="tweaks-toggle"
        aria-label={open ? 'Close tweaks' : 'Open tweaks'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        TWEAKS
      </button>

      {open && (
        <div className="tweaks-panel" role="dialog" aria-label="Tweaks">
          <div className="tweaks-header">
            <span className="tweaks-title">TWEAKS</span>
            <button
              type="button"
              className="tweaks-close"
              aria-label="Close tweaks"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <RadioGroup
            label="Stratification posture"
            value={tweaks.posture}
            options={POSTURES}
            onChange={(v) => update('posture', v)}
          />
          <RadioGroup
            label="Reading temperature"
            value={tweaks.temperature}
            options={TEMPERATURES}
            onChange={(v) => update('temperature', v)}
          />
          <RadioGroup
            label="Field density"
            value={tweaks.density}
            options={DENSITIES}
            onChange={(v) => update('density', v)}
          />
        </div>
      )}
    </>
  );
}
