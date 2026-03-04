import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskItem } from './taskItem';

export const SortableTaskItem = ({ task, editTask, deleteTask, categories }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        editTask={editTask}
        deleteTask={deleteTask}
        categories={categories}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </li>
  );
};
