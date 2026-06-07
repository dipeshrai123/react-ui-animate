import { useEffect, useMemo, useState } from 'react';
import {
  animate,
  AnimateValue,
  Easing,
  Presence,
  useValue,
  withSpring,
  withTiming,
} from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

const NAV_ITEMS = [
  { icon: '📊', label: 'Overview' },
  { icon: '📁', label: 'Projects' },
  { icon: '👥', label: 'Team' },
  { icon: '⚙️', label: 'Settings' },
];

const STATS = [
  { label: 'Revenue', value: '$48.2k', change: '+12.4%', up: true },
  { label: 'Users', value: '2,847', change: '+8.1%', up: true },
  { label: 'Sessions', value: '18.5k', change: '-2.3%', up: false },
];

const ACTIVITY = [
  { user: 'Sarah', action: 'deployed v2.4.0', time: '2m ago' },
  { user: 'Alex', action: 'merged PR #128', time: '14m ago' },
  { user: 'Jordan', action: 'updated design tokens', time: '1h ago' },
];

const CHART_HEIGHTS = [40, 65, 45, 80, 55, 70, 48, 90, 60, 75, 52, 85];

function ThemeToggle({
  isDark,
  onToggle,
  track,
  thumb,
  knobX,
  sunOpacity,
  moonOpacity,
  sunRotate,
  moonRotate,
}: {
  isDark: boolean;
  onToggle: () => void;
  track: AnimateValue<string | number>;
  thumb: AnimateValue<string | number>;
  knobX: AnimateValue<string | number>;
  sunOpacity: AnimateValue<string | number>;
  moonOpacity: AnimateValue<string | number>;
  sunRotate: AnimateValue<string | number>;
  moonRotate: AnimateValue<string | number>;
}) {
  return (
    <animate.button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      onClick={onToggle}
      style={{
        position: 'relative',
        width: 72,
        height: 38,
        borderRadius: 999,
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        backgroundColor: track,
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)',
        scale: 1,
      }}
      hover={{ scale: withSpring(1.04, { stiffness: 400, damping: 22 }) }}
      press={{ scale: withSpring(0.96, { stiffness: 500, damping: 28 }) }}
    >
      <animate.div
        style={{
          position: 'absolute',
          top: 5,
          left: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: thumb,
          translateX: knobX,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}
      >
        <animate.span
          style={{
            position: 'absolute',
            opacity: sunOpacity,
            rotate: sunRotate,
            display: 'flex',
          }}
        >
          ☀️
        </animate.span>
        <animate.span
          style={{
            position: 'absolute',
            opacity: moonOpacity,
            rotate: moonRotate,
            display: 'flex',
          }}
        >
          🌙
        </animate.span>
      </animate.div>
    </animate.button>
  );
}

