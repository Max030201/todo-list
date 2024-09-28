import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../Pagination";

describe("Pagination", () => {
  let mockOnPageChange;

  beforeEach(() => {
    mockOnPageChange = jest.fn();
  });

  // рендер пагинации с несколькими страницами
  test("should render pagination with multiple pages", () => {
    render(
      <Pagination
        totalItems={15}
        itemsPerPage={5}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // скрытие пагинации при одной странице
  test("should not render pagination when only one page", () => {
    const { container } = render(
      <Pagination
        totalItems={3}
        itemsPerPage={5}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  // выделение текущей страницы
  test("should highlight current page", () => {
    render(
      <Pagination
        totalItems={15}
        itemsPerPage={5}
        currentPage={2}
        onPageChange={mockOnPageChange}
      />
    );
    
    const currentPageButton = screen.getByText("2");
    expect(currentPageButton).toHaveClass("bg-blue-500", "text-white");
  });

  // стили неактивных страниц
  test("should apply correct styles to inactive pages", () => {
    render(
      <Pagination
        totalItems={15}
        itemsPerPage={5}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    const inactivePageButton = screen.getByText("2");
    expect(inactivePageButton).toHaveClass("bg-gray-200", "text-gray-700");
  });

  // вызов onPageChange при клике на страницу
  test("should call onPageChange when clicking page button", () => {
    render(
      <Pagination
        totalItems={15}
        itemsPerPage={5}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    const pageButton = screen.getByText("3");
    fireEvent.click(pageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  // множественные клики
  test("should handle multiple page clicks correctly", () => {
    render(
      <Pagination
        totalItems={15}
        itemsPerPage={5}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    const page2Button = screen.getByText("2");
    const page3Button = screen.getByText("3");
    
    fireEvent.click(page2Button);
    fireEvent.click(page3Button);
    
    expect(mockOnPageChange).toHaveBeenCalledTimes(2);
    expect(mockOnPageChange).toHaveBeenNthCalledWith(1, 2);
    expect(mockOnPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  // правильное количество страниц
  test("should calculate correct number of pages", () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("4")).not.toBeInTheDocument();
  });

  // клик на текущую страницу
  test("should call onPageChange when clicking current page", () => {
    render(
      <Pagination
        totalItems={15}
        itemsPerPage={5}
        currentPage={2}
        onPageChange={mockOnPageChange}
      />
    );
    
    const currentPageButton = screen.getByText("2");
    fireEvent.click(currentPageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  // граничные случаи
  test("should handle edge cases correctly", () => {
    const { container } = render(
      <Pagination
        totalItems={1}
        itemsPerPage={1}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  // большие числа
  test("should handle large numbers correctly", () => {
    render(
      <Pagination
        totalItems={1000}
        itemsPerPage={10}
        currentPage={50}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText("50")).toHaveClass("bg-blue-500", "text-white");
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  // очень много страниц
  test("should handle many pages correctly", () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={1000}
        itemsPerPage={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  // ноль элементов
  test("should handle zero items", () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={0}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  // меньше элементов чем itemsPerPage
  test("should handle fewer items than itemsPerPage", () => {
    render(
      <Pagination
        totalItems={3}
        itemsPerPage={5}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.queryByTestId("page-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("page-2")).not.toBeInTheDocument();
  });

  // точное количество элементов для одной страницы
  test("should handle exact items for one page", () => {
    render(
      <Pagination
        totalItems={5}
        itemsPerPage={5}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.queryByTestId("page-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("page-2")).not.toBeInTheDocument();
  });

  // очень большое itemsPerPage
  test("should handle very large itemsPerPage", () => {
    render(
      <Pagination
        totalItems={10}
        itemsPerPage={100}
        currentPage={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.queryByTestId("page-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("page-2")).not.toBeInTheDocument();
  });
}); 