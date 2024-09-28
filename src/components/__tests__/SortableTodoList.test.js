import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SortableTodoList from "../SortableTodoList";

// мок для dnd-kit компонентов
jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children, items }) => (
    <div data-testid="sortable-context" data-items={JSON.stringify(items)}>
      {children}
    </div>
  ),
  useSortable: ({ id }) => ({
    attributes: { "data-testid": `sortable-${id}` },
    listeners: { onKeyDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0 },
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: jest.fn(),
}));

// мок для dnd-kit utilities
jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => "translate3d(0, 0, 0)"),
    },
  },
}));

describe("SortableTodoList", () => {
  let mockToggleComplete;
  let mockDeleteTodo;
  let mockOnTagSelect;
  let mockOnSelectTodo;
  let mockTodos;

  beforeEach(() => {
    mockToggleComplete = jest.fn();
    mockDeleteTodo = jest.fn();
    mockOnTagSelect = jest.fn();
    mockOnSelectTodo = jest.fn();
    mockTodos = [
      { id: 1, text: "Task 1", completed: false, tag: "red" },
      { id: 2, text: "Task 2", completed: true, tag: "green" },
      { id: 3, text: "Task 3", completed: false, tag: null },
    ];
  });

  // рендер компонента
  test("should render SortableTodoList with todos", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByTestId("sortable-context")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // передача правильных items в SortableContext
  test("should pass correct items to SortableContext", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const sortableContext = screen.getByTestId("sortable-context");
    const items = JSON.parse(sortableContext.getAttribute("data-items"));
    expect(items).toEqual([1, 2, 3]);
  });

  // передача isSelectMode в TodoItem
  test("should pass isSelectMode prop to TodoItem components", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // передача selectedIds в TodoItem
  test("should pass selectedIds prop to TodoItem components", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1, 3]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // вызов toggleComplete через TodoItem
  test("should call toggleComplete when TodoItem checkbox is clicked", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkboxes = screen.getAllByRole("checkbox");
    const completedCheckbox = checkboxes.find(checkbox => checkbox.checked);
    fireEvent.click(completedCheckbox);
    
    expect(mockToggleComplete).toHaveBeenCalledWith(2);
  });

  // вызов deleteTodo через TodoItem
  test("should call deleteTodo when TodoItem delete button is clicked", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const deleteButtons = screen.getAllByText("Удалить");
    fireEvent.click(deleteButtons[0]);
    
    expect(mockDeleteTodo).toHaveBeenCalledWith(1);
  });

  // вызов onTagSelect через TodoItem
  test("should call onTagSelect when TodoItem tag is changed", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "green" } });
    
    expect(mockOnTagSelect).toHaveBeenCalledWith(1, "green");
  });

  // вызов onSelectTodo через TodoItem
  test("should call onSelectTodo when TodoItem is selected", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItems = screen.getAllByTestId(/todo-/);
    fireEvent.click(todoItems[0]);
    
    expect(mockOnSelectTodo).toHaveBeenCalledWith(1);
  });

  // обработка пустого списка
  test("should handle empty todos list", () => {
    render(
      <SortableTodoList
        todos={[]}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Нет задач")).toBeInTheDocument();
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });

  // множественные действия
  test("should handle multiple actions correctly", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkboxes = screen.getAllByRole("checkbox");
    const deleteButtons = screen.getAllByText("Удалить");
    
    fireEvent.click(checkboxes[0]);
    fireEvent.click(deleteButtons[1]);
    
    expect(mockToggleComplete).toHaveBeenCalledWith(1);
    expect(mockDeleteTodo).toHaveBeenCalledWith(2);
  });

  // отображение текста задач
  test("should display todo text correctly", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // состояние чекбоксов
  test("should display correct checkbox states", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  // обработка больших списков
  test("should handle large todo lists", () => {
    const largeTodoList = Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      text: `Task ${index + 1}`,
      completed: index % 2 === 0,
      tag: index % 3 === 0 ? "red" : index % 3 === 1 ? "green" : "yellow",
    }));
    
    render(
      <SortableTodoList
        todos={largeTodoList}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 50")).toBeInTheDocument();
    
    const sortableContext = screen.getByTestId("sortable-context");
    const items = JSON.parse(sortableContext.getAttribute("data-items"));
    expect(items).toHaveLength(50);
  });

  // режим выбора - множественный выбор
  test("should handle multiple selection in select mode", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1, 3]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // режим выбора - отмена выбора
  test("should handle deselection in select mode", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItem = screen.getByText("Task 1").closest("div[class*='cursor-pointer']");
    fireEvent.click(todoItem);
    
    expect(mockOnSelectTodo).toHaveBeenCalledWith(1);
  });

  // изменение тегов в режиме выбора
  test("should handle tag changes in select mode", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "yellow" } });
    
    expect(mockOnTagSelect).toHaveBeenCalledWith(1, "yellow");
  });

  // отображение тегов
  test("should display tags correctly", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const redElements = screen.getAllByText("red");
    const greenElements = screen.getAllByText("green");
    
    const redTagSpan = redElements.find(element => element.tagName === "SPAN");
    const greenTagSpan = greenElements.find(element => element.tagName === "SPAN");
    
    expect(redTagSpan).toBeInTheDocument();
    expect(greenTagSpan).toBeInTheDocument();
    
    const yellowElements = screen.getAllByText("yellow");
    const yellowTagSpan = yellowElements.find(element => element.tagName === "SPAN");
    expect(yellowTagSpan).toBeUndefined();
  });

  // отображение задач без тегов
  test("should handle todos without tags", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // режим выбора без SortableContext
  test("should not render SortableContext in select mode", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.queryByTestId("sortable-context")).not.toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // проверка структуры в обычном режиме
  test("should render correct structure in normal mode", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={false}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByTestId("sortable-context")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // проверка структуры в режиме выбора
  test("should render correct structure in select mode", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1, 3]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.queryByTestId("sortable-context")).not.toBeInTheDocument();
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
    
    const selectModeContainer = document.querySelector("div.bg-white.rounded-lg.shadow.divide-y.divide-gray-200.mt-4.w-full");
    expect(selectModeContainer).toBeInTheDocument();
  });

  // передача правильных пропсов в режиме выбора
  test("should pass correct props in select mode", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1, 3]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
    
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  // пустой массив в режиме выбора
  test("should handle empty todos in select mode", () => {
    render(
      <SortableTodoList
        todos={[]}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Нет задач")).toBeInTheDocument();
    expect(screen.queryByTestId("sortable-context")).not.toBeInTheDocument();
  });

  // рендер структуры режима выбора
  test("should render select mode JSX structure when isSelectMode is true", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1, 3]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const selectModeContainer = screen.getByText("Task 1").closest("div[class*='mt-4']");
    expect(selectModeContainer).toHaveClass("bg-white", "rounded-lg", "shadow", "divide-y", "divide-gray-200", "mt-4", "w-full");
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  // отсутствие SortableContext в режиме выбора
  test("should not render SortableContext when isSelectMode is true", () => {
    render(
      <SortableTodoList
        todos={mockTodos}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isSelectMode={true}
        selectedIds={[1, 3]}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.queryByTestId("sortable-context")).not.toBeInTheDocument();
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });
}); 