import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TodoList from "../TodoList";

// мок для TodoItem компонента
jest.mock("../TodoItem", () => {
  return function MockTodoItem({ todo, toggleComplete, deleteTodo, isDragging }) {
    return (
      <div data-testid={`todo-item-${todo.id}`} data-dragging={isDragging}>
        <span>{todo.text}</span>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleComplete(todo.id)}
          data-testid={`checkbox-${todo.id}`}
        />
        <button
          onClick={() => deleteTodo(todo.id)}
          data-testid={`delete-${todo.id}`}
        >
          ×
        </button>
      </div>
    );
  };
});

describe("TodoList", () => {
  let mockToggleComplete;
  let mockDeleteTodo;
  let mockTodos;

  beforeEach(() => {
    mockToggleComplete = jest.fn();
    mockDeleteTodo = jest.fn();
    mockTodos = [
      { id: 1, text: "Task 1", completed: false, tag: "red" },
      { id: 2, text: "Task 2", completed: true, tag: "green" },
      { id: 3, text: "Task 3", completed: false, tag: null },
    ];
  });

  // рендер списка задач
  test("should render all todo items", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("todo-item-3")).toBeInTheDocument();
  });

  // рендер пустого списка
  test("should render empty list message when no todos", () => {
    render(
      <TodoList
        todos={[]}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    expect(screen.getByText("Нет задач")).toBeInTheDocument();
  });

  // передача пропсов в TodoItem
  test("should pass correct props to TodoItem components", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-item-2")).toBeInTheDocument();
  });

  // передача isDragging в TodoItem
  test("should pass isDragging prop to TodoItem components", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={true}
      />
    );
    
    expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
  });

  // вызов toggleComplete через TodoItem
  test("should call toggleComplete when TodoItem checkbox is clicked", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    const checkbox = screen.getByTestId("checkbox-2");
    fireEvent.click(checkbox);
    
    expect(mockToggleComplete).toHaveBeenCalledWith(2);
  });

  // вызов deleteTodo через TodoItem
  test("should call deleteTodo when TodoItem delete button is clicked", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    const deleteButton = screen.getByTestId("delete-1");
    fireEvent.click(deleteButton);
    
    expect(mockDeleteTodo).toHaveBeenCalledWith(1);
  });

  // множественные действия
  test("should handle multiple actions correctly", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    const checkbox1 = screen.getByTestId("checkbox-1");
    const deleteButton2 = screen.getByTestId("delete-2");
    
    fireEvent.click(checkbox1);
    fireEvent.click(deleteButton2);
    
    expect(mockToggleComplete).toHaveBeenCalledWith(1);
    expect(mockDeleteTodo).toHaveBeenCalledWith(2);
  });

  // отображение текста задач
  test("should display todo text correctly", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // состояние чекбоксов
  test("should display correct checkbox states", () => {
    render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    const checkbox1 = screen.getByTestId("checkbox-1");
    const checkbox2 = screen.getByTestId("checkbox-2");
    
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).toBeChecked();
  });

  // стили контейнера
  test("should apply correct container styles", () => {
    const { container } = render(
      <TodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    const listContainer = container.firstChild;
    expect(listContainer).toHaveClass("mt-4", "w-full");
  });

  // обработка больших списков
  test("should handle large todo lists", () => {
    const largeTodoList = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      text: `Task ${index + 1}`,
      completed: index % 2 === 0,
      tag: index % 3 === 0 ? "red" : index % 3 === 1 ? "green" : "yellow",
    }));
    
    render(
      <TodoList
        todos={largeTodoList}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        isDragging={false}
      />
    );
    
    expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-item-100")).toBeInTheDocument();
  });
}); 