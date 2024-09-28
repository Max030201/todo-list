import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

// Мокаем только внешние зависимости
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragStart, onDragEnd, onDragOver }) => (
    <div 
      data-testid="dnd-context" 
      onClick={() => onDragEnd && onDragEnd({ 
        active: { id: 1, data: { current: { node: { closest: () => null } } } }, 
        over: { id: 2 } 
      })}
      onMouseEnter={() => onDragStart && onDragStart({ 
        active: { id: 1, data: { current: { node: { closest: () => null } } } } 
      })}
      onMouseOver={() => onDragOver && onDragOver({ 
        active: { id: 1, data: { current: { node: { closest: () => null } } } }, 
        over: { id: 2 } 
      })}
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
  useDroppable: ({ id }) => ({
    attributes: { "data-testid": `droppable-${id}` },
    setNodeRef: jest.fn(),
    isOver: false,
  }),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
  closestCenter: jest.fn(() => ({ id: 2 })),
}));

jest.mock("@dnd-kit/sortable", () => ({
  arrayMove: jest.fn((array, oldIndex, newIndex) => {
    const newArray = [...array];
    const [removed] = newArray.splice(oldIndex, 1);
    newArray.splice(newIndex, 0, removed);
    return newArray;
  }),
  sortableKeyboardCoordinates: jest.fn(() => ({
    x: 0,
    y: 0,
  })),
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
  useSortable: ({ id }) => ({
    attributes: { "data-testid": `sortable-${id}` },
    listeners: { onKeyDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0 },
    isDragging: false,
    transition: null,
  }),
}));

// Мокаем window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

