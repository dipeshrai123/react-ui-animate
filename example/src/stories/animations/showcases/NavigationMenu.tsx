import React, { useState } from 'react';
import { animate, withSpring, withTiming, Presence } from 'react-ui-animate';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', color: '#3399ff' },
  { id: 'explore', label: 'Explore', icon: '🔍', color: '#ff6b6b' },
  { id: 'library', label: 'Library', icon: '📚', color: '#51cf66' },
  { id: 'settings', label: 'Settings', icon: '⚙️', color: '#ffd43b' },
  { id: 'profile', label: 'Profile', icon: '👤', color: '#845ef7' },
];

const MenuItemComponent: React.FC<{
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
  index: number;
}> = ({ item, isActive, onClick, index }) => {
  return (
    <animate.li
      onClick={onClick}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
      animate={{
        translateX: withSpring(isActive ? 8 : 0, {
          stiffness: 300,
          damping: 25,
        }),
      }}
    >
      <animate.div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          borderRadius: 12,
          cursor: 'pointer',
          backgroundColor: isActive ? `${item.color}15` : 'transparent',
          scale: 1,
          translateX: 0,
        }}
        hover={{
          backgroundColor: withTiming(`${item.color}20`, { duration: 200 }),
          scale: withSpring(1.02, { stiffness: 300, damping: 20 }),
          translateX: withSpring(4, { stiffness: 300, damping: 20 }),
        }}
        press={{
          scale: withSpring(0.98, { stiffness: 400, damping: 25 }),
        }}
      >
        <animate.div
          style={{
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            scale: 1,
            rotate: 0,
          }}
        >
          {item.icon}
        </animate.div>
        <animate.span
          style={{
            fontSize: 16,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? item.color : '#666',
          }}
        >
          {item.label}
        </animate.span>
        {isActive && (
          <animate.div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: item.color,
              marginLeft: 'auto',
              scale: 0,
            }}
            animate={{
              scale: withSpring(1, { stiffness: 300, damping: 20 }),
            }}
          />
        )}
      </animate.div>
    </animate.li>
  );
};

const Example: React.FC = () => {
  const [activeItem, setActiveItem] = useState('home');

  return (
    <div
      style={{ padding: 40, backgroundColor: '#f5f5f5', minHeight: '100vh' }}
    >
      <div style={{ maxWidth: 300, margin: '0 auto' }}>
        <h1
          style={{
            marginBottom: 32,
            fontSize: 24,
            fontWeight: 700,
            color: '#1a1a1a',
          }}
        >
          Navigation Menu
        </h1>

        <animate.nav
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <ul style={{ margin: 0, padding: 0 }}>
            <Presence>
              {menuItems.map((item, index) => (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  isActive={activeItem === item.id}
                  onClick={() => setActiveItem(item.id)}
                  index={index}
                />
              ))}
            </Presence>
          </ul>
        </animate.nav>
      </div>
    </div>
  );
};

export default Example;
