import React, { useState } from "react";

const TodoForm = ({ addTodo }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 w-full">
      <div className="flex flex-col xs:flex-row items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Добавить новую задачу..."
          className="appearance-none bg-transparent border border-gray-300 rounded w-full text-gray-700 py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full xs:w-auto bg-blue-500 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded transition-colors duration-200"
          data-testid="add-todo-btn"
        >
          Добавить
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
