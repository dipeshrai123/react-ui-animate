import { useEffect, useState } from 'react';
import { animate, Mount, withSpring } from 'react-ui-animate';

const TodoListItem = ({
  text,
  onRemove,
}: {
  text: string;
  onRemove: () => void;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <Mount
      state={visible}
      exit={withSpring(0, { onComplete: () => onRemove() })}
    >
      {(opacity) => (
        <animate.div
          style={{
            display: 'flex',
            alignItems: 'center',
            opacity,
            height: opacity.to([0, 1], [0, 40]),
            scale: opacity.to([0, 1], [0.8, 1]),
            width: 320,
            overflow: 'hidden',
          }}
        >
          <animate.div
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
          </animate.div>
          <button
            style={{
              border: '1px solid #3399ff',
              borderLeftWidth: '0px',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              height: 40,
            }}
            onClick={() => setVisible(false)}
          >
            X
          </button>
        </animate.div>
      )}
    </Mount>
  );
};

var _uniqueId = 0;

const Example = () => {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<{ id: number; text: string }[]>([]);

  const saveTodo = () => {
    setTodos((prev) => [...prev, { id: _uniqueId++, text }]);
    setText('');
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
          flexDirection: 'column',
          gap: 10,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {todos
          .map(({ id, text }) => (
            <TodoListItem
              key={id}
              text={text}
              onRemove={() =>
                setTodos((prev) => prev.filter((p) => p.id !== id))
              }
            />
          ))
          .reverse()}
      </div>
    </div>
  );
};

export default Example;
