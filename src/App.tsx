import { useMemo, useState } from 'react';
import type { Todo } from './types';
import { useLocalStorage } from './useLocalStorage';
import './App.css';

type Filter = 'all' | 'active' | 'completed';

function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: crypto.randomUUID(), text, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const commitEdit = () => {
    const text = editingText.trim();
    if (editingId && text) {
      setTodos(todos.map((t) => (t.id === editingId ? { ...t, text } : t)));
    }
    setEditingId(null);
  };

  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed));
  };

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const remainingCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <h1>TODO</h1>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일을 입력하세요"
          autoFocus
        />
        <button type="submit">추가</button>
      </form>

      <ul className="todo-list">
        {filteredTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {editingId === todo.id ? (
              <input
                type="text"
                className="edit-input"
                value={editingText}
                autoFocus
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <span className="text" onDoubleClick={() => startEditing(todo)}>
                {todo.text}
              </span>
            )}
            <button className="delete" onClick={() => deleteTodo(todo.id)} aria-label="삭제">
              ✕
            </button>
          </li>
        ))}
        {filteredTodos.length === 0 && <li className="empty">할 일이 없습니다</li>}
      </ul>

      <div className="footer">
        <span>{remainingCount}개 남음</span>
        <div className="filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            전체
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            진행중
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            완료
          </button>
        </div>
        <button className="clear" onClick={clearCompleted}>
          완료 삭제
        </button>
      </div>
    </div>
  );
}

export default App;
