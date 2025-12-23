import { useState } from 'react';
import { animate, Presence, withSpring } from 'react-ui-animate';

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
    <div>
      <input
        style={{
          padding: '10px 16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          marginRight: 10,
        }}
        value={text}
        placeholder="Enter todo..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && saveTodo()}
      />

      <button
        style={{ backgroundColor: '#3399ff', color: 'white', border: 'none' }}
        onClick={saveTodo}
      >
        Add Todo
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 10,
          marginTop: 20,
          marginBottom: 20,
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
                width: 320,
                overflow: 'hidden',
              }}
              animate={{
                opacity: withSpring(1, { damping: 20 }),
                height: withSpring(40, { damping: 20 }),
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
                  border: '1px solid #3399ff',
                  borderRadius: 4,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  height: 40,
                  paddingLeft: 16,
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                {text}
              </div>
              <button
                style={{
                  border: '1px solid #3399ff',
                  borderLeftWidth: '0px',
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  height: 40,
                  cursor: 'pointer',
                }}
                onClick={() => removeTodo(id)}
              >
                X
              </button>
            </animate.div>
          ))}
        </Presence>
      </div>
    </div>
  );
};

export default Example;
