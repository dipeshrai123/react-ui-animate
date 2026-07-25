import { useEffect, useState } from 'react';
import {
  animate,
  Presence,
  withDelay,
  withLoop,
  withSequence,
  withSpring,
  withTiming,
} from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

const LOAD_MS = 2400;

const PROFILE = {
  name: 'Morgan Kim',
  handle: '@morgankim',
  bio: 'Building animation tooling · Staff engineer at Acme',
  followers: '12.4k',
  following: '842',
  posts: 128,
  avatar: 'MK',
  color: '#6366f1',
};

const ARTICLES = [
  {
    id: 1,
    title: 'Designing spring defaults that feel natural',
    excerpt:
      'How stiffness and damping values affect perceived quality in UI motion.',
    author: 'Sarah Chen',
    readTime: '6 min',
    tag: 'Design',
    color: '#6366f1',
  },
  {
    id: 2,
    title: 'Scroll-linked animations without requestAnimationFrame',
    excerpt:
      'Map scroll progress directly to styles using useScroll and to() interpolation.',
    author: 'James Okonkwo',
    readTime: '8 min',
    tag: 'Engineering',
    color: '#8b5cf6',
  },
  {
    id: 3,
    title: 'Presence patterns for list diffing',
    excerpt:
      'Enter and exit animations that keep list updates smooth and predictable.',
    author: 'Priya Sharma',
    readTime: '5 min',
    tag: 'React',
    color: '#ec4899',
  },
  {
    id: 4,
    title: 'Gesture hooks in production apps',
    excerpt:
      'Drag, scroll, and pointer tracking with accessible fallbacks and thresholds.',
    author: 'Alex Rivera',
    readTime: '7 min',
    tag: 'Gestures',
    color: '#14b8a6',
  },
];

const STATS = [
  { label: 'Views', value: '48.2k' },
  { label: 'Engagement', value: '12.8%' },
  { label: 'Subscribers', value: '3,241' },
];

function Shimmer({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
    >
      <animate.div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          backgroundPosition: '-100% 0',
        }}
        animate={{
          backgroundPosition: withLoop(
            withTiming('200% 0', { duration: 1400 }),
            Infinity
          ),
        }}
      />
    </div>
  );
}

function SkeletonProfile() {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Shimmer width={72} height={72} borderRadius={999} />
      <div style={{ flex: 1 }}>
        <Shimmer width="45%" height={18} borderRadius={6} style={{ marginBottom: 10 }} />
        <Shimmer width="30%" height={14} borderRadius={6} style={{ marginBottom: 14 }} />
        <Shimmer width="80%" height={12} borderRadius={6} />
      </div>
    </div>
  );
}

function ProfileContent() {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <animate.div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: `${PROFILE.color}18`,
          color: PROFILE.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 700,
          opacity: 0,
          scale: 0.85,
        }}
        animate={{
          opacity: withTiming(1, { duration: 400 }),
          scale: withSpring(1, { stiffness: 260, damping: 20 }),
        }}
      >
        {PROFILE.avatar}
      </animate.div>
      <div>
        <animate.h3
          style={{
            margin: '0 0 4px',
            fontSize: 20,
            fontWeight: 700,
            color: '#0f172a',
            opacity: 0,
            translateY: 8,
          }}
          animate={{
            opacity: withSequence([
              withDelay(80),
              withTiming(1, { duration: 350 }),
            ]),
            translateY: withSequence([
              withDelay(80),
              withSpring(0, { stiffness: 220, damping: 22 }),
            ]),
          }}
        >
          {PROFILE.name}
        </animate.h3>
        <animate.p
          style={{
            margin: '0 0 8px',
            fontSize: 14,
            color: '#6366f1',
            fontWeight: 500,
            opacity: 0,
          }}
          animate={{
            opacity: withSequence([
              withDelay(140),
              withTiming(1, { duration: 350 }),
            ]),
          }}
        >
          {PROFILE.handle}
        </animate.p>
        <animate.p
          style={{
            margin: 0,
            fontSize: 14,
            color: '#64748b',
            opacity: 0,
            translateY: 6,
          }}
          animate={{
            opacity: withSequence([
              withDelay(200),
              withTiming(1, { duration: 350 }),
            ]),
            translateY: withSequence([
              withDelay(200),
              withSpring(0, { stiffness: 200, damping: 22 }),
            ]),
          }}
        >
          {PROFILE.bio}
        </animate.p>
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#f8fafc',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#e2e8f0',
          }}
        >
          <Shimmer width="50%" height={12} borderRadius={4} style={{ marginBottom: 10 }} />
          <Shimmer width="70%" height={22} borderRadius={6} />
        </div>
      ))}
    </div>
  );
}

