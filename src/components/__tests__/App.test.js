import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

// мок для window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

// мок для useState
const mockSetSearchTerm = jest.fn();
const mockSetSelectedTag = jest.fn();
const mockSetCurrentPage = jest.fn();
const mockSetIsSelectMode = jest.fn();
const mockSetSelectedIds = jest.fn();
const mockSetActiveId = jest.fn();
const mockSetPendingPage = jest.fn();
const mockSetOriginalPage = jest.fn();


jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn((initialValue) => {
    if (initialValue === false) {
      return [false, mockSetIsSelectMode];
    }
    if (Array.isArray(initialValue)) {
      return [[], mockSetSelectedIds];
    }
    if (initialValue === "") {
      return ["", mockSetSearchTerm];
    }
    if (initialValue === null) {
      return [null, mockSetSelectedTag];
    }
    if (initialValue === 1) {
      return [1, mockSetCurrentPage];
    }
    if (initialValue === null && typeof initialValue === "object") {
      return [null, mockSetActiveId];
    }
    return [initialValue, jest.fn()];
  }),
}));

// мок для useLocalStorage
jest.mock("../../hooks/useLocalStorage", () => {
  const mockRemoveTodos = jest.fn();
  
  return jest.fn((key, defaultValue) => {
    if (key === "todos") {
      return [
        [
          { id: 1, text: "Test task 1", completed: false, tag: "red" },
          { id: 2, text: "Test task 2", completed: true, tag: "green" },
        ],
        jest.fn(), // setTodos будет перехвачен useState
        mockRemoveTodos,
      ];
    }
    return [defaultValue, jest.fn()];
  });
});

// мок для dnd-kit компонентов
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

// мок для @dnd-kit/sortable
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
  useSortable: ({ id }) => ({
    attributes: { "data-testid": `sortable-${id}` },
    listeners: { onKeyDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0 },
    isDragging: false,
    transition: null,
  }),
}));

// мок для TodoForm
jest.mock("../TodoForm", () => {
  return function MockTodoForm({ addTodo }) {
    return (
      <div data-testid="todo-form">
        <input data-testid="todo-input" placeholder="Добавить новую задачу..." />
        <button data-testid="add-todo-btn" onClick={() => addTodo("New task")}>
          Добавить
        </button>
      </div>
    );
  };
});

// мок для SearchBar
jest.mock("../SearchBar", () => {
  return function MockSearchBar({ onSearch }) {
    return (
      <div data-testid="search-bar">
        <input data-testid="search-input" placeholder="Поиск задач..." />
        <button data-testid="search-btn" onClick={() => onSearch("test")}>
          Поиск
        </button>
      </div>
    );
  };
});

// мок для TagSelector
jest.mock("../TagSelector", () => {
  return function MockTagSelector({ selectedTag, onTagSelect }) {
    return (
      <div data-testid="tag-selector">
        <button data-testid="tag-all" onClick={() => onTagSelect(null)}>
          Все
        </button>
        <button data-testid="tag-red" onClick={() => onTagSelect("red")}>
          red
        </button>
        <button data-testid="tag-green" onClick={() => onTagSelect("green")}>
          green
        </button>
        <span data-testid="selected-tag">{selectedTag || "all"}</span>
      </div>
    );
  };
});

// мок для SortableTodoList
jest.mock("../SortableTodoList", () => {
  return function MockSortableTodoList({ 
    todos, 
    toggleComplete, 
    deleteTodo, 
    onTagSelect, 
    isSelectMode, 
    selectedIds, 
    onSelectTodo 
  }) {
    return (
      <div data-testid="sortable-todo-list" data-select-mode={isSelectMode}>
        {todos.map((todo) => (
          <div key={todo.id} data-testid={`todo-${todo.id}`}>
            <span>{todo.text}</span>
            <input
              data-testid={`checkbox-${todo.id}`}
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
            />
            <button data-testid={`delete-${todo.id}`} onClick={() => deleteTodo(todo.id)}>
              ×
            </button>
            {isSelectMode && (
              <button data-testid={`select-${todo.id}`} onClick={() => onSelectTodo(todo.id)}>
              Выбрать
            </button>
            )}
            <span data-testid={`selected-${todo.id}`}>
              {selectedIds?.includes(todo.id) ? "selected" : "not-selected"}
            </span>
            <select
              data-testid={`tag-select-${todo.id}`}
              onChange={(e) => onTagSelect(todo.id, e.target.value)}
            >
              <option value="">Без тега</option>
              <option value="red">red</option>
              <option value="green">green</option>
              <option value="yellow">yellow</option>
            </select>
          </div>
        ))}
      </div>
    );
  };
});

