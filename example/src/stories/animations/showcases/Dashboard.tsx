import React, { useState, useEffect } from 'react';
import { animate, withSpring, withTiming, useValue } from 'react-ui-animate';
import { ExampleLayout } from '../shared';

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
  trend: number;
}

const metrics: Metric[] = [
  {
    id: 'users',
    label: 'Active Users',
    value: 12450,
    unit: '',
    color: '#3399ff',
    icon: '👥',
    trend: 12.5,
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: 89420,
    unit: '$',
    color: '#51cf66',
    icon: '💰',
    trend: 8.3,
  },
  {
    id: 'orders',
    label: 'Orders',
    value: 342,
    unit: '',
    color: '#ffd43b',
    icon: '📦',
    trend: -2.1,
  },
  {
    id: 'growth',
    label: 'Growth',
    value: 24.8,
    unit: '%',
    color: '#ff6b6b',
    icon: '📈',
    trend: 5.2,
  },
];

const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
  const [displayValue, setDisplayValue] = useValue(0);

  useEffect(() => {
    setDisplayValue(withSpring(metric.value, { stiffness: 100, damping: 20 }));
  }, [metric.value, setDisplayValue]);

  return (
    <animate.div
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        scale: 1,
        translateY: 0,
        border: `2px solid transparent`,
      }}
      hover={{
        scale: withSpring(1.03, { stiffness: 300, damping: 20 }),
        translateY: withSpring(-4, { stiffness: 300, damping: 20 }),
        borderColor: withTiming(`${metric.color}40`, { duration: 200 }),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <animate.div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${metric.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            scale: 1,
          }}
          hover={{
            scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
            rotate: withSpring(5, { stiffness: 200, damping: 15 }),
          }}
        >
          {metric.icon}
        </animate.div>
        <animate.div
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            backgroundColor: metric.trend > 0 ? '#51cf6620' : '#ff6b6b20',
            fontSize: 12,
            fontWeight: 600,
            color: metric.trend > 0 ? '#51cf66' : '#ff6b6b',
            opacity: 0.7,
          }}
          hover={{
            opacity: withTiming(1, { duration: 200 }),
          }}
        >
          {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}%
        </animate.div>
      </div>

      <h3
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 500,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {metric.label}
      </h3>

      <animate.div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#1a1a1a',
        }}
      >
        {metric.unit}
        {typeof displayValue.current === 'number'
          ? displayValue.current.toLocaleString('en-US', {
              maximumFractionDigits: metric.unit === '%' ? 1 : 0,
            })
          : displayValue.current}
      </animate.div>
    </animate.div>
  );
};

const Example: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ExampleLayout
      title="Dashboard"
      description="Real-time metrics that count up with a spring whenever they refresh — auto-refreshes every 5s, or use the button below"
      onRestart={() => setRefreshKey((prev) => prev + 1)}
    >
      <div
        key={refreshKey}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24,
        }}
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </ExampleLayout>
  );
};

export default Example;
