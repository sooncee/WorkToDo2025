// 드래그 앤 드롭 관련 기능

// 드래그 시작 (할일 목록에서)
function handleDragStart(e) {
  const todoId = parseInt(e.target.dataset.id);
  const todo = todos.find((t) => t.id === todoId);

  // 완료된 할일은 드래그 불가
  if (todo.completed) {
    e.preventDefault();
    return;
  }

  draggedTodo = todo;
  e.target.classList.add("dragging");
}

// 드래그 시작 (캘린더에서)
function handleCalendarTodoDragStart(e) {
  e.stopPropagation();
  const todoId = parseInt(e.target.dataset.todoId);
  const todo = todos.find((t) => t.id === todoId);

  draggedTodo = todo;
  e.target.classList.add("dragging");
}

// 드래그 종료
function handleDragEnd(e) {
  e.target.classList.remove("dragging");
}

// 드래그 오버
function handleDragOver(e) {
  e.preventDefault();
  if (e.currentTarget.classList.contains("calendar-day")) {
    e.currentTarget.classList.add("drag-over");
  }
}

// 드래그 떠남
function handleDragLeave(e) {
  if (e.currentTarget.classList.contains("calendar-day")) {
    e.currentTarget.classList.remove("drag-over");
  }
}

// 할일 목록으로 드래그 오버 (캘린더에서)
function handleTodoListDragOver(e) {
  e.preventDefault();

  // 캘린더에서 온 경우만 처리
  if (
    draggedTodo &&
    draggedTodo.scheduledDate &&
    !e.target.classList.contains("todo-item")
  ) {
    todoList.classList.add("drag-over-list");
  }
}

// 할일 목록에서 드래그 떠남
function handleTodoListDragLeave(e) {
  if (e.target === todoList) {
    todoList.classList.remove("drag-over-list");
  }
}

// 할일 목록으로 드롭 (캘린더에서)
function handleTodoListDrop(e) {
  // todo-item에 드롭한 경우는 무시 (순서 변경 처리)
  if (
    e.target.classList.contains("todo-item") ||
    e.target.closest(".todo-item")
  ) {
    return;
  }

  e.preventDefault();
  todoList.classList.remove("drag-over-list");

  if (!draggedTodo || !draggedTodo.scheduledDate) return;

  // 캘린더에서 제거 (할일 목록으로 이동)
  draggedTodo.scheduledDate = null;
  saveTodos();

  renderTodos();
  renderCalendar();
  draggedTodo = null;
}

// 드롭
function handleDrop(e) {
  e.preventDefault();
  const dayEl = e.currentTarget;
  dayEl.classList.remove("drag-over");

  if (!draggedTodo || !dayEl.classList.contains("calendar-day")) return;

  const dateKey = dayEl.dataset.date;

  // 할일의 scheduledDate 업데이트
  draggedTodo.scheduledDate = dateKey;
  saveTodos();

  renderTodos();
  renderCalendar();
  draggedTodo = null;
}
