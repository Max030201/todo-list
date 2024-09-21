import { renderHook, act } from "@testing-library/react";
import useLocalStorage from "../useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // начальное значение
  test("should return initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test", "default"));

    expect(result.current[0]).toBe("default");
  });

  // значение из localStorage
  test("should return value from localStorage when it exists", () => {
    localStorage.setItem("test", JSON.stringify("stored value"));

    const { result } = renderHook(() => useLocalStorage("test", "default"));

    expect(result.current[0]).toBe("stored value");
  });

  // обновление localStorage
  test("should update localStorage when value changes", () => {
    const { result } = renderHook(() => useLocalStorage("test", "default"));

    act(() => {
      result.current[1]("new value");
    });

    expect(result.current[0]).toBe("new value");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "test",
      JSON.stringify("new value"),
    );
  });

  // обновление функцией
  test("should handle function updates", () => {
    const { result } = renderHook(() => useLocalStorage("test", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "test",
      JSON.stringify(1),
    );
  });

  // удаление значения
  test("should remove value from localStorage", () => {
    localStorage.setItem("test", JSON.stringify("value"));

    const { result } = renderHook(() => useLocalStorage("test", "default"));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("default");
    expect(localStorage.removeItem).toHaveBeenCalledWith("test");
  });

  // ошибка чтения localStorage
  test("should handle localStorage errors gracefully", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    localStorage.getItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });

    const { result } = renderHook(() => useLocalStorage("test", "default"));

    expect(result.current[0]).toBe("default");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  // ошибка записи localStorage
  test("should handle setValue errors gracefully", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    localStorage.setItem.mockImplementation(() => {
      throw new Error("setItem error");
    });
    
    const { result } = renderHook(() => useLocalStorage("test", "default"));

    act(() => {
      result.current[1]("new value");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "test":',
      expect.any(Error),
    );
    expect(result.current[0]).toBe("new value");

    consoleSpy.mockRestore();
  });

  // ошибка удаления localStorage
  test("should handle removeValue errors gracefully", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    localStorage.removeItem.mockImplementation(() => {
      throw new Error("removeItem error");
    });

    const { result } = renderHook(() => useLocalStorage("test", "default"));

    act(() => {
      result.current[2]();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error removing localStorage key "test":',
      expect.any(Error),
    );
    expect(result.current[0]).toBe("default");
    
    consoleSpy.mockRestore();
  });
}); 
