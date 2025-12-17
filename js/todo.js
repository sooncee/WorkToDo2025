// 할일 관련 기능

// 할일 추가
async function addTodo() {
  const title = newTodoTitle.value.trim();
  const content = newTodoContent.value.trim();
  if (!title) {
    alert("제목을 입력해주세요.");
    return;
  }

  const todo = {
    title: title,
    content: content,
    color: selectedColor,
    createdAt: new Date().toISOString(),
    completed: false,
    completedAt: null,
    scheduledDate: null,
    order: todos.length,
  };

  if (currentUser) {
    // Supabase에 추가
    const id = await addTodoToSupabase(todo);
    if (id) {
      todo.id = id;
      todos.push(todo);
      renderTodos();
      renderDashboard();

    }
  } else {
    // 로컬 저장
    todo.id = Date.now();
    todos.push(todo);
    saveTodos();
    renderTodos();
    renderDashboard();
  }

  closeAddModalHandler();
}

// 할일 삭제
async function deleteTodo(id, skipConfirm = false) {
  if (!skipConfirm && !confirm("이 할일을 삭제하시겠습니까?")) {
    return;
  }

  if (currentUser) {
    await deleteTodoFromSupabase(id);
  }

  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
  renderDashboard();
}

// 할일 수정
async function updateTodo(id, title, content, color) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.title = title;
    todo.content = content;
    todo.color = color;

    if (currentUser) {
      await updateTodoInSupabase(todo);
    } else {
      saveTodos();
    }

    renderTodos();
    renderCalendar();
    renderDashboard();
  }
}

// 할일 목록 렌더링
function renderTodos() {
  todoList.innerHTML = "";

  // 현재 탭에 맞고 캘린더에 없는 할일만 필터링
  const filteredTodos = todos.filter((todo) => {
    const isInList = !todo.scheduledDate; // 캘린더에 없는 것만
    if (currentTab === "active") {
      return !todo.completed && isInList;
    } else {
      return todo.completed && isInList;
    }
  });

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `<div class="empty-message">${
      currentTab === "active" ? "할일이 없습니다" : "완료된 할일이 없습니다"
    }</div>`;
    return;
  }

  // order 속성이 없는 항목에 추가
  filteredTodos.forEach((todo, index) => {
    if (todo.order === undefined) {
      todo.order = index;
    }
  });

  // order로 정렬
  filteredTodos.sort((a, b) => (a.order || 0) - (b.order || 0));

  filteredTodos.forEach((todo, index) => {
    const todoItem = document.createElement("div");
    todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`;
    todoItem.draggable = !todo.completed;
    todoItem.dataset.id = todo.id;
    todoItem.dataset.index = index;
    todoItem.style.borderLeftColor = todo.color || "#a8a8a8";

    const dateInfo = todo.completed
      ? `<div class="todo-date">완료: ${formatDate(todo.completedAt)}</div>`
      : `<div class="todo-date">생성: ${formatDate(todo.createdAt)}</div>`;

    todoItem.innerHTML = `
            <div class="todo-content">
                <span class="todo-text">${todo.title}</span>
                ${dateInfo}
            </div>
            <div class="todo-actions">
                ${
                  !todo.completed
                    ? '<button class="complete-btn">완료</button>'
                    : '<button class="uncomplete-btn">복원</button>'
                }
                <button class="delete-btn">삭제</button>
            </div>
        `;

    // 클릭 이벤트 - 모달 열기
    todoItem.querySelector(".todo-text").addEventListener("click", (e) => {
      e.stopPropagation();
      showModal(todo.id, todo.title, todo.content, todo);
    });

    // 완료/복원 버튼
    const actionBtn = todoItem.querySelector(".complete-btn, .uncomplete-btn");
    if (actionBtn) {
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTodoComplete(todo.id);
      });
    }

    // 드래그 이벤트 (완료되지 않은 항목만, 모바일 터치도 지원)
    if (!todo.completed) {
      todoItem.addEventListener("dragstart", handleTodoItemDragStart);
      todoItem.addEventListener("dragend", handleDragEnd);
      todoItem.addEventListener("dragover", handleTodoItemDragOver);
      todoItem.addEventListener("drop", handleTodoItemDrop);
      // 모바일 터치 지원
      todoItem.addEventListener("touchstart", handleTodoTouchStart, {passive:false});
      todoItem.addEventListener("touchmove", handleTodoTouchMove, {passive:false});
      todoItem.addEventListener("touchend", handleTodoTouchEnd, {passive:false});
    }

    // 삭제 버튼
    todoItem.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTodo(todo.id);
    });

    todoList.appendChild(todoItem);
  });
}

// 할일 완료/미완료 토글
async function toggleTodoComplete(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : null;

    // 완료 처리 시 캘린더에서 제거 (할일 목록으로 이동)
    if (todo.completed && todo.scheduledDate) {
      todo.scheduledDate = null;
    }

    if (currentUser) {
      await updateTodoInSupabase(todo);
    } else {
      saveTodos();
    }

    renderTodos();
    renderCalendar();
    renderDashboard();
  }
}

// 날짜 포맷팅
function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // const hours = String(date.getHours()).padStart(2, "0");
  // const minutes = String(date.getMinutes()).padStart(2, "0");
  // return `${year}-${month}-${day} ${hours}:${minutes}`;
  return `${year}-${month}-${day}`;
}

// 할일 목록 내 드래그 시작
function handleTodoItemDragStart(e) {
  const todoId = parseInt(e.target.dataset.id);
  const todo = todos.find((t) => t.id === todoId);

  if (todo.completed) {
    e.preventDefault();
    return;
  }

  draggedTodo = todo;
  draggedTodoElement = e.target;
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

// 할일 목록 내 드래그 오버
function handleTodoItemDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const afterElement = getDragAfterElement(todoList, e.clientY);
  const draggingElement = document.querySelector(".dragging");

  if (afterElement == null) {
    todoList.appendChild(draggingElement);
  } else {
    todoList.insertBefore(draggingElement, afterElement);
  }
}

// 할일 목록 내 드롭
async function handleTodoItemDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  // 새로운 순서 저장
  const todoItems = Array.from(todoList.querySelectorAll(".todo-item"));
  const updatePromises = [];

  todoItems.forEach((item, index) => {
    const todoId = parseInt(item.dataset.id);
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
      todo.order = index;
      if (currentUser) {
        updatePromises.push(updateTodoInSupabase(todo));
      }
    }
  });

  if (currentUser) {
    await Promise.all(updatePromises);
  } else {
    saveTodos();
  }

  draggedTodo = null;
  draggedTodoElement = null;
}

// 드래그 위치 계산
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".todo-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
