// 캘린더 관련 기능

// 캘린더 렌더링
function renderCalendar() {
  if (calendarView === "calendar") {
    renderCalendarView();
  } else if (calendarView === "list") {
    renderListView();
  }
}

// 캘린더 뷰
function renderCalendarView() {
  calendar.className = "calendar";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  currentPeriodEl.textContent = `${year}년 ${month + 1}월`;

  calendar.innerHTML = "";

  // 요일 헤더
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach((day) => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "day-header";
    dayHeader.textContent = day;
    calendar.appendChild(dayHeader);
  });

  // 첫날과 마지막날
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 빈 칸 추가
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div");
    calendar.appendChild(emptyDay);
  }

  // 날짜 추가
  for (let date = 1; date <= lastDate; date++) {
    const dateKey = `${year}-${month + 1}-${date}`;
    renderDayCell(date, dateKey);
  }
}

// 리스트 뷰
function renderListView() {
  calendar.className = "calendar list-view";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  currentPeriodEl.textContent = `${year}년 ${month + 1}월`;

  calendar.innerHTML = "";

  // 해당 월의 모든 할일 가져오기 (완료되지 않은 것만)
  const scheduledTodos = todos.filter((todo) => {
    if (!todo.scheduledDate || todo.completed) return false;
    const [y, m] = todo.scheduledDate.split("-").map(Number);
    return y === year && m === month + 1;
  });

  // 날짜별로 그룹화
  const todosByDate = {};
  scheduledTodos.forEach((todo) => {
    if (!todosByDate[todo.scheduledDate]) {
      todosByDate[todo.scheduledDate] = [];
    }
    todosByDate[todo.scheduledDate].push(todo);
  });

  // 날짜 순으로 정렬
  const sortedDates = Object.keys(todosByDate).sort((a, b) => {
    const [y1, m1, d1] = a.split("-").map(Number);
    const [y2, m2, d2] = b.split("-").map(Number);
    return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
  });

  if (sortedDates.length === 0) {
    calendar.innerHTML =
      '<div class="empty-message">이번 달에 예정된 할일이 없습니다</div>';
    return;
  }

  // 날짜별로 렌더링
  sortedDates.forEach((dateKey) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = date.getDay();

    const dateSection = document.createElement("div");
    dateSection.className = "list-date-section";
    dateSection.dataset.date = dateKey;

    const dateHeader = document.createElement("div");
    dateHeader.className = "list-date-header";
    dateHeader.innerHTML = `
      <span class="list-date-day">${d}</span>
      <span class="list-date-info">${m}월 ${d}일 (${dayNames[dayOfWeek]})</span>
    `;

    const todosContainer = document.createElement("div");
    todosContainer.className = "list-todos-container";

    // 드롭 이벤트
    dateSection.addEventListener("dragover", handleListDragOver);
    dateSection.addEventListener("dragleave", handleListDragLeave);
    dateSection.addEventListener("drop", (e) => handleListDrop(e, dateKey));

    todosByDate[dateKey].forEach((todo) => {
      const todoEl = document.createElement("div");
      todoEl.className = "list-todo-item";
      todoEl.draggable = true;
      todoEl.dataset.todoId = todo.id;
      todoEl.style.borderLeftColor = todo.color || "#a8a8a8";

      todoEl.innerHTML = `
        <div class="list-todo-content">
          <span class="list-todo-title">${todo.title}</span>
          ${
            todo.content
              ? `<span class="list-todo-desc">${todo.content}</span>`
              : ""
          }
        </div>
        <button class="delete-btn">×</button>
      `;

      // 클릭 이벤트
      todoEl
        .querySelector(".list-todo-content")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          showModal(todo.id, todo.title, todo.content, todo);
        });

      // 드래그 이벤트
      todoEl.addEventListener("dragstart", handleCalendarTodoDragStart);
      todoEl.addEventListener("dragend", handleDragEnd);

      // 삭제 버튼
      todoEl.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCalendarTodo(todo.id);
      });

      todosContainer.appendChild(todoEl);
    });

    dateSection.appendChild(dateHeader);
    dateSection.appendChild(todosContainer);
    calendar.appendChild(dateSection);
  });
}

// 날짜 셀 렌더링 (캘린더 뷰용)
function renderDayCell(date, dateKey) {
  const dayEl = document.createElement("div");
  dayEl.className = "calendar-day";
  dayEl.dataset.date = dateKey;

  // 오늘 날짜 체크
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;
  if (dateKey === todayKey) {
    dayEl.classList.add("today");
  }

  dayEl.innerHTML = `<div class="day-number">${date}</div><div class="calendar-todos"></div>`;

  // 드롭 이벤트
  dayEl.addEventListener("dragover", handleDragOver);
  dayEl.addEventListener("dragleave", handleDragLeave);
  dayEl.addEventListener("drop", handleDrop);

  // 해당 날짜의 할일 표시 (완료되지 않은 것만)
  const todosForDate = todos.filter(
    (todo) => todo.scheduledDate === dateKey && !todo.completed
  );

  if (todosForDate.length > 0) {
    const todosContainer = dayEl.querySelector(".calendar-todos");
    todosForDate.forEach((todo) => {
      const todoEl = document.createElement("div");
      todoEl.className = "calendar-todo";
      todoEl.draggable = true;
      todoEl.dataset.todoId = todo.id;
      todoEl.style.backgroundColor = todo.color || "#a8a8a8";
      todoEl.innerHTML = `
                <span class="calendar-todo-title">${todo.title}</span>
                <button class="delete-btn">×</button>
            `;

      // 클릭 이벤트 - 모달 열기
      todoEl
        .querySelector(".calendar-todo-title")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          showModal(todo.id, todo.title, todo.content, todo);
        });

      // 캘린더 할일 드래그 이벤트
      todoEl.addEventListener("dragstart", handleCalendarTodoDragStart);
      todoEl.addEventListener("dragend", handleDragEnd);

      todoEl.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCalendarTodo(todo.id);
      });

      todosContainer.appendChild(todoEl);
    });
  }

  calendar.appendChild(dayEl);
}

// 캘린더 할일 삭제
async function deleteCalendarTodo(todoId) {
  if (!confirm("이 할일을 삭제하시겠습니까?")) {
    return;
  }

  const todo = todos.find((t) => t.id === todoId);
  if (todo) {
    // 캘린더에서만 제거 (할일 목록으로 되돌리기)
    todo.scheduledDate = null;

    if (currentUser) {
      await updateTodoInSupabase(todo);
    } else {
      saveTodos();
    }

    renderTodos();
    renderCalendar();
  }
}

// 날짜 이동
function movePeriod(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

// 리스트 뷰 드래그 오버
function handleListDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
}

// 리스트 뷰 드래그 떠남
function handleListDragLeave(e) {
  if (e.currentTarget.classList.contains("list-date-section")) {
    e.currentTarget.classList.remove("drag-over");
  }
}

// 리스트 뷰 드롭
async function handleListDrop(e, dateKey) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");

  if (!draggedTodo) return;

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
