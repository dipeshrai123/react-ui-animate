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
      {(a) => (
        <animate.div style={{ opacity: a }}>
          <div onClick={() => setVisible(false)}>REMOVE</div>
          {text}
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
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={saveTodo}>Save</button>

      {todos.map(({ id, text }) => (
        <TodoListItem
          key={id}
          text={text}
          onRemove={() => console.log('removed')}
        />
      ))}
    </div>
  );
};

export default Example;
