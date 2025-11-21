// 대시보드 관련 기능

// 대시보드 렌더링
function renderDashboard() {
  updateStats();
  renderWeeklySchedule();
  renderRecentCompleted();
}

// 통계 업데이트
function updateStats() {
  // 진행중인 할일
  const activeTodos = todos.filter((t) => !t.completed && !t.scheduledDate);
  document.getElementById("statActive").textContent = activeTodos.length;

  // 완료된 할일
  const completedTodos = todos.filter((t) => t.completed);
  document.getElementById("statCompleted").textContent = completedTodos.length;

  // 예정된 할일
  const scheduledTodos = todos.filter((t) => t.scheduledDate && !t.completed);
  document.getElementById("statScheduled").textContent = scheduledTodos.length;

  // 완료율
  const totalTodos = todos.length;
  const completionRate =
    totalTodos > 0 ? Math.round((completedTodos.length / totalTodos) * 100) : 0;
  document.getElementById("statCompletionRate").textContent =
    completionRate + "%";
}

// 이번 주 예정 렌더링
function renderWeeklySchedule() {
  const container = document.getElementById("weeklySchedule");
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  // 이번 주 예정된 할일 필터링
  const weeklyTodos = todos
    .filter((todo) => {
      if (!todo.scheduledDate || todo.completed) return false;
      const [y, m, d] = todo.scheduledDate.split("-").map(Number);
      const todoDate = new Date(y, m - 1, d);
      return todoDate >= today && todoDate <= weekEnd;
    })
    .sort((a, b) => {
      const [y1, m1, d1] = a.scheduledDate.split("-").map(Number);
      const [y2, m2, d2] = b.scheduledDate.split("-").map(Number);
      return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

  if (weeklyTodos.length === 0) {
    container.innerHTML =
      '<div class="empty-dashboard">이번 주 예정된 할일이 없습니다</div>';
    return;
  }

  container.innerHTML = "";
  weeklyTodos.slice(0, 5).forEach((todo) => {
    const item = document.createElement("div");
    item.className = "schedule-item";
    item.style.borderLeftColor = todo.color || "#a8a8a8";

    const [y, m, d] = todo.scheduledDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dateStr = `${m}/${d} (${dayNames[date.getDay()]})`;

    item.innerHTML = `
      <div class="schedule-date">${dateStr}</div>
      <div class="schedule-title">${todo.title}</div>
    `;

    item.addEventListener("click", () => {
      showModal(todo.id, todo.title, todo.content, todo);
    });

    container.appendChild(item);
  });
}

// 최근 완료 렌더링
function renderRecentCompleted() {
  const container = document.getElementById("recentCompleted");

  const recentCompleted = todos
    .filter((t) => t.completed && t.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  if (recentCompleted.length === 0) {
    container.innerHTML =
      '<div class="empty-dashboard">최근 완료한 할일이 없습니다</div>';
    return;
  }

  container.innerHTML = "";
  recentCompleted.forEach((todo) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.style.borderLeftColor = todo.color || "#a8a8a8";

    const completedDate = new Date(todo.completedAt);
    const dateStr = `${
      completedDate.getMonth() + 1
    }/${completedDate.getDate()}`;

    item.innerHTML = `
      <div class="recent-title">${todo.title}</div>
      <div class="recent-date">${dateStr}</div>
    `;

    item.addEventListener("click", () => {
      showModal(todo.id, todo.title, todo.content, todo);
    });

    container.appendChild(item);
  });
}
