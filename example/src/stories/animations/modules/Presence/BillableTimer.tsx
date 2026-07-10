import React, { useMemo, useState } from 'react';
import { animate, Presence, withSpring, withTiming, Easing } from 'react-ui-animate';

type AnimationType = 'spring' | 'timing';

// Exaggerated motion for debugging timing glitches (slow + large travel)
const ENTER_TRANSLATE_Y = 48;
const EXIT_TRANSLATE_Y  = -24;

const enterTiming = { duration: 1500, easing: Easing.out(Easing.cubic) };
const exitTiming  = { duration: 1200, easing: Easing.in(Easing.cubic) };
const enterSpring = { damping: 20, stiffness: 120 };
const exitSpring  = { damping: 24, stiffness: 160 };

function makeEnter(type: AnimationType) {
  return {
    translateY: type === 'spring' ? withSpring(0, enterSpring) : withTiming(0, enterTiming),
  };
}

function makeExit(type: AnimationType) {
  return {
    translateY: type === 'spring' ? withSpring(EXIT_TRANSLATE_Y, exitSpring) : withTiming(EXIT_TRANSLATE_Y, exitTiming),
  };
}

// ─── minimal style tokens ─────────────────────────────────────────────────────
const shell: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
  background: '#fff',
  width: 380,
  position: 'relative',
  overflow: 'hidden',
};

const shellActive: React.CSSProperties = {
  ...shell,
  border: '1px solid rgba(34,197,94,.25)',
  background: 'rgba(240,253,244,.25)',
};

const btn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 14,
};

const primaryBtn: React.CSSProperties = { ...btn, background: '#3b82f6', color: '#fff' };
const dangerBtn: React.CSSProperties  = { ...btn, background: '#ef4444', color: '#fff' };

const overline: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
};

const muted: React.CSSProperties = { fontSize: 13, color: '#64748b', marginTop: 4 };

// ─── tiny elapsed timer ───────────────────────────────────────────────────────
function ElapsedTimer({ startedAt }: { startedAt: number | null }) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!startedAt) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const s  = Math.floor(elapsed / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');

  return (
    <div style={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {startedAt ? `${mm}:${ss}` : '00:00'}
    </div>
  );
}

// ─── main example ─────────────────────────────────────────────────────────────
const BillableTimerExample: React.FC<{
  bgColor?: string;
  animationType?: AnimationType;
}> = ({ bgColor, animationType = 'spring' }) => {
  const [active, setActive] = useState<number | null>(null);

  const shellResolved      = bgColor ? { ...shell,       background: bgColor } : shell;
  const shellActiveResolved = bgColor ? { ...shellActive, background: bgColor } : shellActive;

  const enterRunning = useMemo(() => makeEnter(animationType), [animationType]);
  const exitRunning  = useMemo(() => makeExit(animationType), [animationType]);
  const enterReady   = useMemo(() => makeEnter(animationType), [animationType]);
  const exitReady    = useMemo(() => makeExit(animationType), [animationType]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* animation type badge */}
      <div style={{ marginBottom: 10, textAlign: 'center' }}>
        <span style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          background: animationType === 'spring' ? '#eff6ff' : '#fef9c3',
          color:      animationType === 'spring' ? '#3b82f6' : '#a16207',
          border:     animationType === 'spring' ? '1px solid #bfdbfe' : '1px solid #fde68a',
        }}>
          {animationType === 'spring' ? '⚡ withSpring' : '⏱ withTiming'}
        </span>
      </div>

      <div style={active ? shellActiveResolved : shellResolved}>
        <Presence mode="popLayout" initial={false}>
          {active !== null ? (
            <animate.div
              key="timer-running"
              style={{ translateY: ENTER_TRANSLATE_Y }}
              animate={enterRunning}
              exit={exitRunning}
            >
              {/* ── Running state ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#22c55e', display: 'inline-block',
                    }} />
                    <span style={{ ...overline, color: '#22c55e' }}>Timer running</span>
                  </div>
                  <ElapsedTimer startedAt={active} />
                  <p style={muted}>
                    Started {new Date(active!).toLocaleTimeString()} · Acme Corp · Website Redesign
                  </p>
                </div>
                <button style={dangerBtn} onClick={() => setActive(null)}>
                  ⬛ Stop timer
                </button>
              </div>
            </animate.div>
          ) : (
            <animate.div
              key="timer-ready"
              style={{ translateY: ENTER_TRANSLATE_Y }}
              animate={enterReady}
              exit={exitReady}
            >
              {/* ── Ready state ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                    <span>🕐</span>
                    <span style={{ ...overline, color: '#94a3b8' }}>Ready to start</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    00:00
                  </div>
                  <p style={muted}>Select client, project, and activity.</p>
                </div>
                <button style={primaryBtn} onClick={() => setActive(Date.now())}>
                  ▶ Start timer
                </button>
              </div>

              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['Client', 'Project', 'Activity'].map((label) => (
                  <div key={label} style={{ gridColumn: label === 'Activity' ? '1 / -1' : 'auto' }}>
                    <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
                      {label}
                    </label>
                    <select style={{
                      width: '100%', padding: '6px 10px', borderRadius: 8,
                      border: '1px solid #e2e8f0', fontSize: 14,
                    }}>
                      <option>Select {label.toLowerCase()}</option>
                      {label === 'Client'   && <option>Acme Corp</option>}
                      {label === 'Project'  && <option>Website Redesign</option>}
                      {label === 'Activity' && <option>No specific activity</option>}
                    </select>
                  </div>
                ))}
              </div>
            </animate.div>
          )}
        </Presence>
      </div>

      <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
        Toggle rapidly to trigger the popLayout glitch (before fix: exiting panel jumps position)
      </p>
    </div>
  );
};

export default BillableTimerExample;