function StatsContent() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {STATS.map((stat, i) => (
        <animate.div
          key={stat.label}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#f8fafc',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#e2e8f0',
            opacity: 0,
            translateY: 12,
            scale: 0.96,
          }}
          animate={{
            opacity: withSequence([
              withDelay(120 + i * 100),
              withTiming(1, { duration: 400 }),
            ]),
            translateY: withSequence([
              withDelay(120 + i * 100),
              withSpring(0, { stiffness: 220, damping: 22 }),
            ]),
            scale: withSequence([
              withDelay(120 + i * 100),
              withSpring(1, { stiffness: 240, damping: 20 }),
            ]),
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#64748b',
              fontWeight: 500,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            {stat.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
            {stat.value}
          </div>
        </animate.div>
      ))}
    </div>
  );
}

function SkeletonArticleRow() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: 20,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e2e8f0',
      }}
    >
      <Shimmer width={88} height={88} borderRadius={12} />
      <div style={{ flex: 1 }}>
        <Shimmer width="25%" height={10} borderRadius={4} style={{ marginBottom: 10 }} />
        <Shimmer width="85%" height={16} borderRadius={6} style={{ marginBottom: 8 }} />
        <Shimmer width="100%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <Shimmer width="60%" height={12} borderRadius={4} style={{ marginBottom: 14 }} />
        <Shimmer width="35%" height={10} borderRadius={4} />
      </div>
    </div>
  );
}

