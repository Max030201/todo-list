import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TodoForm from "../TodoForm";

describe("TodoForm", () => {
  let mockAddTodo;

  beforeEach(() => {
    mockAddTodo = jest.fn();
  });

  // рендер формы
  test("should render form with input and button", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    expect(screen.getByPlaceholderText("Добавить новую задачу...")).toBeInTheDocument();
    expect(screen.getByText("Добавить")).toBeInTheDocument();
  });

  // ввод текста в поле
  test("should update input value when typing", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    fireEvent.change(input, { target: { value: "New task" } });
    
    expect(input.value).toBe("New task");
  });

  // отправка формы с валидным текстом
  test("should call addTodo and clear input when submitting valid text", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const button = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.click(button);
    
    expect(mockAddTodo).toHaveBeenCalledWith("New task");
    expect(input.value).toBe("");
  });

  // отправка формы с пустым текстом
  test("should not call addTodo when submitting empty text", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const button = screen.getByText("Добавить");
    fireEvent.click(button);
    
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  // отправка формы только с пробелами
  test("should not call addTodo when submitting whitespace only", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const button = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(button);
    
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  // отправка формы через Enter
  test("should submit form when pressing Enter", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.submit(form);
    
    expect(mockAddTodo).toHaveBeenCalledWith("New task");
    expect(input.value).toBe("");
  });

  // предотвращение отправки пустой формы через Enter
  test("should not submit empty form when pressing Enter", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const form = input.closest('form');
    
    fireEvent.submit(form);
    
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  // множественные отправки
  test("should handle multiple submissions correctly", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const button = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "First task" } });
    fireEvent.click(button);
    
    fireEvent.change(input, { target: { value: "Second task" } });
    fireEvent.click(button);
    
    expect(mockAddTodo).toHaveBeenCalledTimes(2);
    expect(mockAddTodo).toHaveBeenNthCalledWith(1, "First task");
    expect(mockAddTodo).toHaveBeenNthCalledWith(2, "Second task");
  });

  // стили кнопки
  test("should apply correct button styles", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const button = screen.getByText("Добавить");
    expect(button).toHaveClass("bg-blue-500", "hover:bg-blue-700", "text-white");
  });

  // стили поля ввода
  test("should apply correct input styles", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    expect(input).toHaveClass("border", "border-gray-300", "rounded");
  });

  // очистка формы после добавления
  test("should clear form after adding todo", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);
    
    expect(input.value).toBe("");
  });

  // очень длинный текст
  test("should handle very long text input", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    const longText = "Это очень длинный текст задачи, который может содержать много символов и должен корректно обрабатываться формой. Текст может быть настолько длинным, что потребуется проверка на максимальную длину и правильное валидирование для обеспечения стабильности приложения.";
    
    fireEvent.change(input, { target: { value: longText } });
    fireEvent.click(addButton);
    
    expect(mockAddTodo).toHaveBeenCalledWith(longText);
  });

  // специальные символы
  test("should handle special characters in input", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    const specialText = "Задача с символами: !@#$%^&*()_+-=[]{}|;':\",./<>?`~ и эмодзи 😀🎉🚀";
    
    fireEvent.change(input, { target: { value: specialText } });
    fireEvent.click(addButton);
    
    expect(mockAddTodo).toHaveBeenCalledWith(specialText);
  });

  // HTML в тексте
  test("should handle HTML-like text safely", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    const htmlText = "<script>alert('test')</script><div>Hello</div>";
    
    fireEvent.change(input, { target: { value: htmlText } });
    fireEvent.click(addButton);
    
    expect(mockAddTodo).toHaveBeenCalledWith(htmlText);
  });

  // множественные пробелы
  test("should handle multiple spaces correctly", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "   Task with spaces   " } });
    fireEvent.click(addButton);
    
    expect(mockAddTodo).toHaveBeenCalledWith("   Task with spaces   ");
  });

  // только пробелы
  test("should not add todo with only spaces", () => {
    render(<TodoForm addTodo={mockAddTodo} />);
    
    const input = screen.getByPlaceholderText("Добавить новую задачу...");
    const addButton = screen.getByText("Добавить");
    
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(addButton);
    
    expect(mockAddTodo).not.toHaveBeenCalled();
  });
}); 