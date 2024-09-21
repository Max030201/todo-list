import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TodoItem from "../TodoItem";

// мок для dnd-kit компонентов
jest.mock("@dnd-kit/sortable", () => ({
  useSortable: ({ id }) => ({
    attributes: { "data-testid": `sortable-${id}` },
    listeners: { onKeyDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0 },
    transition: null,
    isDragging: false,
  }),
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => "translate3d(0, 0, 0)"),
    },
  },
}));

describe("TodoItem", () => {
  let mockToggleComplete;
  let mockDeleteTodo;
  let mockOnTagSelect;
  let mockOnSelectTodo;
  let mockTodo;

  beforeEach(() => {
    mockToggleComplete = jest.fn();
    mockDeleteTodo = jest.fn();
    mockOnTagSelect = jest.fn();
    mockOnSelectTodo = jest.fn();
    mockTodo = {
      id: 1,
      text: "Test task",
      completed: false,
      tag: "red",
    };
  });

  // рендер задачи
  test("should render todo item with text", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText("Test task")).toBeInTheDocument();
  });

  // отображение невыполненной задачи
  test("should display incomplete todo correctly", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("Test task")).not.toHaveClass("line-through");
  });

  // отображение выполненной задачи
  test("should display completed todo correctly", () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(
      <TodoItem
        todo={completedTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    expect(screen.getByText("Test task")).toHaveClass("line-through", "text-gray-500");
  });

  // вызов toggleComplete при клике на чекбокс
  test("should call toggleComplete when clicking checkbox", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    
    expect(mockToggleComplete).toHaveBeenCalledWith(1);
  });

  // вызов deleteTodo при клике на кнопку удаления
  test("should call deleteTodo when clicking delete button", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const deleteButton = screen.getByText("Удалить");
    fireEvent.click(deleteButton);
    
    expect(mockDeleteTodo).toHaveBeenCalledWith(1);
  });

  // отображение тега
  test("should display tag with correct color", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const redElements = screen.getAllByText("red");
    const tagSpan = redElements.find(element => element.tagName === "SPAN");
    expect(tagSpan).toHaveClass("bg-red-500");
  });

  // отображение задачи без тега
  test("should handle todo without tag", () => {
    const todoWithoutTag = { ...mockTodo, tag: null };
    render(
      <TodoItem
        todo={todoWithoutTag}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const tagSpans = screen.queryAllByText("red");
    const tagSpan = tagSpans.find(span => span.tagName === "SPAN");
    expect(tagSpan).toBeUndefined();
  });

  // стили при перетаскивании
  test("should apply dragging styles when isDragging is true", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItem = screen.getByText("Test task").closest("div[class*='cursor-move']");
    expect(todoItem).toHaveClass("cursor-move");
  });

  // правильные цвета тегов
  test("should apply correct tag colors", () => {
    const greenTodo = { ...mockTodo, tag: "green" };
    const yellowTodo = { ...mockTodo, tag: "yellow" };
    
    const { rerender } = render(
      <TodoItem
        todo={greenTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const greenElements = screen.getAllByText("green");
    const greenTagSpan = greenElements.find(element => element.tagName === "SPAN");
    expect(greenTagSpan).toHaveClass("bg-green-500");
    
    rerender(
      <TodoItem
        todo={yellowTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const yellowElements = screen.getAllByText("yellow");
    const yellowTagSpan = yellowElements.find(element => element.tagName === "SPAN");
    expect(yellowTagSpan).toHaveClass("bg-yellow-400");
  });

  // множественные действия
  test("should handle multiple actions correctly", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkbox = screen.getByRole("checkbox");
    const deleteButton = screen.getByText("Удалить");
    const select = screen.getByRole("combobox");
    
    fireEvent.click(checkbox);
    fireEvent.click(deleteButton);
    fireEvent.change(select, { target: { value: "green" } });
    
    expect(mockToggleComplete).toHaveBeenCalledWith(1);
    expect(mockDeleteTodo).toHaveBeenCalledWith(1);
    expect(mockOnTagSelect).toHaveBeenCalledWith(1, "green");
  });

  // правильные стили кнопки удаления
  test("should apply correct delete button styles", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const deleteButton = screen.getByText("Удалить");
    expect(deleteButton).toHaveClass("text-red-500", "hover:text-red-700");
  });

  // показ чекбокса выбора в режиме выбора
  test("should show selection checkbox in select mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={true}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const selectCheckbox = screen.getByTestId("select-1");
    expect(selectCheckbox).toBeInTheDocument();
    expect(selectCheckbox).not.toBeChecked();
  });

  // показ выбранного состояния в режиме выбора
  test("should show selected state in select mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={true}
        selected={true}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const selectCheckbox = screen.getByTestId("select-1");
    expect(selectCheckbox).toBeChecked();
  });

  // вызов onSelectTodo при клике в режиме выбора
  test("should call onSelectTodo when clicking in select mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={true}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItem = screen.getByTestId("todo-1");
    fireEvent.click(todoItem);
    
    expect(mockOnSelectTodo).toHaveBeenCalledWith(1);
  });

  // правильные стили курсора в режиме выбора
  test("should apply correct cursor styles in select mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={true}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItem = screen.getByTestId("todo-1");
    expect(todoItem).toHaveClass("cursor-pointer");
  });

  // рендер в режиме оверлея
  test("should render correctly in overlay mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={true}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItem = screen.getByTestId("todo-1");
    expect(todoItem).toHaveClass("pointer-events-none");
  });

  // отключение событий в режиме оверлея
  test("should disable events in overlay mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={true}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItem = screen.getByTestId("todo-1");
    expect(todoItem).toHaveClass("pointer-events-none");
  });

  // вызов onTagSelect при изменении тега
  test("should call onTagSelect when changing tag", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "green" } });
    
    expect(mockOnTagSelect).toHaveBeenCalledWith(1, "green");
  });

  // отключение элементов в режиме выбора
  test("should disable elements in select mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={true}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const select = screen.getByRole("combobox");
    const deleteButton = screen.getByText("Удалить");
    
    expect(select).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  // прозрачность в режиме выбора
  test("should apply transparency in select mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={true}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const select = screen.getByRole("combobox");
    const deleteButton = screen.getByText("Удалить");
    
    expect(select).toHaveClass("opacity-50");
    expect(deleteButton).toHaveClass("opacity-50");
  });

  // прозрачность в режиме оверлея
  test("should apply transparency in overlay mode", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={true}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const select = screen.getByRole("combobox");
    const deleteButton = screen.getByText("Удалить");
    
    expect(select).toHaveClass("opacity-50");
    expect(deleteButton).toHaveClass("opacity-50");
  });

  // обработка кликов на элементы управления
  test("should handle clicks on control elements", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const checkbox = screen.getByRole("checkbox");
    const deleteButton = screen.getByText("Удалить");
    const select = screen.getByRole("combobox");
    
    fireEvent.click(checkbox);
    fireEvent.click(deleteButton);
    fireEvent.change(select, { target: { value: "yellow" } });
    
    expect(mockToggleComplete).toHaveBeenCalledWith(1);
    expect(mockDeleteTodo).toHaveBeenCalledWith(1);
    expect(mockOnTagSelect).toHaveBeenCalledWith(1, "yellow");
  });

  // обработка клика на текст задачи
  test("should handle click on todo text", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoText = screen.getByText("Test task");
    fireEvent.click(todoText);
    
    expect(todoText).toBeInTheDocument();
  });

  // обработка событий мыши
  test("should handle mouse events correctly", () => {
    render(
      <TodoItem
        todo={mockTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const todoItem = screen.getByTestId("todo-1");
    const checkbox = screen.getByRole("checkbox");
    
    fireEvent.mouseDown(todoItem);
    fireEvent.mouseUp(todoItem);
    fireEvent.click(checkbox);
    
    expect(todoItem).toBeInTheDocument();
    expect(mockToggleComplete).toHaveBeenCalledWith(1);
  });

  // очень длинный текст
  test("should handle very long text correctly", () => {
    const longTextTodo = {
      ...mockTodo,
      text: "Это очень длинный текст задачи, который может содержать много символов и должен корректно отображаться в интерфейсе без нарушения макета. Текст может быть настолько длинным, что потребуется перенос строки и правильное форматирование для обеспечения читаемости и удобства использования."
    };
    
    render(
      <TodoItem
        todo={longTextTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText(longTextTodo.text)).toBeInTheDocument();
    expect(screen.getByText(longTextTodo.text)).toHaveClass("break-words");
  });

  // специальные символы в тексте
  test("should handle special characters in text", () => {
    const specialCharsTodo = {
      ...mockTodo,
      text: "Задача с символами: !@#$%^&*()_+-=[]{}|;':\",./<>?`~ и эмодзи 😀🎉🚀"
    };
    
    render(
      <TodoItem
        todo={specialCharsTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText(specialCharsTodo.text)).toBeInTheDocument();
  });

  // пустой текст
  test("should handle empty text", () => {
    const emptyTextTodo = {
      ...mockTodo,
      text: ""
    };
    
    render(
      <TodoItem
        todo={emptyTextTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    const textSpan = screen.getByTestId("todo-1").querySelector("span");
    expect(textSpan).toBeInTheDocument();
  });

  // HTML в тексте
  test("should handle HTML-like text safely", () => {
    const htmlTextTodo = {
      ...mockTodo,
      text: "<script>alert('test')</script><div>Hello</div>"
    };
    
    render(
      <TodoItem
        todo={htmlTextTodo}
        toggleComplete={mockToggleComplete}
        deleteTodo={mockDeleteTodo}
        onTagSelect={mockOnTagSelect}
        isOverlay={false}
        isSelectMode={false}
        selected={false}
        onSelectTodo={mockOnSelectTodo}
      />
    );
    
    expect(screen.getByText(htmlTextTodo.text)).toBeInTheDocument();
  });

}); 