function ArticleRow({
  article,
  index,
}: {
  article: (typeof ARTICLES)[0];
  index: number;
}) {
  const delay = 180 + index * 110;

  return (
    <animate.div
      style={{
        display: 'flex',
        gap: 16,
        padding: 20,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e2e8f0',
        opacity: 0,
        translateY: 16,
        scale: 0.98,
        cursor: 'pointer',
      }}
      animate={{
        opacity: withSequence([withDelay(delay), withTiming(1, { duration: 450 })]),
        translateY: withSequence([
          withDelay(delay),
          withSpring(0, { stiffness: 200, damping: 22 }),
        ]),
        scale: withSequence([
          withDelay(delay),
          withSpring(1, { stiffness: 240, damping: 20 }),
        ]),
      }}
      hover={{
        translateY: withSpring(-2, { stiffness: 350, damping: 22 }),
        borderColor: withTiming(`${article.color}50`, { duration: 200 }),
      }}
    >
      <animate.div
        style={{
          width: 88,
          height: 88,
          borderRadius: 12,
          backgroundColor: `${article.color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          flexShrink: 0,
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: withSequence([withDelay(delay + 60), withTiming(1, { duration: 350 })]),
          scale: withSequence([
            withDelay(delay + 60),
            withSpring(1, { stiffness: 280, damping: 18 }),
          ]),
        }}
      >
        📄
      </animate.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <animate.span
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: article.color,
            marginBottom: 8,
            opacity: 0,
          }}
          animate={{
            opacity: withSequence([
              withDelay(delay + 40),
              withTiming(1, { duration: 300 }),
            ]),
          }}
        >
          {article.tag}
        </animate.span>
        <animate.h4
          style={{
            margin: '0 0 6px',
            fontSize: 16,
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.35,
            opacity: 0,
            translateY: 6,
          }}
          animate={{
            opacity: withSequence([
              withDelay(delay + 80),
              withTiming(1, { duration: 350 }),
            ]),
            translateY: withSequence([
              withDelay(delay + 80),
              withSpring(0, { stiffness: 220, damping: 22 }),
            ]),
          }}
        >
          {article.title}
        </animate.h4>
        <animate.p
          style={{
            margin: '0 0 12px',
            fontSize: 13,
            color: '#64748b',
            lineHeight: 1.55,
            opacity: 0,
          }}
          animate={{
            opacity: withSequence([
              withDelay(delay + 120),
              withTiming(1, { duration: 400 }),
            ]),
          }}
        >
          {article.excerpt}
        </animate.p>
        <animate.div
          style={{
            fontSize: 12,
            color: '#94a3b8',
            opacity: 0,
          }}
          animate={{
            opacity: withSequence([
              withDelay(delay + 160),
              withTiming(1, { duration: 300 }),
            ]),
          }}
        >
          {article.author} · {article.readTime} read
        </animate.div>
      </div>
    </animate.div>
  );
}

function CrossfadeBlock({
  loading,
  skeleton,
  content,
  minHeight,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  content: React.ReactNode;
  minHeight: number;
}) {
  return (
    <div style={{ position: 'relative', minHeight }}>
      <Presence mode="wait">
        {loading ? (
          <animate.div
            key="skeleton"
            style={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: withTiming(0, { duration: 280 }),
              scale: withSpring(0.98, { stiffness: 300, damping: 28 }),
            }}
          >
            {skeleton}
          </animate.div>
        ) : (
          <animate.div
            key="content"
            style={{
              opacity: 0,
              scale: 1.01,
            }}
            animate={{
              opacity: withTiming(1, { duration: 320 }),
              scale: withSpring(1, { stiffness: 260, damping: 24 }),
            }}
          >
            {content}
          </animate.div>
        )}
      </Presence>
    </div>
  );
}

const Example = () => {
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), LOAD_MS);
    return () => clearTimeout(timer);
  }, [cycle]);

  const reload = () => setCycle((c) => c + 1);

  return (
    <ExampleLayout
      title="Skeleton → Content Reveal"
      description="Shimmer placeholders transition into real content with staggered reveals. Uses withLoop for skeleton shimmer, Presence for crossfade, and withSequence + withDelay for orchestrated content entrance."
      onRestart={reload}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          backgroundColor: '#f8fafc',
          borderRadius: 20,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: '#e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            padding: '14px 24px',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: '#e2e8f0',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: loading ? '#f59e0b' : '#22c55e',
                boxShadow: loading
                  ? '0 0 0 3px rgba(245,158,11,0.2)'
                  : '0 0 0 3px rgba(34,197,94,0.2)',
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
              {loading ? 'Loading feed…' : 'Content ready'}
            </span>
          </div>
          <animate.button
            type="button"
            onClick={reload}
            disabled={loading}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: '#e2e8f0',
              backgroundColor: '#fff',
              fontSize: 12,
              fontWeight: 600,
              color: loading ? '#cbd5e1' : '#6366f1',
              cursor: loading ? 'not-allowed' : 'pointer',
              scale: 1,
            }}
            hover={
              loading
                ? undefined
                : { scale: withSpring(1.03, { stiffness: 400, damping: 22 }) }
            }
            press={
              loading
                ? undefined
                : { scale: withSpring(0.97, { stiffness: 500, damping: 28 }) }
            }
          >
            Reload
          </animate.button>
        </div>

        {/* Profile */}
        <div
          style={{
            padding: 24,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: '#e2e8f0',
          }}
        >
          <CrossfadeBlock
            loading={loading}
            minHeight={72}
            skeleton={<SkeletonProfile />}
            content={<ProfileContent />}
          />
        </div>

        {/* Stats */}
        <div style={{ padding: '20px 24px' }}>
          <CrossfadeBlock
            loading={loading}
            minHeight={78}
            skeleton={<SkeletonStats />}
            content={<StatsContent />}
          />
        </div>

        {/* Feed header */}
        <div style={{ padding: '0 24px 12px' }}>
          <CrossfadeBlock
            loading={loading}
            minHeight={20}
            skeleton={<Shimmer width={120} height={14} borderRadius={4} />}
            content={
              <animate.h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a',
                  opacity: 0,
                }}
                animate={{
                  opacity: withSequence([
                    withDelay(100),
                    withTiming(1, { duration: 350 }),
                  ]),
                }}
              >
                Latest articles
              </animate.h3>
            }
          />
        </div>

        {/* Article feed */}
        <div
          style={{
            padding: '0 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {loading
            ? ARTICLES.map((a) => <SkeletonArticleRow key={a.id} />)
            : ARTICLES.map((article, i) => (
                <ArticleRow key={article.id} article={article} index={i} />
              ))}
        </div>
      </div>

      <p
        style={{
          marginTop: 20,
          textAlign: 'center',
          fontSize: 13,
          color: '#94a3b8',
        }}
      >
        Simulates a {LOAD_MS / 1000}s fetch · Skeleton shimmer loops until content replaces it
      </p>
    </ExampleLayout>
  );
};

export default Example;
