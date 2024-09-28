import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TagSelector from "../TagSelector";

describe("TagSelector", () => {
  let mockOnTagSelect;

  beforeEach(() => {
    mockOnTagSelect = jest.fn();
  });

  // рендер всех кнопок тегов
  test("should render all tag buttons", () => {
    render(<TagSelector selectedTag={null} onTagSelect={mockOnTagSelect} />);
    
    expect(screen.getByText("Все")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
    expect(screen.getByText("green")).toBeInTheDocument();
    expect(screen.getByText("yellow")).toBeInTheDocument();
  });

  // выделение кнопки "Все" при selectedTag = null
  test("should highlight 'Все' button when selectedTag is null", () => {
    render(<TagSelector selectedTag={null} onTagSelect={mockOnTagSelect} />);
    
    const allButton = screen.getByText("Все");
    expect(allButton).toHaveClass("ring-2", "ring-black");
  });

  // выделение конкретного тега
  test("should highlight selected tag button", () => {
    render(<TagSelector selectedTag="red" onTagSelect={mockOnTagSelect} />);
    
    const redButton = screen.getByText("red");
    expect(redButton).toHaveClass("ring-2", "ring-black");
    
    const allButton = screen.getByText("Все");
    expect(allButton).toHaveClass("bg-gray-200");
  });

  // вызов onTagSelect при клике на "Все"
  test("should call onTagSelect with null when clicking 'Все'", () => {
    render(<TagSelector selectedTag="red" onTagSelect={mockOnTagSelect} />);
    
    const allButton = screen.getByText("Все");
    fireEvent.click(allButton);
    
    expect(mockOnTagSelect).toHaveBeenCalledWith(null);
  });

  // вызов onTagSelect при клике на тег
  test("should call onTagSelect with tag color when clicking tag button", () => {
    render(<TagSelector selectedTag={null} onTagSelect={mockOnTagSelect} />);
    
    const greenButton = screen.getByText("green");
    fireEvent.click(greenButton);
    
    expect(mockOnTagSelect).toHaveBeenCalledWith("green");
  });

  // правильные цвета для тегов
  test("should apply correct background colors to tag buttons", () => {
    render(<TagSelector selectedTag={null} onTagSelect={mockOnTagSelect} />);
    
    const redButton = screen.getByText("red");
    const greenButton = screen.getByText("green");
    const yellowButton = screen.getByText("yellow");
    
    expect(redButton).toHaveClass("bg-red-500");
    expect(greenButton).toHaveClass("bg-green-500");
    expect(yellowButton).toHaveClass("bg-yellow-400");
  });

  // стили невыбранных кнопок
  test("should apply correct styles to unselected buttons", () => {
    render(<TagSelector selectedTag="red" onTagSelect={mockOnTagSelect} />);
    
    const greenButton = screen.getByText("green");
    const yellowButton = screen.getByText("yellow");
    
    expect(greenButton).toHaveClass("bg-green-500");
    expect(yellowButton).toHaveClass("bg-yellow-400");
    expect(greenButton).not.toHaveClass("ring-2", "ring-black");
    expect(yellowButton).not.toHaveClass("ring-2", "ring-black");
  });

  // множественные клики
  test("should handle multiple clicks correctly", () => {
    render(<TagSelector selectedTag={null} onTagSelect={mockOnTagSelect} />);
    
    const redButton = screen.getByText("red");
    const greenButton = screen.getByText("green");
    
    fireEvent.click(redButton);
    fireEvent.click(greenButton);
    
    expect(mockOnTagSelect).toHaveBeenCalledTimes(2);
    expect(mockOnTagSelect).toHaveBeenNthCalledWith(1, "red");
    expect(mockOnTagSelect).toHaveBeenNthCalledWith(2, "green");
  });
}); 