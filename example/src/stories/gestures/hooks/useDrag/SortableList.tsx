import { useRef, useState, useMemo } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Real-world example: Sortable Task List
 * 
 * This demonstrates useDrag with multiple elements for:
 * - Dragging items to reorder
 * - Visual feedback during drag
 * - Maintaining list order state
 */
const Example = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Design new landing page', completed: false },
    { id: 2, title: 'Implement user authentication', completed: false },
    { id: 3, title: 'Write API documentation', completed: false },
    { id: 4, title: 'Optimize database queries', completed: false },
    { id: 5, title: 'Deploy to production', completed: false },
  ]);

  // Create refs for all tasks - use a ref to store them
  const refsMapRef = useRef<Map<number, React.RefObject<HTMLDivElement>>>(new Map());
  
  // Get or create ref for each task ID
  const getRef = (id: number): React.RefObject<HTMLDivElement> => {
    if (!refsMapRef.current.has(id)) {
      refsMapRef.current.set(id, { current: null });
    }
    return refsMapRef.current.get(id)!;
  };
  
  // Create array of refs in the same order as tasks
  const taskRefs = useMemo(
    () => tasks.map((task) => getRef(task.id)),
    [tasks]
  );

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [offsets, setOffsets] = useState<Array<{ x: number; y: number }>>(
    tasks.map(() => ({ x: 0, y: 0 }))
  );

  useDrag(
    taskRefs,
    ({ down, movement, index }) => {
      if (!down && draggedIndex !== null) {
        // Calculate new position based on movement
        const newIndex = Math.round(
          draggedIndex + movement.y / 60 // 60px per item
        );
        const clampedIndex = Math.max(0, Math.min(tasks.length - 1, newIndex));
        
        if (clampedIndex !== draggedIndex) {
          // Reorder tasks
          const newTasks = [...tasks];
          const [moved] = newTasks.splice(draggedIndex, 1);
          newTasks.splice(clampedIndex, 0, moved);
          setTasks(newTasks);
        }
        
        setDraggedIndex(null);
        setOffsets(tasks.map(() => ({ x: 0, y: 0 })));
      } else if (down) {
        if (draggedIndex === null) setDraggedIndex(index);
        
        const newOffsets = [...offsets];
        newOffsets[index] = {
          x: down ? movement.x : 0,
          y: down ? movement.y : 0,
        };
        setOffsets(newOffsets);
      }
    }
  );

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: 40,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ marginBottom: 32, fontSize: 32, fontWeight: 700, color: '#333' }}>
        Sortable Task List
      </h1>
      <div style={{ width: '100%', maxWidth: 600 }}>
        {tasks.map((task, index) => {
          const isDragging = draggedIndex === index;
          const offset = offsets[index];
          
          return (
            <animate.div
              key={task.id}
              ref={taskRefs[index]}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 20,
                marginBottom: 12,
                boxShadow: isDragging
                  ? '0 10px 30px rgba(0,0,0,0.2)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'grab',
                translateX: offset.x,
                translateY: offset.y,
                scale: isDragging ? 1.05 : 1,
                zIndex: isDragging ? 1000 : 1,
              }}
              animate={{
                translateX: !isDragging ? withSpring(0) : offset.x,
                translateY: !isDragging ? withSpring(0) : offset.y,
                scale: !isDragging ? withSpring(1) : 1.05,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: '2px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {task.completed && (
                    <span style={{ fontSize: 16 }}>✓</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 16,
                    color: task.completed ? '#999' : '#333',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {task.title}
                </span>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    cursor: 'grab',
                  }}
                >
                  ⋮⋮
                </div>
              </div>
            </animate.div>
          );
        })}
      </div>
      <p style={{ marginTop: 24, color: '#666', fontSize: 14 }}>
        Drag items up or down to reorder them
      </p>
    </div>
  );
};

export default Example;