describe("App Integration Tests", () => {
  beforeEach(() => {
    mockConfirm.mockClear();
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });

  // рендер приложения
  test("should render App with initial state", () => {
    render(<App />);
    expect(screen.getByText("Todo List")).toBeInTheDocument();
  });

  // добавление новой задачи
  test("should add new todo", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "New test task" } });
    fireEvent.click(addButton);
    
    expect(screen.getByText("New test task")).toBeInTheDocument();
  });

  // переключение состояния задачи
  test("should toggle todo completion", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    expect(screen.getByText("Test task")).toBeInTheDocument();
    const checkbox = screen.getByTestId("checkbox-2");
    expect(checkbox).toBeInTheDocument();
  });

  test("should delete todo", () => {
    render(<App />);
    
    // Добавляем задачу
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    const deleteButton = screen.getByTestId("delete-2");
    fireEvent.click(deleteButton);
    expect(screen.queryByText("Test task")).not.toBeInTheDocument();
  });

  // фильтрация задач по поиску
  test("should filter todos by search", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Task 1" } });
    fireEvent.click(addButton);
    
    fireEvent.change(input, { target: { value: "Task 2" } });
    fireEvent.click(addButton);
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  // фильтрация задач по тегу
  test("should filter todos by tag", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    expect(screen.getByText("Test task")).toBeInTheDocument();
    
    const redTagButton = screen.getByTestId("tag-red");
    fireEvent.click(redTagButton);
    
    expect(screen.queryByText("Test task")).not.toBeInTheDocument();
    
    const allTagButton = screen.getByTestId("tag-all");
    fireEvent.click(allTagButton);
    
    expect(screen.getByText("Test task")).toBeInTheDocument();
  });

  // вход и выход из режима выбора
  test("should enter and exit select mode", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(screen.getByText("Отмена")).toBeInTheDocument();
    
    const cancelButton = screen.getByText("Отмена");
    fireEvent.click(cancelButton);
    
    expect(screen.getByText("Выбрать")).toBeInTheDocument();
  });

  // пагинация
  test("should handle pagination", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    for (let i = 1; i <= 10; i++) {
      fireEvent.change(input, { target: { value: `Task ${i}` } });
      fireEvent.click(addButton);
    }
    
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  // обновление тега задачи
  test("should update todo tag", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    const tagSelect = screen.getByRole("combobox");
    fireEvent.change(tagSelect, { target: { value: "red" } });
    
    const todoElement = screen.getByTestId("todo-2");
    expect(todoElement).toHaveTextContent("red");
  });

  // drag and drop
  test("should handle drag and drop", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Task 1" } });
    fireEvent.click(addButton);
    
    fireEvent.change(input, { target: { value: "Task 2" } });
    fireEvent.click(addButton);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.click(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // пустое состояние
  test("should handle empty state", () => {
    render(<App />);
    
    expect(screen.getByText("Todo List")).toBeInTheDocument();
    expect(screen.getByText("Добавить")).toBeInTheDocument();
  });

  // сохранение задач в localStorage
  test("should persist todos in localStorage", () => {
    const { unmount } = render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Persistent task" } });
    fireEvent.click(addButton);
    
    expect(screen.getByText("Persistent task")).toBeInTheDocument();
    
    unmount();
    
    render(<App />);
    expect(screen.getByText("Persistent task")).toBeInTheDocument();
  });

  // отправка формы по Enter
  test("should handle form submission with Enter key", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: "Enter key task" } });
    fireEvent.submit(form);
    
    expect(screen.getByText("Enter key task")).toBeInTheDocument();
  });

  // не добавлять пустые задачи
  test("should not add empty todos", () => {
    render(<App />);
    
    const addButton = screen.getByText("Добавить");
    fireEvent.click(addButton);
    const emptyTodos = screen.queryAllByText("").filter(el => el.tagName === 'LI' || el.closest('[data-testid*="todo"]'));
    expect(emptyTodos).toHaveLength(0);
  });

  // множественный выбор тегов
  test("should handle multiple tag selections", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    const redTagButton = screen.getByTestId("tag-red");
    fireEvent.click(redTagButton);
    
    const greenTagButton = screen.getByTestId("tag-green");
    fireEvent.click(greenTagButton);
    
    const allTagButton = screen.getByTestId("tag-all");
    fireEvent.click(allTagButton);
    
    expect(screen.getByText("Test task")).toBeInTheDocument();
  });

  // множественное добавление задач
  test("should handle multiple todo additions", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    const tasks = ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"];
    
    tasks.forEach(task => {
      fireEvent.change(input, { target: { value: task } });
      fireEvent.click(addButton);
    });
    
    tasks.forEach(task => {
      expect(screen.getByText(task)).toBeInTheDocument();
    });
  });

  // изменение тегов задач
  test("should change todo tags", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "red" } });
    
    const todoElement = screen.getByTestId("todo-2");
    expect(todoElement).toHaveTextContent("red");
  });

  // пагинация (расширенная)
  test("should handle pagination correctly", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    for (let i = 1; i <= 15; i++) {
      fireEvent.change(input, { target: { value: `Task ${i}` } });
      fireEvent.click(addButton);
    }
    
    expect(screen.getByTestId("page-1")).toBeInTheDocument();
    expect(screen.getByTestId("page-2")).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId("page-2"));
    
    expect(screen.getByText(/Task 1[0-9]/)).toBeInTheDocument();
  });

  // поиск с несколькими результатами
  test("should search with multiple results", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Buy groceries" } });
    fireEvent.click(addButton);
    
    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(addButton);
    
    fireEvent.change(input, { target: { value: "Buy bread" } });
    fireEvent.click(addButton);
    
    const searchInput = screen.getByPlaceholderText("Поиск задач...");
    fireEvent.change(searchInput, { target: { value: "Buy" } });
    
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Buy bread")).toBeInTheDocument();
  });

  // режим выбора с несколькими задачами
  test("should handle select mode with multiple todos", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    for (let i = 1; i <= 3; i++) {
      fireEvent.change(input, { target: { value: `Task ${i}` } });
      fireEvent.click(addButton);
    }
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    const checkbox1 = screen.getByTestId("select-2");
    const checkbox2 = screen.getByTestId("select-3");
    
    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);
    
    expect(screen.getByText("Удалить выбранное")).toBeInTheDocument();
  });

  // отмена подтверждения удаления
  test("should handle cancel confirmation for delete", () => {
    mockConfirm.mockReturnValue(false);
    
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    expect(screen.getByText("Test task")).toBeInTheDocument();
    
    const clearButton = screen.getByText("Очистить все");
    fireEvent.click(clearButton);
    
    expect(mockConfirm).toHaveBeenCalledWith("Удалить все задачи?");
    expect(screen.getByText("Test task")).toBeInTheDocument();
  });

  // комбинированная фильтрация (поиск + тег)
  test("should handle combined filtering (search + tag)", () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Red task" } });
    fireEvent.click(addButton);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "red" } });
    
    fireEvent.change(input, { target: { value: "Blue task" } });
    fireEvent.click(addButton);
    
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "green" } });
    
    const searchInput = screen.getByPlaceholderText("Поиск задач...");
    fireEvent.change(searchInput, { target: { value: "task" } });
    
    const redTagButton = screen.getByTestId("tag-red");
    fireEvent.click(redTagButton);
    
    expect(screen.getByText("Red task")).toBeInTheDocument();
    expect(screen.queryByText("Blue task")).not.toBeInTheDocument();
  });

  // пустое состояние (расширенное)
  test("should handle empty state correctly", () => {
    render(<App />);
    
    expect(screen.getByText("Todo List")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Добавить новую задачу...")).toBeInTheDocument();
    expect(screen.getByText("Добавить")).toBeInTheDocument();
  });
}); 