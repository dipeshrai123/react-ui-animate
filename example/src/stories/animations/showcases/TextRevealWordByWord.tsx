import React, { useLayoutEffect, useState } from 'react';
import {
  animate,
  useValue,
  withSpring,
  withStagger,
  withTiming,
  Easing,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

// GSAP's signature "power4.out" deceleration curve — no bounce, just a
// long, fluid settle. This (plus a tight, overlapping stagger) is most
// of what makes GSAP text reveals read as "fluid" rather than springy.
const fluidEasing = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Each word starts translated down and clipped by the parent's
 * `overflow: hidden`, then springs up into place — the classic
 * GSAP SplitText "words" reveal.
 */
const RevealWord = ({
  word,
  index,
  playKey,
}: {
  word: string;
  index: number;
  playKey: number;
}) => {
  const [y, setY] = useValue('100%');
  const [opacity, setOpacity] = useValue(0);

  useLayoutEffect(() => {
    setY(withStagger(index, withSpring('0%', { stiffness: 220, damping: 24 }), { each: 60 }));
    setOpacity(withStagger(index, withTiming(1, { duration: 300 }), { each: 60 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: 4 }}>
      <animate.span
        style={{
          display: 'inline-block',
          translateY: y,
          opacity,
        }}
      >
        {word}
        {' '}
      </animate.span>
    </span>
  );
};

/**
 * Each word blurs and scales in from behind — a softer, more
 * cinematic variant of the same word-by-word split.
 */
const BlurWord = ({
  word,
  index,
  playKey,
}: {
  word: string;
  index: number;
  playKey: number;
}) => {
  const [opacity, setOpacity] = useValue(0);
  const [filter, setFilter] = useValue('blur(12px)');
  const [scale, setScale] = useValue(0.6);

  useLayoutEffect(() => {
    setOpacity(withStagger(index, withTiming(1, { duration: 400 }), { each: 45 }));
    setFilter(withStagger(index, withTiming('blur(0px)', { duration: 400 }), { each: 45 }));
    setScale(withStagger(index, withSpring(1, { stiffness: 260, damping: 20 }), { each: 45 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  return (
    <animate.span
      style={{
        display: 'inline-block',
        opacity,
        filter,
        scale,
      }}
    >
      {word}
      {' '}
    </animate.span>
  );
};

const WordByWordReveal: React.FC<{
  text: string;
  playKey: number;
  variant: 'slide' | 'blur';
  style?: React.CSSProperties;
}> = ({ text, playKey, variant, style }) => {
  const words = text.split(' ');
  const Word = variant === 'slide' ? RevealWord : BlurWord;

  return (
    <div style={{ ...style }}>
      {words.map((word, index) => (
        <Word key={`${playKey}-${index}`} word={word} index={index} playKey={playKey} />
      ))}
    </div>
  );
};

/**
 * A single character that flows up into place with a heavy overlap
 * (each character starts well before the previous one finishes) and
 * a long expo-out settle instead of a spring — this overlap + curve
 * combination is what gives GSAP's SplitText demos their "liquid"
 * quality, rather than the more mechanical spring-per-word feel.
 */
const FluidChar = ({
  char,
  index,
  playKey,
}: {
  char: string;
  index: number;
  playKey: number;
}) => {
  const [y, setY] = useValue(120);
  const [rotate, setRotate] = useValue(14);
  const [scaleY, setScaleY] = useValue(1.6);
  const [opacity, setOpacity] = useValue(0);

  useLayoutEffect(() => {
    const stagger = { each: 16 };
    const settle = { duration: 900, easing: fluidEasing };

    setY(withStagger(index, withTiming(0, settle), stagger));
    setRotate(withStagger(index, withTiming(0, settle), stagger));
    setScaleY(withStagger(index, withTiming(1, settle), stagger));
    setOpacity(withStagger(index, withTiming(1, { duration: 500 }), stagger));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  if (char === ' ') {
    return <span> </span>;
  }

  return (
    <span style={{ display: 'inline-block', overflow: 'hidden' }}>
      <animate.span
        style={{
          display: 'inline-block',
          translateY: y,
          rotate,
          scaleY,
          opacity,
          transformOrigin: 'bottom',
        }}
      >
        {char}
      </animate.span>
    </span>
  );
};

const FluidTextReveal: React.FC<{
  text: string;
  playKey: number;
  style?: React.CSSProperties;
}> = ({ text, playKey, style }) => {
  const chars = text.split('');

  return (
    <div style={{ ...style }}>
      {chars.map((char, index) => (
        <FluidChar key={`${playKey}-${index}`} char={char} index={index} playKey={playKey} />
      ))}
    </div>
  );
};

const Example: React.FC = () => {
  const [playKey, setPlayKey] = useState(0);

  return (
    <ExampleLayout
      title="Text Reveal — Word by Word"
      description="Splits a sentence into words and animates them in one after another with a stagger delay, similar to GSAP's SplitText reveal."
      onRestart={() => setPlayKey((k) => k + 1)}
    >
      <Section
        title="Slide Up Reveal"
        description="Words are masked by an overflow-hidden wrapper and spring up into place."
      >
        <ExampleCard>
          <WordByWordReveal
            key={playKey}
            playKey={playKey}
            variant="slide"
            text="Animate every word into view, one at a time."
            style={{ fontSize: 40, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Blur In Reveal"
        description="Words scale up and sharpen from a blurred, faded state."
      >
        <ExampleCard>
          <WordByWordReveal
            key={playKey}
            playKey={playKey}
            variant="blur"
            text="A softer cinematic word-by-word entrance effect."
            style={{ fontSize: 36, fontWeight: 600, color: '#3399ff', lineHeight: 1.3 }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Fluid Character Flow"
        description="Splits into individual characters with a tight, overlapping stagger and an expo-out settle (no spring bounce) — GSAP's SplitText character reveals lean heavily on this combo."
      >
        <ExampleCard>
          <FluidTextReveal
            key={playKey}
            playKey={playKey}
            text="This is what fluid feels like."
            style={{ fontSize: 44, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}
          />
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
