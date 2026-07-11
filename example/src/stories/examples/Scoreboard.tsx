import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { animate, useValue, withSpring, withSequence, withTiming, withDelay } from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

// How many extra full 0-9 loops to render above/below the "real" digit, so a
// single roll (even one that wraps past 9 -> 0, or accumulates a few rapid
// updates before settling) always has somewhere to scroll to without ever
// running out of rows. 2 loops on each side comfortably covers normal use.
const LOOPS_EACH_SIDE = 2;
const DIGIT_STRIP = Array.from(
  { length: 10 * (LOOPS_EACH_SIDE * 2 + 1) },
  (_, i) => i % 10
);
const CANONICAL_OFFSET = LOOPS_EACH_SIDE * 10;

/**
 * A single rolling digit column, iOS/odometer style: a vertical strip of
 * 0-9 (repeated a few times for headroom) sits inside a clipped, one-row-tall
 * window, and slides via `translateY` to whichever copy of the target digit
 * keeps the roll going in the right direction — so incrementing through
 * 9 -> 0 keeps scrolling forward instead of snapping backward.
 */
function DigitColumn({
  digit,
  direction,
  height,
  width,
}: {
  digit: number;
  direction: 1 | -1;
  height: number;
  width: number;
}) {
  const [position, setPosition] = useValue(-(digit + CANONICAL_OFFSET) * height);
  const continuousRef = useRef(digit + CANONICAL_OFFSET);
  const prevDigitRef = useRef(digit);

  useEffect(() => {
    const prevDigit = prevDigitRef.current;
    if (digit === prevDigit) return;
    prevDigitRef.current = digit;

    let delta = digit - prevDigit;
    // A digit moving the "wrong way" relative to the overall trend means it
    // wrapped (e.g. 9 -> 0 while incrementing, or 0 -> 9 while decrementing)
    // — keep rolling the same direction instead of reversing.
    if (direction > 0 && delta < 0) delta += 10;
    else if (direction < 0 && delta > 0) delta -= 10;

    continuousRef.current += delta;
    const target = continuousRef.current;

    setPosition(
      withSpring(-target * height, {
        stiffness: 230,
        damping: 26,
        onComplete: () => {
          // Re-center back into the canonical band once settled (no visual
          // change — every copy of a digit in the strip looks identical) so
          // the strip's row budget never runs low no matter how many rolls
          // have happened over the component's lifetime.
          const canonical = digit + CANONICAL_OFFSET;
          continuousRef.current = canonical;
          position.set(-canonical * height);
        },
      })
    );
  }, [digit, direction, height, setPosition, position]);

  return (
    <div style={{ height, width, overflow: 'hidden', position: 'relative' }}>
      <animate.div
        style={{ position: 'absolute', top: 0, left: 0, right: 0, translateY: position }}
      >
        {DIGIT_STRIP.map((d, i) => (
          <div
            key={i}
            style={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {d}
          </div>
        ))}
      </animate.div>
    </div>
  );
}

/**
 * Renders a number as a row of iOS-style rolling digit columns — each digit
 * scrolls smoothly to its new value instead of the text simply changing.
 * Non-digit characters (commas, a decimal point, `$`, `%`, a leading `-`)
 * are rendered as plain static text alongside the rolling digits.
 */
function AnimatedOdometer({
  value,
  format = (v) => Math.round(v).toLocaleString(),
  fontSize = 56,
  fontWeight = 800,
  color = '#1a1a1a',
}: {
  value: number;
  format?: (v: number) => string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
}) {
  const formatted = format(value);
  const chars = formatted.split('');
  const prevValueRef = useRef(value);
  const directionRef = useRef<1 | -1>(1);

  if (value !== prevValueRef.current) {
    directionRef.current = value > prevValueRef.current ? 1 : -1;
    prevValueRef.current = value;
  }

  const height = Math.round(fontSize * 1.2);
  const digitWidth = Math.round(fontSize * 0.62);

  return (
    <div
      style={{
        display: 'inline-flex',
        height,
        fontSize,
        fontWeight,
        color,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: `${height}px`,
      }}
    >
      {chars.map((ch, i) => {
        if (!/[0-9]/.test(ch)) {
          return (
            <div
              key={`sep-${chars.length - i}`}
              style={{ height, width: ch === ',' || ch === '.' ? fontSize * 0.28 : fontSize * 0.5 }}
            >
              {ch}
            </div>
          );
        }

        return (
          <DigitColumn
            // Key by distance-from-the-right so a digit column keeps its
            // identity (and roll direction) as new higher-order digits are
            // added to the left (e.g. 9 -> 10).
            key={`digit-${chars.length - i}`}
            digit={parseInt(ch, 10)}
            direction={directionRef.current}
            height={height}
            width={digitWidth}
          />
        );
      })}
    </div>
  );
}

/**
 * A small "▲ +3" / "▼ -2" badge that flashes in and fades out whenever the
 * score it's attached to changes. Keyed by a change counter so each update
 * gets a fresh mount and always replays its enter animation, even if the
 * previous flash hadn't finished fading yet.
 */
function TrendBadge({ trendKey, delta, color }: { trendKey: number; delta: number; color: string }) {
  if (delta === 0) return null;
  const isUp = delta > 0;

  return (
    <animate.span
      key={trendKey}
      style={{
        position: 'absolute',
        left: '50%',
        top: -6,
        transform: 'translateX(-50%)',
        fontSize: 15,
        fontWeight: 700,
        color,
        opacity: 0,
        translateY: isUp ? 10 : -10,
        whiteSpace: 'nowrap',
      }}
      animate={{
        opacity: withSequence([
          withTiming(1, { duration: 150 }),
          withDelay(500),
          withTiming(0, { duration: 350 }),
        ]),
        translateY: withSpring(0, { stiffness: 260, damping: 22 }),
      }}
    >
      {isUp ? `▲ +${delta}` : `▼ ${delta}`}
    </animate.span>
  );
}

interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

const INITIAL_TEAMS: Team[] = [
  { id: 'home', name: 'Falcons', color: '#3399ff', score: 12 },
  { id: 'away', name: 'Wolves', color: '#ff6b6b', score: 9 },
];

const KPIS_INITIAL = {
  revenue: 48250,
  users: 1284,
  conversion: 3.8,
};

const Example = () => {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [trendKeys, setTrendKeys] = useState<Record<string, number>>({});
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const trendCounter = useRef(0);

  const bumpScore = (id: string, delta: number) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, score: Math.max(0, t.score + delta) } : t)));
    trendCounter.current += 1;
    setTrendKeys((prev) => ({ ...prev, [id]: trendCounter.current }));
    setDeltas((prev) => ({ ...prev, [id]: delta }));
  };

  const [kpis, setKpis] = useState(KPIS_INITIAL);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setKpis((prev) => ({
        revenue: Math.max(0, prev.revenue + Math.round((Math.random() - 0.35) * 1500)),
        users: Math.max(0, prev.users + Math.round((Math.random() - 0.3) * 60)),
        conversion: Math.max(0, +(prev.conversion + (Math.random() - 0.5) * 0.6).toFixed(1)),
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <ExampleLayout
      title="Number Trend Animation — Scoreboard"
      description="Each digit rolls vertically to its new value like an iOS odometer, instead of the text just snapping — with a trend badge that flashes in on every change."
      onRestart={() => {
        setTeams(INITIAL_TEAMS);
        setKpis(KPIS_INITIAL);
        setIsLive(false);
        setDeltas({});
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          maxWidth: 620,
          margin: '0 auto 48px',
        }}
      >
        {teams.map((team) => (
          <div
            key={team.id}
            style={{
              padding: '28px 20px',
              borderRadius: 16,
              backgroundColor: '#fff',
              border: `2px solid ${team.color}30`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 8 }}>
              {team.name}
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <AnimatedOdometer value={team.score} fontSize={56} fontWeight={800} color={team.color} />
              {trendKeys[team.id] !== undefined && (
                <TrendBadge
                  trendKey={trendKeys[team.id]}
                  delta={deltas[team.id] ?? 0}
                  color={(deltas[team.id] ?? 0) > 0 ? '#22c55e' : '#ef4444'}
                />
              )}
            </div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[-1, 1, 3].map((delta) => (
                <button
                  key={delta}
                  onClick={() => bumpScore(team.id, delta)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: delta < 0 ? '#f1f5f9' : `${team.color}15`,
                    color: delta < 0 ? '#666' : team.color,
                    cursor: 'pointer',
                  }}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
            Live Stats
          </h3>
          <button
            onClick={() => setIsLive((v) => !v)}
            style={{
              padding: '8px 18px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              backgroundColor: isLive ? '#ef4444' : '#3399ff',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {isLive ? 'Stop Live Updates' : 'Start Live Updates'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
          }}
        >
          <div style={kpiCardStyle}>
            <div style={kpiLabelStyle}>Revenue</div>
            <AnimatedOdometer
              value={kpis.revenue}
              format={(v) => `$${Math.round(v).toLocaleString()}`}
              fontSize={28}
              fontWeight={700}
            />
          </div>
          <div style={kpiCardStyle}>
            <div style={kpiLabelStyle}>Active Users</div>
            <AnimatedOdometer
              value={kpis.users}
              format={(v) => Math.round(v).toLocaleString()}
              fontSize={28}
              fontWeight={700}
            />
          </div>
          <div style={kpiCardStyle}>
            <div style={kpiLabelStyle}>Conversion</div>
            <AnimatedOdometer
              value={kpis.conversion}
              format={(v) => `${v.toFixed(1)}%`}
              fontSize={28}
              fontWeight={700}
            />
          </div>
        </div>
      </div>
    </ExampleLayout>
  );
};

const kpiCardStyle: CSSProperties = {
  padding: '20px 22px',
  borderRadius: 14,
  backgroundColor: '#fafafa',
  border: '1px solid #e5e7eb',
};

const kpiLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#888',
  marginBottom: 6,
};


export default Example;
