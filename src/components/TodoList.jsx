import React from "react";
import TodoItem from "./TodoItem.jsx";

const TodoList = ({ todos, toggleComplete, deleteTodo, onTagSelect }) => {
  return (
    <div className="mt-4 w-full">
      {todos.length === 0 ? (
        <p className="text-center text-gray-500">Нет задач</p>
      ) : (
        <div
          data-testid="todo-list-container"
          className="bg-white rounded-lg shadow divide-y divide-gray-200"
        >
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
      )}
    </div>
  );
};

export default TodoList;
