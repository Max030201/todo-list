import React, { useState, useRef, useCallback, useEffect } from "react";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import TodoForm from "./TodoForm.jsx";
import SortableTodoList from "./SortableTodoList.jsx";
import SearchBar from "./SearchBar.jsx";
import TagSelector from "./TagSelector.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import Pagination from "./Pagination.jsx";
import TodoItem from "./TodoItem.jsx";

const App = () => {
  const [todos, setTodos, removeTodos] = useLocalStorage("todos", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeId, setActiveId] = useState(null);
  const [pendingPage, setPendingPage] = useState(null);
  const [originalPage, setOriginalPage] = useState(null);
  const pageChangeTimeout = useRef(null);
  const itemsPerPage = 5;
  const idCounter = useRef(0);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const mouseMoveHandlerRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag]);

  useEffect(() => {
    if (todos.length > 0) {
      const maxId = Math.max(...todos.map((todo) => todo.id));
      idCounter.current = maxId + 1;
    } else {
      idCounter.current = 1;
    }
  }, []);

  const generateId = () => {
    return ++idCounter.current;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const customCollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    const overPage = pointerCollisions.find(
      (entry) =>
        typeof entry.id === "string" && entry.id.startsWith("droppable-page-"),
    );

    if (overPage) {
      return [overPage];
    }

    return closestCenter(args);
  };

  const addTodo = useCallback(
    (text) => {
      const newTodo = {
        id: generateId(),
        text,
        completed: false,
        tag: null,
      };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    },
    [setTodos],
  );

  const toggleComplete = useCallback(
    (id) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );
    },
    [setTodos],
  );

  const deleteTodo = useCallback(
    (id) => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    },
    [setTodos],
  );

  const updateTodoTag = useCallback(
    (id, tag) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? { ...todo, tag } : todo)),
      );
    },
    [setTodos],
  );

  const reorderTodos = (activeId, overId) => {
    setTodos((items) => {
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleDragStart = (event) => {
    const target = event.active.data.current?.node;
    if (target && target.closest('[data-no-dnd="true"]')) {
      return;
    }
    setActiveId(event.active.id);
    setOriginalPage(currentPage);
    
    mouseMoveHandlerRef.current = (e) => {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const paginationButton = elements.find(el => 
        el.getAttribute('data-pagination-button') === 'true'
      );
      
      if (paginationButton) {
        const pageNumber = parseInt(paginationButton.getAttribute('data-page-number'));
        if (pageNumber) {
          if (pageChangeTimeout.current) {
            clearTimeout(pageChangeTimeout.current);
          }
          pageChangeTimeout.current = setTimeout(() => {
            setCurrentPage(pageNumber);
            setPendingPage(pageNumber);
          }, 300);
        }
      } else if (originalPage && currentPage !== originalPage) {
        if (pageChangeTimeout.current) {
          clearTimeout(pageChangeTimeout.current);
        }
        pageChangeTimeout.current = setTimeout(() => {
          setCurrentPage(originalPage);
          setPendingPage(null);
        }, 300);
      }
    };
    window.addEventListener("mousemove", mouseMoveHandlerRef.current);
  };

  const handleDragOver = () => {
    // Пустая функция, но нужна для dnd-kit
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (
      pendingPage &&
      pendingPage !== currentPage &&
      activeId
    ) {
      setTodos((items) => {
        const activeIndex = items.findIndex((item) => item.id === activeId);
        if (activeIndex === -1) return items;
        const newIndex = (pendingPage - 1) * itemsPerPage;
        const newItems = [...items];
        const [movedItem] = newItems.splice(activeIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        return newItems;
      });
      setCurrentPage(pendingPage);
    } else if (
      over &&
      (typeof over.id !== "string" || !over.id.startsWith("droppable-page-")) &&
      active.id !== over.id
    ) {
      reorderTodos(active.id, over.id);
    }
    setActiveId(null);
    setPendingPage(null);
    setOriginalPage(null);
    if (pageChangeTimeout.current) {
      clearTimeout(pageChangeTimeout.current);
      pageChangeTimeout.current = null;
    }
    if (mouseMoveHandlerRef.current) {
      window.removeEventListener("mousemove", mouseMoveHandlerRef.current);
      mouseMoveHandlerRef.current = null;
    }
  };

  const handleSelectTodo = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (window.confirm('Удалить выбранные задачи?')) {
      setTodos((prev) => prev.filter((todo) => !selectedIds.includes(todo.id)));
      exitSelectMode();
    }
  };

  const clearAllTodos = () => {
    if (window.confirm('Удалить все задачи?')) {
      removeTodos();
      exitSelectMode();
    }
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === null || todo.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const indexOfLastTodo = currentPage * itemsPerPage;
  const indexOfFirstTodo = indexOfLastTodo - itemsPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const draggedTodo = todos.find((todo) => todo.id === activeId);

  return (
    isSelectMode ? (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center px-2 py-4">
        <div className="w-full max-w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-7xl bg-white shadow-lg rounded-2xl p-2 sm:p-4 md:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Todo List</h1>
          </div>
          <div className="flex flex-col xxxs:flex-row justify-end gap-0 mb-4 h-auto">
            <div className="flex flex-row justify-end gap-2 w-full">
              {selectedIds.length ? (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    className="text-sm text-red-500 hover:text-red-700 focus:outline-none whitespace-nowrap"
                  >
                    Удалить выбранное
                  </button>
                  <button
                    onClick={exitSelectMode}
                    className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none whitespace-nowrap"
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <button
                  onClick={exitSelectMode}
                  className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none whitespace-nowrap"
                >
                  Отмена
                </button>
              )}
            </div>
            <button
              onClick={clearAllTodos}
              className="self-end mt-2 xxxs:mt-0 xxxs:self-auto text-sm text-red-500 hover:text-red-700 focus:outline-none whitespace-nowrap xxxs:ml-8"
            >
              Очистить все
            </button>
          </div>
          <TodoForm addTodo={addTodo} />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 my-4">
            <SearchBar onSearch={setSearchTerm} />
            <TagSelector selectedTag={selectedTag} onTagSelect={setSelectedTag} />
          </div>
          <SortableTodoList
            todos={currentTodos}
            toggleComplete={toggleComplete}
            deleteTodo={deleteTodo}
            onTagSelect={updateTodoTag}
            isSelectMode={isSelectMode}
            selectedIds={selectedIds}
            onSelectTodo={handleSelectTodo}
          />
          <Pagination
            totalItems={filteredTodos.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        data-testid="dnd-context"
      >
        <div className="min-h-screen bg-gray-100 flex flex-col items-center px-2 py-4">
          <div className="w-full max-w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-7xl bg-white shadow-lg rounded-2xl p-2 sm:p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Todo List</h1>
            </div>
            <div className="flex flex-col xxxs:flex-row justify-end gap-0 mb-4 h-auto">
              <div className="flex flex-row justify-end gap-2 w-full">
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none whitespace-nowrap"
                >
                  Выбрать
                </button>
              </div>
              <button
                onClick={clearAllTodos}
                className="self-end mt-2 xxxs:mt-0 xxxs:self-auto text-sm text-red-500 hover:text-red-700 focus:outline-none whitespace-nowrap xxxs:ml-8"
              >
                Очистить все
              </button>
            </div>
            <TodoForm addTodo={addTodo} />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 my-4">
              <SearchBar onSearch={setSearchTerm} />
              <TagSelector selectedTag={selectedTag} onTagSelect={setSelectedTag} />
            </div>
            <SortableTodoList
              todos={currentTodos}
              toggleComplete={toggleComplete}
              deleteTodo={deleteTodo}
              onTagSelect={updateTodoTag}
              isSelectMode={isSelectMode}
              selectedIds={selectedIds}
              onSelectTodo={handleSelectTodo}
            />
            <Pagination
              totalItems={filteredTodos.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        <DragOverlay data-testid="drag-overlay">
          {draggedTodo ? (
            <TodoItem
              todo={draggedTodo}
              toggleComplete={() => {}}
              deleteTodo={() => {}}
              onTagSelect={() => {}}
              isOverlay={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    )
  );
};

export default App;
