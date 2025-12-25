import React, { ReactNode } from 'react';

interface ExampleLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  onRestart?: () => void;
  showRestartButton?: boolean;
}

export const ExampleLayout: React.FC<ExampleLayoutProps> = ({
  title,
  description,
  children,
  onRestart,
  showRestartButton = true,
}) => {
  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 10, fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>
        {title}
      </h1>
      {description && (
        <p style={{ marginBottom: 40, color: '#666', fontSize: 16, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {children}
      {showRestartButton && onRestart && (
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onRestart}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 500,
              backgroundColor: '#3399ff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2980d9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3399ff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Restart Animations
          </button>
        </div>
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, description, children }) => {
  return (
    <div style={{ marginBottom: 50 }}>
      <h2 style={{ marginBottom: 10, fontSize: 24, fontWeight: 600, color: '#2a2a2a' }}>
        {title}
      </h2>
      {description && (
        <p style={{ marginBottom: 20, color: '#888', fontSize: 14, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

interface ExampleCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export const ExampleCard: React.FC<ExampleCardProps> = ({ title, description, children }) => {
  return (
    <div
      style={{
        padding: 24,
        backgroundColor: '#fafafa',
        borderRadius: 12,
        border: '1px solid #e0e0e0',
        marginBottom: 30,
      }}
    >
      {title && (
        <h3 style={{ marginBottom: 10, fontSize: 18, fontWeight: 600, color: '#333' }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{ marginBottom: 20, color: '#666', fontSize: 14, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      <div>{children}</div>
    </div>
  );
};

