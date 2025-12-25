import { useState } from 'react';
import { animate, Presence, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

var _uniqueId = 0;

const Example = () => {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<{ id: number; text: string }[]>([]);

  const saveTodo = () => {
    if (!text.trim()) return;
    setTodos((prev) => [...prev, { id: _uniqueId++, text }]);
    setText('');
  };

  const removeTodo = (id: number) => {
    setTodos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ExampleLayout
      title="Todo List with Animations"
      description="A fully animated todo list with smooth enter/exit animations. Items animate in when added and animate out when removed."
      onRestart={() => {
        setTodos([]);
        setText('');
      }}
      showRestartButton={false}
    >
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
          <input
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: '2px solid #e0e0e0',
              fontSize: 14,
              flex: 1,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            value={text}
            placeholder="Enter todo..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveTodo()}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3399ff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          />

          <button
            style={{
              backgroundColor: '#3399ff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(51, 153, 255, 0.3)',
              transition: 'transform 0.2s',
            }}
            onClick={saveTodo}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Add Todo
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: 12,
          }}
        >
          <Presence>
            {todos.map(({ id, text }) => (
              <animate.div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0,
                  height: 0,
                  scale: 0.8,
                  overflow: 'hidden',
                }}
                animate={{
                  opacity: withSpring(1, { damping: 20 }),
                  height: withSpring(56, { damping: 20 }),
                  scale: withSpring(1, { damping: 20 }),
                }}
                exit={{
                  opacity: withSpring(0, { damping: 20 }),
                  height: withSpring(0, { damping: 20 }),
                  scale: withSpring(0.8, { damping: 20 }),
                }}
              >
                <div
                  style={{
                    border: '2px solid #3399ff',
                    borderRadius: 8,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    height: 56,
                    paddingLeft: 20,
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    backgroundColor: '#f0f9ff',
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#1a1a1a',
                  }}
                >
                  {text}
                </div>
                <button
                  style={{
                    border: '2px solid #ff6b6b',
                    borderLeftWidth: '0px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    height: 56,
                    width: 56,
                    cursor: 'pointer',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 600,
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => removeTodo(id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff5252';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff6b6b';
                  }}
                >
                  ×
                </button>
              </animate.div>
            ))}
          </Presence>
        </div>
      </div>
    </ExampleLayout>
  );
};

export default Example;
