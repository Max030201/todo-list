import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "../SearchBar";

describe("SearchBar", () => {
  let mockOnSearch;

  beforeEach(() => {
    mockOnSearch = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // рендер компонента
  test("should render search input", () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText("Поиск задач...");
    expect(input).toBeInTheDocument();
  });

  // ввод текста в поиск
  test("should update input value when typing", () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText("Поиск задач...");
    fireEvent.change(input, { target: { value: "test task" } });
    expect(input.value).toBe("test task");
  });

  // вызов onSearch с задержкой
  test("should call onSearch with debounce after typing", async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText("Поиск задач...");
    
    fireEvent.change(input, { target: { value: "test" } });
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(300);
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith("test");
    });
  });

  // очистка пробелов в начале и конце
  test("should trim whitespace from search term", async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText("Поиск задач...");
    
    fireEvent.change(input, { target: { value: "  test task  " } });
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith("test task");
    });
  });

  // отмена предыдущего таймера при новом вводе
  test("should cancel previous timer on new input", async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText("Поиск задач...");
    
    fireEvent.change(input, { target: { value: "first" } });
    jest.advanceTimersByTime(150);
    
    fireEvent.change(input, { target: { value: "second" } });
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("second");
    });
  });

  // пустой поиск
  test("should call onSearch with empty string for empty input", async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText("Поиск задач...");
    
    fireEvent.change(input, { target: { value: "" } });
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith("");
    });
  });
}); 