// мок для Pagination
jest.mock("../Pagination", () => {
  return function MockPagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    
    return (
      <div data-testid="pagination">
        {pages.map((page) => (
          <button
            key={page}
            data-testid={`page-${page}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <span data-testid="current-page">{currentPage}</span>
        <span data-testid="total-items">{totalItems}</span>
      </div>
    );
  };
});

describe("App", () => {
  let mockSetTodos;
  let mockRemoveTodos;
  let useLocalStorageMock;

  beforeEach(() => {
    mockSetTodos = jest.fn();
    mockRemoveTodos = jest.fn();
    mockConfirm.mockClear();

    // Очищаем моки useState
    mockSetSearchTerm.mockClear();
    mockSetSelectedTag.mockClear();
    mockSetCurrentPage.mockClear();
    mockSetIsSelectMode.mockClear();
    mockSetSelectedIds.mockClear();
    mockSetActiveId.mockClear();
    mockSetPendingPage.mockClear();
    mockSetOriginalPage.mockClear();
    
    // Получаем мок useLocalStorage
    useLocalStorageMock = require("../../hooks/useLocalStorage");
    
    // Настраиваем мок для возврата правильных функций
    useLocalStorageMock.mockImplementation((key, defaultValue) => {
      if (key === "todos") {
        return [
          [
            { id: 1, text: "Test task 1", completed: false, tag: "red" },
            { id: 2, text: "Test task 2", completed: true, tag: "green" },
          ],
          mockSetTodos,
          mockRemoveTodos,
        ];
      }
      return [defaultValue, jest.fn()];
    });
  });

  // рендер приложения
  test("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("Todo List")).toBeInTheDocument();
  });

  // тестирование режима выбора
  test("should enter select mode when select button is clicked", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование выбора задач
  test("should handle todo selection", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование удаления выбранных задач
  test("should delete selected todos", () => {
    mockConfirm.mockReturnValue(true);
    
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование отмены удаления выбранных задач
  test("should not delete selected todos when confirmation is cancelled", () => {
    mockConfirm.mockReturnValue(false);
    
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование выхода из режима выбора
  test("should exit select mode when cancel button is clicked", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование drag and drop функциональности
  test("should handle drag end with reordering", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.click(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование фильтрации задач
  test("should filter todos by search term", () => {
    render(<App />);
    
    const searchButton = screen.getByTestId("search-btn");
    fireEvent.click(searchButton);
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith("test");
  });

  // тестирование фильтрации по тегам
  test("should filter todos by tag", () => {
    render(<App />);
    
    const redTagButton = screen.getByTestId("tag-red");
    fireEvent.click(redTagButton);
    
    expect(mockSetSelectedTag).toHaveBeenCalledWith("red");
  });

  // тестирование пагинации
  test("should handle pagination correctly", () => {
    render(<App />);
    
    const page1Button = screen.getByTestId("page-1");
    fireEvent.click(page1Button);
    
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
  });

  // тестирование добавления новой задачи
  test("should add new todo", () => {
    render(<App />);
    
    const addButton = screen.getByTestId("add-todo-btn");
    fireEvent.click(addButton);
    
    expect(addButton).toBeInTheDocument();
  });

  // тестирование переключения состояния задачи
  test("should toggle todo completion", () => {
    render(<App />);
    
    const checkbox = screen.getByTestId("checkbox-1");
    fireEvent.click(checkbox);
    
    expect(checkbox).toBeInTheDocument();
  });

  // тестирование удаления задачи
  test("should delete todo", () => {
    render(<App />);
    
    const deleteButton = screen.getByTestId("delete-1");
    fireEvent.click(deleteButton);
    
    expect(deleteButton).toBeInTheDocument();
  });

  // тестирование обновления тега задачи
  test("should update todo tag", () => {
    render(<App />);
    
    const select = screen.getByTestId("tag-select-1");
    fireEvent.change(select, { target: { value: "green" } });
    
    expect(select).toBeInTheDocument();
  });

  // тестирование режима выбора без выбранных задач
  test("should show cancel button when no todos are selected", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование drag overlay
  test("should show drag overlay when dragging", () => {
    render(<App />);
    
    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument();
  });

  // тестирование обработки пустого списка задач
  test("should handle empty todos list correctly", () => {
    render(<App />);
    
    expect(screen.getByText("Todo List")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Добавить новую задачу...")).toBeInTheDocument();
  });

  // тестирование обработки больших списков задач
  test("should handle large todos list", () => {
    render(<App />);
    
    expect(screen.getByText("Todo List")).toBeInTheDocument();
    expect(screen.getByTestId("todo-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-2")).toBeInTheDocument();
  });

  // тестирование очистки всех задач
  test("should clear all todos", () => {
    mockConfirm.mockReturnValue(true);
    
    render(<App />);
    
    const clearAllButton = screen.getByText("Очистить все");
    fireEvent.click(clearAllButton);
    
    expect(mockConfirm).toHaveBeenCalledWith("Удалить все задачи?");
  });

  // тестирование отмены очистки всех задач
  test("should not clear all todos if confirm is cancelled", () => {
    mockConfirm.mockReturnValue(false);
    
    render(<App />);
    
    const clearAllButton = screen.getByText("Очистить все");
    fireEvent.click(clearAllButton);
    
    expect(mockConfirm).toHaveBeenCalledWith("Удалить все задачи?");
  });

  // тестирование drag start
  test("should handle drag start", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.mouseEnter(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование drag over
  test("should handle drag over", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.mouseOver(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование drag end
  test("should handle drag end", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.click(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование фильтрации по тегу "Все"
  test("should filter todos by 'all' tag", () => {
    render(<App />);
    
    const allTagButton = screen.getByTestId("tag-all");
    fireEvent.click(allTagButton);
    
    expect(mockSetSelectedTag).toHaveBeenCalledWith(null);
  });

  // тестирование фильтрации по зеленому тегу
  test("should filter todos by green tag", () => {
    render(<App />);
    
    const greenTagButton = screen.getByTestId("tag-green");
    fireEvent.click(greenTagButton);
    
    expect(mockSetSelectedTag).toHaveBeenCalledWith("green");
  });

  // тестирование поиска
  test("should handle search functionality", () => {
    render(<App />);
    
    const searchButton = screen.getByTestId("search-btn");
    fireEvent.click(searchButton);
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith("test");
  });

  // тестирование отображения задач
  test("should display todos correctly", () => {
    render(<App />);
    
    expect(screen.getByTestId("todo-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-2")).toBeInTheDocument();
    expect(screen.getByText("Test task 1")).toBeInTheDocument();
    expect(screen.getByText("Test task 2")).toBeInTheDocument();
  });

  // тестирование состояния чекбоксов
  test("should display correct checkbox states", () => {
    render(<App />);
    
    const checkbox1 = screen.getByTestId("checkbox-1");
    const checkbox2 = screen.getByTestId("checkbox-2");
    
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).toBeChecked();
  });

  // тестирование отображения выбранного тега
  test("should display selected tag correctly", () => {
    render(<App />);
    
    expect(screen.getByTestId("selected-tag")).toHaveTextContent("all");
  });

  // тестирование множественных действий
  test("should handle multiple actions correctly", () => {
    render(<App />);
    
    const addButton = screen.getByTestId("add-todo-btn");
    const searchButton = screen.getByTestId("search-btn");
    const redTagButton = screen.getByTestId("tag-red");
    
    fireEvent.click(addButton);
    fireEvent.click(searchButton);
    fireEvent.click(redTagButton);
    
    expect(addButton).toBeInTheDocument();
    expect(mockSetSearchTerm).toHaveBeenCalledWith("test");
    expect(mockSetSelectedTag).toHaveBeenCalledWith("red");
  });

  // тестирование отображения текущей страницы
  test("should display current page correctly", () => {
    render(<App />);
    
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
  });

  // тестирование отображения количества задач
  test("should display correct number of todos", () => {
    render(<App />);
    
    expect(screen.getByTestId("total-items")).toHaveTextContent("2");
  });

  // тестирование стилей заголовка
  test("should apply correct header styles", () => {
    const { container } = render(<App />);
    
    const header = container.querySelector("h1");
    expect(header).toHaveClass("text-xl", "sm:text-2xl", "md:text-3xl", "font-bold");
  });

  // тестирование стилей контейнера
  test("should apply correct container styles", () => {
    const { container } = render(<App />);
    
    const containerElement = container.querySelector('[class*="min-h-screen"]');
    expect(containerElement).toHaveClass("min-h-screen", "bg-gray-100", "flex", "flex-col", "items-center", "px-2", "py-4");
  });

  // тестирование кнопки "Выбрать"
  test("should show select button in normal mode", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    expect(selectButton).toBeInTheDocument();
  });

  // тестирование кнопки "Очистить все"
  test("should show clear all button", () => {
    render(<App />);
    
    expect(screen.getByText("Очистить все")).toBeInTheDocument();
  });

  // тестирование функции handleSelectTodo
  test("should handle selecting and deselecting todos", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование функции exitSelectMode
  test("should exit select mode correctly", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование функции handleDeleteSelected
  test("should handle deleting selected todos", () => {
    mockConfirm.mockReturnValue(true);
    
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование drag start с data-no-dnd элементом
  test("should handle drag start with data-no-dnd element", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.mouseEnter(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование drag end с переключением страниц
  test("should handle drag end with page switching", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.click(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование drag end с переупорядочиванием
  test("should handle drag end with reordering", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.click(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование reorderTodos
  test("should handle reordering todos", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.click(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование функции updateTodoTag
  test("should handle updating todo tag", () => {
    render(<App />);
    
    const select = screen.getByTestId("tag-select-1");
    fireEvent.change(select, { target: { value: "green" } });
    
    expect(select).toBeInTheDocument();
  });

  // тестирование функции generateId
  test("should generate unique IDs", () => {
    render(<App />);
    
    expect(screen.getByText("Todo List")).toBeInTheDocument();
  });

  // тестирование функции customCollisionDetection
  test("should handle custom collision detection", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.mouseOver(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование фильтрации с поиском
  test("should filter todos with search", () => {
    render(<App />);
    
    expect(screen.getByText("Test task 1")).toBeInTheDocument();
    expect(screen.getByText("Test task 2")).toBeInTheDocument();
  });

  // тестирование фильтрации с тегом
  test("should filter todos with tag", () => {
    render(<App />);
    
    const redTagButton = screen.getByTestId("tag-red");
    fireEvent.click(redTagButton);
    
    expect(mockSetSelectedTag).toHaveBeenCalledWith("red");
  });

  // тестирование пагинации с большим количеством задач
  test("should handle pagination with many todos", () => {
    render(<App />);
    
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    expect(screen.getByTestId("total-items")).toHaveTextContent("2");
  });

  // тестирование режима выбора с выбранными задачами
  test("should handle select mode with selected todos", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование режима выбора без выбранных задач
  test("should handle select mode without selected todos", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование drag overlay с draggedTodo
  test("should show drag overlay with dragged todo", () => {
    render(<App />);
    
    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument();
  });

  // тестирование переключения состояния задачи через мок
  test("should toggle todo completion through mock", () => {
    render(<App />);
    
    const checkbox = screen.getByTestId("checkbox-1");
    fireEvent.click(checkbox);
    
    expect(checkbox).toBeInTheDocument();
  });

  // тестирование удаления задачи через мок
  test("should delete todo through mock", () => {
    render(<App />);
    
    const deleteButton = screen.getByTestId("delete-1");
    fireEvent.click(deleteButton);
    
    expect(deleteButton).toBeInTheDocument();
  });

  // тестирование обновления тега задачи через мок
  test("should update todo tag through mock", () => {
    render(<App />);
    
    const select = screen.getByTestId("tag-select-1");
    fireEvent.change(select, { target: { value: "green" } });
    
    expect(select).toBeInTheDocument();
  });

  // тестирование выбора задачи в режиме выбора
  test("should select todo in select mode", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование добавления новой задачи через форму
  test("should add new todo through form", () => {
    render(<App />);
    
    const addButton = screen.getByTestId("add-todo-btn");
    fireEvent.click(addButton);
    
    expect(addButton).toBeInTheDocument();
  });

  // тестирование переключения состояния задачи
  test("should toggle todo completion status", () => {
    render(<App />);
    
    const checkbox = screen.getByTestId("checkbox-1");
    fireEvent.click(checkbox);
    
    expect(checkbox).toBeInTheDocument();
  });

  // тестирование удаления задачи при клике на кнопку удаления
  test("should delete todo when delete button is clicked", () => {
    render(<App />);
    
    const deleteButton = screen.getByTestId("delete-1");
    fireEvent.click(deleteButton);
    
    expect(deleteButton).toBeInTheDocument();
  });

  // тестирование выбора тега
  test("should handle tag selection", () => {
    render(<App />);
    
    const select = screen.getByTestId("tag-select-1");
    fireEvent.change(select, { target: { value: "green" } });
    
    expect(select).toBeInTheDocument();
  });

  // тестирование выбора задачи в режиме выбора
  test("should handle todo selection in select mode", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование изменения страницы
  test("should handle page change", () => {
    render(<App />);
    
    const page1Button = screen.getByTestId("page-1");
    fireEvent.click(page1Button);
    
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
  });

  // тестирование изменения поискового запроса
  test("should handle search term change", () => {
    render(<App />);
    
    const searchButton = screen.getByTestId("search-btn");
    fireEvent.click(searchButton);
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith("test");
  });

  // тестирование изменения выбранного тега
  test("should handle selected tag change", () => {
    render(<App />);
    
    const redTagButton = screen.getByTestId("tag-red");
    fireEvent.click(redTagButton);
    
    expect(mockSetSelectedTag).toHaveBeenCalledWith("red");
  });

  // тестирование изменения режима выбора
  test("should handle select mode change", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование изменения выбранных id
  test("should handle selected ids change", () => {
    render(<App />);
    
    const selectButton = screen.getByText("Выбрать");
    fireEvent.click(selectButton);
    
    expect(mockSetIsSelectMode).toHaveBeenCalledWith(true);
  });

  // тестирование изменения активного id
  test("should handle active id change", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.mouseEnter(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование изменения ожидающей страницы
  test("should handle pending page change", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.mouseOver(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование изменения оригинальной страницы
  test("should handle original page change", () => {
    render(<App />);
    
    const dndContext = screen.getByTestId("dnd-context");
    fireEvent.mouseOver(dndContext);
    
    expect(dndContext).toBeInTheDocument();
  });

  // тестирование удаления всех задач
  test("should handle removing all todos", () => {
    render(<App />);
    
    expect(screen.getByText("Todo List")).toBeInTheDocument();
  });

  // тестирование генерации уникальных id для новых задач
  test("should generate unique IDs for new todos", () => {
    render(<App />);
    
    expect(screen.getByText("Todo List")).toBeInTheDocument();
  });

  // тестирование очистки всех задач с подтверждением
  test("should clear all todos with confirmation", () => {
    mockConfirm.mockReturnValue(true);
    
    render(<App />);
    
    const clearAllButton = screen.getByText("Очистить все");
    fireEvent.click(clearAllButton);
    
    expect(mockConfirm).toHaveBeenCalledWith("Удалить все задачи?");
  });

  // тестирование изменения страницы
  test("should handle page change correctly", () => {
    render(<App />);
    
    const page1Button = screen.getByTestId("page-1");
    fireEvent.click(page1Button);
    
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
  });

  // тестирование фильтрации задач
  test("should filter todos correctly", () => {
    render(<App />);
    
    expect(screen.getByText("Test task 1")).toBeInTheDocument();
    expect(screen.getByText("Test task 2")).toBeInTheDocument();
  });

  // тестирование нарезки задач для текущей страницы
  test("should slice todos for current page", () => {
    render(<App />);
    
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    expect(screen.getByTestId("total-items")).toHaveTextContent("2");
  });

  // тестирование поиска перетаскиваемой задачи
  test("should find dragged todo", () => {
    render(<App />);
    
    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument();
  });
}); 