const Example = () => {
  const [isDark, setIsDark] = useState(false);
  const [progress, setProgress] = useValue(0);
  const [shellScale, setShellScale] = useValue(1);

  useEffect(() => {
    setProgress(
      withTiming(isDark ? 1 : 0, {
        duration: 650,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );
    setShellScale(
      withSpring(1, { stiffness: 260, damping: 22, mass: 0.8 })
    );
  }, [isDark, setProgress, setShellScale]);

  const toggleTheme = () => {
    setShellScale(withSpring(0.985, { stiffness: 400, damping: 18 }));
    setIsDark((d) => !d);
  };

  const resetTheme = () => {
    setIsDark(false);
    setProgress(0);
    setShellScale(1);
  };

  const colors = useMemo(
    () => ({
      pageBg: progress.to([0, 1], ['#eef2f7', '#0b1120']),
      pageGradient: progress.to(
        [0, 1],
        [
          'radial-gradient(ellipse at 20% 0%, #dbeafe 0%, transparent 55%)',
          'radial-gradient(ellipse at 80% 10%, #1e1b4b 0%, transparent 50%)',
        ]
      ),
      shellBg: progress.to([0, 1], ['#ffffff', '#151c2c']),
      shellBorder: progress.to([0, 1], ['#e2e8f0', '#2a3548']),
      textPrimary: progress.to([0, 1], ['#0f172a', '#f1f5f9']),
      textSecondary: progress.to([0, 1], ['#64748b', '#94a3b8']),
      textMuted: progress.to([0, 1], ['#94a3b8', '#64748b']),
      accent: progress.to([0, 1], ['#6366f1', '#818cf8']),
      accentSoft: progress.to([0, 1], ['#eef2ff', '#1e1b4b']),
      accentGlow: progress.to(
        [0, 1],
        ['0 0 0 rgba(99,102,241,0)', '0 0 24px rgba(129,140,248,0.25)']
      ),
      cardBg: progress.to([0, 1], ['#f8fafc', '#1a2234']),
      cardBorder: progress.to([0, 1], ['#e2e8f0', '#2a3548']),
      cardShadow: progress.to(
        [0, 1],
        [
          '0 1px 3px rgba(15,23,42,0.06)',
          '0 8px 32px rgba(0,0,0,0.35)',
        ]
      ),
      sidebarBg: progress.to([0, 1], ['#fafbfc', '#111827']),
      sidebarActiveBg: progress.to([0, 1], ['#eef2ff', '#1e1b4b']),
      sidebarActiveText: progress.to([0, 1], ['#4338ca', '#a5b4fc']),
      chartBar: progress.to([0, 1], ['#6366f1', '#818cf8']),
      chartBarMuted: progress.to([0, 1], ['#c7d2fe', '#312e81']),
      positive: progress.to([0, 1], ['#059669', '#34d399']),
      negative: progress.to([0, 1], ['#dc2626', '#f87171']),
      toggleTrack: progress.to([0, 1], ['#cbd5e1', '#334155']),
      toggleThumb: progress.to([0, 1], ['#ffffff', '#475569']),
      starOpacity: progress.to([0, 0.35, 1], [0, 0, 0.55]),
      divider: progress.to([0, 1], ['#e2e8f0', '#2a3548']),
    }),
    [progress]
  );

  const knobX = progress.to([0, 1], [4, 40]);
  const sunOpacity = progress.to([0, 0.45, 1], [1, 0, 0]);
  const moonOpacity = progress.to([0, 0.55, 1], [0, 0, 1]);
  const sunRotate = progress.to([0, 1], [0, 90]);
  const moonRotate = progress.to([0, 1], [-60, 0]);

  const stars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 37) % 90)}%`,
        top: `${5 + ((i * 23) % 40)}%`,
        size: 1 + (i % 3),
      })),
    []
  );

  return (
    <ExampleLayout
      title="Theme Switch with Morph"
      description="A coordinated light/dark theme transition. All colors, shadows, and accents morph together via a single animated progress value and to() interpolation."
      onRestart={resetTheme}
    >
      <animate.div
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: colors.pageBg,
          backgroundImage: colors.pageGradient,
          padding: 32,
          minHeight: 560,
        }}
      >
        <animate.div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: colors.starOpacity,
          }}
        >
          {stars.map((star) => (
            <div
              key={star.id}
              style={{
                position: 'absolute',
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
              }}
            />
          ))}
        </animate.div>

        <animate.div
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: colors.shellBorder,
            backgroundColor: colors.shellBg,
            boxShadow: colors.cardShadow,
            scale: shellScale,
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            minHeight: 480,
          }}
        >
          {/* Sidebar */}
          <animate.aside
            style={{
              backgroundColor: colors.sidebarBg,
              borderRightWidth: 1,
              borderRightStyle: 'solid',
              borderRightColor: colors.divider,
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <animate.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 12px 20px',
              }}
            >
              <animate.div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.accentSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: colors.accentGlow,
                }}
              >
                ✦
              </animate.div>
              <animate.span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.textPrimary,
                }}
              >
                Acme
              </animate.span>
            </animate.div>

            {NAV_ITEMS.map((item, i) => {
              const active = i === 0;
              return (
                <animate.div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    backgroundColor: active ? colors.sidebarActiveBg : 'transparent',
                    color: active ? colors.sidebarActiveText : colors.textSecondary,
                    scale: 1,
                    opacity: 1,
                  }}
                  hover={{
                    scale: withSpring(1.02, { stiffness: 400, damping: 25 }),
                    opacity: withTiming(0.85, { duration: 150 }),
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: active ? 600 : 500 }}>
                    {item.label}
                  </span>
                </animate.div>
              );
            })}
          </animate.aside>

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <animate.header
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 28px',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: colors.divider,
              }}
            >
              <div>
                <animate.h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: colors.textPrimary,
                  }}
                >
                  Dashboard
                </animate.h2>
                <animate.p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 13,
                    color: colors.textSecondary,
                  }}
                >
                  Welcome back — here's what's happening
                </animate.p>
              </div>
              <ThemeToggle
                isDark={isDark}
                onToggle={toggleTheme}
                track={colors.toggleTrack}
                thumb={colors.toggleThumb}
                knobX={knobX}
                sunOpacity={sunOpacity}
                moonOpacity={moonOpacity}
                sunRotate={sunRotate}
                moonRotate={moonRotate}
              />
            </animate.header>

            <div style={{ padding: '24px 28px', flex: 1 }}>
              {/* Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {STATS.map((stat) => (
                  <animate.div
                    key={stat.label}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 12,
                      backgroundColor: colors.cardBg,
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: colors.cardBorder,
                      boxShadow: colors.cardShadow,
                      scale: 1,
                    }}
                    hover={{
                      scale: withSpring(1.02, { stiffness: 350, damping: 22 }),
                    }}
                  >
                    <animate.div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 8,
                      }}
                    >
                      {stat.label}
                    </animate.div>
                    <animate.div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        marginBottom: 6,
                      }}
                    >
                      {stat.value}
                    </animate.div>
                    <animate.span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: stat.up ? colors.positive : colors.negative,
                      }}
                    >
                      {stat.change}
                    </animate.span>
                  </animate.div>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr',
                  gap: 16,
                }}
              >
                {/* Chart */}
                <animate.div
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    backgroundColor: colors.cardBg,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: colors.cardBorder,
                    boxShadow: colors.cardShadow,
                  }}
                >
                  <animate.div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: 20,
                    }}
                  >
                    Weekly Activity
                  </animate.div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 8,
                      height: 100,
                    }}
                  >
                    {CHART_HEIGHTS.map((h, i) => (
                      <animate.div
                        key={i}
                        style={{
                          flex: 1,
                          height: h,
                          borderRadius: '4px 4px 0 0',
                          backgroundColor:
                            i === CHART_HEIGHTS.length - 1
                              ? colors.chartBar
                              : colors.chartBarMuted,
                          scale: 1,
                        }}
                        hover={{
                          scale: withSpring(1.08, {
                            stiffness: 400,
                            damping: 20,
                          }),
                        }}
                      />
                    ))}
                  </div>
                </animate.div>

                {/* Activity feed */}
                <animate.div
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    backgroundColor: colors.cardBg,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: colors.cardBorder,
                    boxShadow: colors.cardShadow,
                  }}
                >
                  <animate.div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: 16,
                    }}
                  >
                    Recent Activity
                  </animate.div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {ACTIVITY.map((item) => (
                      <animate.div
                        key={item.user + item.time}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          scale: 1,
                        }}
                        hover={{
                          translateX: withSpring(4, {
                            stiffness: 300,
                            damping: 20,
                          }),
                        }}
                      >
                        <animate.div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: colors.accentSoft,
                            color: colors.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {item.user[0]}
                        </animate.div>
                        <div style={{ minWidth: 0 }}>
                          <animate.div
                            style={{
                              fontSize: 13,
                              color: colors.textPrimary,
                              fontWeight: 500,
                            }}
                          >
                            <strong>{item.user}</strong> {item.action}
                          </animate.div>
                          <animate.div
                            style={{
                              fontSize: 11,
                              color: colors.textMuted,
                              marginTop: 2,
                            }}
                          >
                            {item.time}
                          </animate.div>
                        </div>
                      </animate.div>
                    ))}
                  </div>
                </animate.div>
              </div>
            </div>
          </div>
        </animate.div>

        <Presence>
          {isDark && (
            <animate.div
              key="dark-badge"
              style={{
                position: 'absolute',
                bottom: 20,
                right: 24,
                padding: '6px 12px',
                borderRadius: 999,
                backgroundColor: colors.accentSoft,
                color: colors.accent,
                fontSize: 11,
                fontWeight: 600,
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: withTiming(1, { duration: 400 }),
                scale: withSpring(1, { stiffness: 300, damping: 20 }),
              }}
              exit={{
                opacity: withTiming(0, { duration: 200 }),
                scale: withSpring(0.8, { stiffness: 400, damping: 25 }),
              }}
            >
              Dark mode active
            </animate.div>
          )}
        </Presence>
      </animate.div>

      <p
        style={{
          marginTop: 20,
          textAlign: 'center',
          fontSize: 13,
          color: '#94a3b8',
        }}
      >
        Toggle the switch — every surface morphs from a single animated progress value
      </p>
    </ExampleLayout>
  );
};

export default Example;
