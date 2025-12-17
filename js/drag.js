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
async function handleTodoListDrop(e) {
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

  if (currentUser) {
    await updateTodoInSupabase(draggedTodo);
  } else {
    saveTodos();
  }

  renderTodos();
  renderCalendar();
  draggedTodo = null;
}

// 드롭
async function handleDrop(e) {
  e.preventDefault();
  const dayEl = e.currentTarget;
  dayEl.classList.remove("drag-over");

  if (!draggedTodo || !dayEl.classList.contains("calendar-day")) return;

  const dateKey = dayEl.dataset.date;

  // 할일의 scheduledDate 업데이트
  draggedTodo.scheduledDate = dateKey;

  if (currentUser) {
    await updateTodoInSupabase(draggedTodo);
  } else {
    saveTodos();
  }

  renderTodos();
  renderCalendar();
  draggedTodo = null;
}

// 터치 기반 모바일용 할일 drag (최소한의 동작, drop 등 세부 UX는 추가 개선 가능)
let touchDragActiveTodo = null;

function handleTodoTouchStart(e) {
  if (e.touches.length !== 1) return;
  e.stopPropagation();
  const target = e.currentTarget || e.target;
  touchDragActiveTodo = target;
  // 기존 마우스 시작 로직 호출 (draggedTodo 설정 등)
  handleTodoItemDragStart({ target: target });
}

function handleTodoTouchMove(e) {
  // 향후: 움직임 피드백 주려면 이곳에서 position 활용
  if (!touchDragActiveTodo) return;
  e.preventDefault();
}

function handleTodoTouchEnd(e) {
  if (!touchDragActiveTodo) return;
  // 1. 마지막 손가락 위치 얻기
  const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
  if (touch) {
    let elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elem) {
      // calendar-day 셀 위에서 drop
      if (elem.classList.contains('calendar-day')) {
        handleDrop({ preventDefault: () => {}, currentTarget: elem });
      } else {
        // drop-zone(#todoList 포함)의 자식 위에서 drop도 허용
        const dropZoneElem = elem.closest('.drop-zone, #todoList');
        if (dropZoneElem) {
          handleTodoListDrop({ preventDefault: () => {}, target: dropZoneElem });
        }
      }
    }
  }
  handleDragEnd({ target: touchDragActiveTodo });
  touchDragActiveTodo = null;
  e.preventDefault();
}
