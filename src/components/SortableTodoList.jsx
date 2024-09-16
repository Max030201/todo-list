import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TodoItem from "./TodoItem.jsx";

const SortableTodoList = ({
  todos,
  toggleComplete,
  deleteTodo,
  onTagSelect,
  isSelectMode = false,
  selectedIds = [],
  onSelectTodo = () => {},
}) => {
  if (todos.length === 0) {
    return <p className="text-center text-gray-500">Нет задач</p>;
  }
  if (isSelectMode) {
    return (
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200 mt-4 w-full">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleComplete={toggleComplete}
            deleteTodo={deleteTodo}
            onTagSelect={onTagSelect}
            isSelectMode={true}
            selected={selectedIds.includes(todo.id)}
            onSelectTodo={onSelectTodo}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-4 w-full">
      <SortableContext
        items={todos.map((todo) => todo.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              toggleComplete={toggleComplete}
              deleteTodo={deleteTodo}
              onTagSelect={onTagSelect}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default SortableTodoList;
