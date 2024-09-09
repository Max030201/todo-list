import React, { useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TAG_COLORS = {
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
};

const TodoItem = ({ todo, toggleComplete, deleteTodo, onTagSelect, isOverlay, isSelectMode = false, selected = false, onSelectTodo = () => {} }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isOverlay
      ? 0.5
      : isSelectMode && selected
      ? 0.5
      : isDragging
      ? 0.5
      : 1,
  };

  const handleToggleComplete = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleComplete(todo.id);
    },
    [toggleComplete, todo.id],
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      deleteTodo(todo.id);
    },
    [deleteTodo, todo.id],
  );

  const handleTagSelect = useCallback(
    (e) => {
      onTagSelect(todo.id, e.target.value);
    },
    [onTagSelect, todo.id],
  );

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (
      e.target.type === "checkbox" ||
      e.target.tagName === "BUTTON"
    ) {
      e.stopPropagation();
      e.preventDefault();
    } else if (e.target.tagName === "SELECT") {
      e.stopPropagation();
    }
  }, []);

  const isDisabled = isSelectMode;
  const isTransparent = isSelectMode || isOverlay;

  return (
    <div
      ref={isOverlay || isSelectMode ? undefined : setNodeRef}
      style={style}
      {...(isOverlay || isSelectMode ? {} : attributes)}
      {...(isOverlay || isSelectMode ? {} : listeners)}
      onMouseDown={isOverlay || isSelectMode ? undefined : handleMouseDown}
      className={
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 sm:p-4 bg-white cursor-move hover:bg-gray-50 transition-colors duration-200" +
        (isOverlay ? " pointer-events-none" : "") +
        (isSelectMode ? " cursor-pointer" : "")
      }
      onClick={isSelectMode ? () => onSelectTodo(todo.id) : undefined}
      data-testid={`todo-${todo.id}`}
    >
      <div className="grid grid-cols-[1.5rem_1fr] items-start sm:flex sm:items-center flex-1 min-w-0 gap-x-3">
        {isSelectMode ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelectTodo(todo.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 sm:mt-0"
            onClick={(e) => e.stopPropagation()}
            data-testid={`select-${todo.id}`}
          />
        ) : (
          <input
            key={`${todo.id}-${todo.completed}`}
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 sm:mt-0"
            onClick={handleClick}
            data-no-dnd="true"
            data-testid={`checkbox-${todo.id}`}
          />
        )}
        <div className="min-w-0 sm:ml-3 flex items-center gap-2">
          <span
            className={`break-words ${todo.completed ? "line-through text-gray-500" : "text-gray-700"}`}
            style={{ wordBreak: "break-word" }}
          >
            {todo.text}
          </span>
          {todo.tag && (
            <span
              className={`inline-block align-middle ml-2 px-2 py-0.5 rounded-full text-xs text-black font-medium ${TAG_COLORS[todo.tag]}`}
            >
              {todo.tag}
            </span>
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
        <select
          value={todo.tag || ""}
          onChange={handleTagSelect}
          className={`text-sm border border-gray-300 rounded px-2 py-1${isTransparent ? " opacity-50" : ""}`}
          data-no-dnd="true"
          disabled={isDisabled}
        >
          <option value="">Без тега</option>
          {Object.keys(TAG_COLORS).map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
        <button
          onClick={handleDelete}
          className={`text-red-500 hover:text-red-700 focus:outline-none${isTransparent ? " opacity-50" : ""}`}
          data-no-dnd="true"
          disabled={isDisabled}
          data-testid={`delete-${todo.id}`}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
