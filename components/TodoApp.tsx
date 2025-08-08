"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "next-todo-app:v1";

function uid() {
  // simple unique id based on time and random
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Todo[] = JSON.parse(raw);
        if (Array.isArray(parsed)) setTodos(parsed);
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {}
  }, [todos]);

  const remaining = useMemo(() => todos.filter((t) => !t.completed).length, [
    todos,
  ]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  function addTodo(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      { id: uid(), title: trimmed, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  function editTodo(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return removeTodo(id);
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inputRef.current) {
      addTodo(inputRef.current.value);
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }

  return (
    <div className="card">
      <form className="add" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          className="input"
          type="text"
          placeholder="What needs to be done?"
          aria-label="Add todo"
          maxLength={200}
          autoFocus
        />
        <button className="primary" type="submit">Add</button>
      </form>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="Filter todos">
          <button
            role="tab"
            aria-selected={filter === "all"}
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            role="tab"
            aria-selected={filter === "active"}
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            role="tab"
            aria-selected={filter === "completed"}
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
        <div className="meta">
          <span>{remaining} left</span>
          <button className="muted" onClick={clearCompleted}>Clear completed</button>
        </div>
      </div>

      <ul className="list">
        {filtered.length === 0 && (
          <li className="empty">No todos</li>
        )}
        {filtered.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => removeTodo(todo.id)}
            onEdit={(title) => editTodo(todo.id, title)}
          />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  function submitEdit() {
    setEditing(false);
    if (title !== todo.title) onEdit(title);
  }

  return (
    <li className="item">
      <label className="checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
        />
        <span className={todo.completed ? "completed" : ""}></span>
      </label>

      {editing ? (
        <input
          ref={editRef}
          className="edit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={submitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitEdit();
            if (e.key === "Escape") {
              setTitle(todo.title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <span
          className={"title " + (todo.completed ? "completed" : "")}
          onDoubleClick={() => setEditing(true)}
        >
          {todo.title}
        </span>
      )}

      <div className="actions">
        {!editing && (
          <button className="muted" onClick={() => setEditing(true)} aria-label="Edit">
            Edit
          </button>
        )}
        <button className="danger" onClick={onDelete} aria-label="Delete">
          Delete
        </button>
      </div>
    </li>
  );
}
