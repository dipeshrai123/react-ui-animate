import React from 'react';
import { theme } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  accent?: string;
}

const variantStyle = (variant: Variant, accent: string): React.CSSProperties => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: accent,
        color: '#0a0a0d',
        border: `1px solid ${accent}`,
      };
    case 'secondary':
      return {
        backgroundColor: theme.color.surfaceRaised,
        color: theme.color.text,
        border: `1px solid ${theme.color.border}`,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: theme.color.textMuted,
        border: `1px solid ${theme.color.border}`,
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  accent = theme.color.accent,
  style,
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      style={{
        padding: '9px 16px',
        fontSize: 13,
        fontWeight: 600,
        borderRadius: theme.radius.sm,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, opacity 0.15s ease',
        fontFamily: theme.font.sans,
        ...variantStyle(variant, accent),
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.85';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
};

export const ButtonRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
    {children}
  </div>
);

export const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      color: theme.color.accent,
      backgroundColor: theme.color.accentSoft,
      fontFamily: theme.font.mono,
    }}
  >
    {children}
  </span>
);
