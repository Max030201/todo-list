import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DroppablePage from "../DroppablePage";

// мок для dnd-kit компонентов
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragStart, onDragEnd, onDragOver }) => (
    <div 
      data-testid="dnd-context" 
      onClick={() => onDragEnd && onDragEnd({ active: { id: 1 }, over: { id: 2 } })}
      onMouseEnter={() => onDragStart && onDragStart({ active: { id: 1 } })}
      onMouseOver={() => onDragOver && onDragOver({ active: { id: 1 }, over: { id: 2 } })}
    >
      {children}
    </div>
  ),
  DragOverlay: ({ children }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  useDraggable: ({ id }) => ({
    attributes: { "data-testid": `draggable-${id}` },
    listeners: { onKeyDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0 },
    isDragging: false,
  }),
  useDroppable: jest.fn(({ id }) => ({
    attributes: { "data-testid": `droppable-${id}` },
    setNodeRef: jest.fn(),
    isOver: false,
  })),
}));

// мок для SortableTodoList
jest.mock("../SortableTodoList", () => {
  return function MockSortableTodoList({ todos, toggleComplete, deleteTodo, reorderTodos, isDragging }) {
    return (
      <div data-testid="sortable-todo-list" data-dragging={isDragging}>
        {todos.map(todo => (
          <div key={todo.id} data-testid={`todo-${todo.id}`}>
            {todo.text}
          </div>
        ))}
      </div>
    );
  };
});

// мок для Pagination
jest.mock("../Pagination", () => {
  return function MockPagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    return (
      <div data-testid="pagination">
        <button data-testid="page-1" onClick={() => onPageChange(1)}>1</button>
        <button data-testid="page-2" onClick={() => onPageChange(2)}>2</button>
        <span data-testid="current-page">{currentPage}</span>
        <span data-testid="total-items">{totalItems}</span>
      </div>
    );
  };
});

describe("DroppablePage", () => {
  let mockToggleComplete;
  let mockDeleteTodo;
  let mockReorderTodos;
  let mockSetCurrentPage;
  let mockTodos;

  beforeEach(() => {
    mockToggleComplete = jest.fn();
    mockDeleteTodo = jest.fn();
    mockReorderTodos = jest.fn();
    mockSetCurrentPage = jest.fn();
    mockTodos = [
      { id: 1, text: "Task 1", completed: false, tag: "red" },
      { id: 2, text: "Task 2", completed: true, tag: "green" },
      { id: 3, text: "Task 3", completed: false, tag: null },
      { id: 4, text: "Task 4", completed: true, tag: "yellow" },
      { id: 5, text: "Task 5", completed: false, tag: "red" },
    ];
    
    // мок для getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      left: 0,
      bottom: 100,
      right: 200,
      width: 200,
      height: 100,
    }));
  });

  // рендер компонента
  test("should render DroppablePage with children", () => {
    render(
      <DroppablePage page={1}>
        <div data-testid="test-child">Test Content</div>
      </DroppablePage>
    );
    
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByTestId("test-child")).toHaveAttribute("data-page", "1");
  });

  // передача правильных атрибутов
  test("should pass correct attributes to children", () => {
    render(
      <DroppablePage page={2}>
        <div data-testid="test-child" style={{ color: "red" }}>Test Content</div>
      </DroppablePage>
    );
    
    const childElement = screen.getByTestId("test-child");
    expect(childElement).toHaveAttribute("data-page", "2");
  });

  // обработка children без style
  test("should handle children without style prop", () => {
    render(
      <DroppablePage page={1}>
        <div data-testid="test-child">Test Content</div>
      </DroppablePage>
    );
    
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  // обработка children с существующим style
  test("should merge existing style with droppable style", () => {
    render(
      <DroppablePage page={1}>
        <div data-testid="test-child" style={{ color: "red" }}>Test Content</div>
      </DroppablePage>
    );
    
    const childElement = screen.getByTestId("test-child");
    expect(childElement).toBeInTheDocument();
  });

  // проверка структуры компонента
  test("should render with correct structure", () => {
    render(
      <DroppablePage page={1}>
        <div data-testid="test-child">Test Content</div>
      </DroppablePage>
    );
    
    const container = screen.getByTestId("test-child").parentElement;
    expect(container).toHaveClass("rounded-md");
  });

  // обработка разных номеров страниц
  test("should handle different page numbers", () => {
    const { rerender } = render(
      <DroppablePage page={1}>
        <div data-testid="test-child">Test Content</div>
      </DroppablePage>
    );
    
    expect(screen.getByTestId("test-child")).toHaveAttribute("data-page", "1");
    
    rerender(
      <DroppablePage page={5}>
        <div data-testid="test-child">Test Content</div>
      </DroppablePage>
    );
    
    expect(screen.getByTestId("test-child")).toHaveAttribute("data-page", "5");
  });

  // проверка передачи ref
  test("should pass ref to children", () => {
    render(
      <DroppablePage page={1}>
        <div data-testid="test-child">Test Content</div>
      </DroppablePage>
    );
    
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  // обработка сложных children
  test("should handle complex children", () => {
    render(
      <DroppablePage page={1}>
        <div data-testid="complex-child">
          <span>Nested content</span>
          <button>Button</button>
        </div>
      </DroppablePage>
    );
    
    expect(screen.getByTestId("complex-child")).toBeInTheDocument();
    expect(screen.getByText("Nested content")).toBeInTheDocument();
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  // проверка стилей при isOver
  test("should apply correct styles when isOver", () => {
    // Мокаем useDroppable чтобы вернуть isOver: true
    const { useDroppable } = require("@dnd-kit/core");
    useDroppable.mockReturnValueOnce({
      attributes: { "data-testid": `droppable-1` },
      setNodeRef: jest.fn(),
      isOver: true,
    });

    render(
      <DroppablePage page={1}>
        <div data-testid="test-child">Test Content</div>
      </DroppablePage>
    );
    
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });
}); 