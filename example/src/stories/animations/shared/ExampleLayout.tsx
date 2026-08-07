import React, { ReactNode } from 'react';
import { theme } from './theme';
import { Button } from './Button';

interface ExampleLayoutProps {
  title: string;
  description?: ReactNode;
  tag?: string;
  children: ReactNode;
  onRestart?: () => void;
  showRestartButton?: boolean;
}

export const ExampleLayout: React.FC<ExampleLayoutProps> = ({
  title,
  description,
  tag,
  children,
  onRestart,
  showRestartButton = true,
}) => {
  return (
    <div
      style={{
        padding: '48px 40px 80px',
        maxWidth: 1120,
        margin: '0 auto',
        fontFamily: theme.font.sans,
        color: theme.color.text,
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.color.accent,
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h1
        style={{
          marginBottom: 12,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: theme.color.text,
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          style={{
            marginBottom: 44,
            color: theme.color.textMuted,
            fontSize: 16,
            lineHeight: 1.65,
            maxWidth: 720,
          }}
        >
          {description}
        </p>
      )}
      {children}
      {showRestartButton && onRestart && (
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <Button variant="primary" onClick={onRestart}>
            Restart animation
          </Button>
        </div>
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, description, children }) => {
  return (
    <div style={{ marginBottom: 56 }}>
      <h2
        style={{
          marginBottom: 8,
          fontSize: 20,
          fontWeight: 600,
          color: theme.color.text,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            marginBottom: 22,
            color: theme.color.textFaint,
            fontSize: 14,
            lineHeight: 1.55,
            maxWidth: 640,
          }}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

interface ExampleCardProps {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center';
}

export const ExampleCard: React.FC<ExampleCardProps> = ({
  title,
  description,
  children,
  align = 'start',
}) => {
  return (
    <div
      style={{
        padding: 28,
        backgroundColor: theme.color.surface,
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.color.border}`,
      }}
    >
      {title && (
        <h3 style={{ marginBottom: 8, fontSize: 15, fontWeight: 600, color: theme.color.text }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{ marginBottom: 20, color: theme.color.textFaint, fontSize: 13, lineHeight: 1.55 }}>
          {description}
        </p>
      )}
      <div
        style={
          align === 'center'
            ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
};
