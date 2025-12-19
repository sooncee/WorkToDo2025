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
      totalTodos > 0
         ? Math.round((completedTodos.length / totalTodos) * 100)
         : 0;
   document.getElementById("statCompletionRate").textContent =
      completionRate + "%";
}

// 이번 주 예정 렌더링
// 예정된 일정 렌더링 (D-Day 기능 추가)
function renderWeeklySchedule() {
   const container = document.getElementById("weeklySchedule");
   // 헤더 텍스트 변경
   const header = container.previousElementSibling;
   if (header && header.tagName === "H3") {
      header.innerHTML = "📅 예정된 일정";
   }

   const today = new Date();
   today.setHours(0, 0, 0, 0);

   // 예정된 할일 필터링 (완료되지 않고 날짜가 지정된 모든 할일)
   const scheduledTodos = todos
      .filter((todo) => {
         if (!todo.scheduledDate || todo.completed) return false;
         const [y, m, d] = todo.scheduledDate.split("-").map(Number);
         const todoDate = new Date(y, m - 1, d);
         todoDate.setHours(0, 0, 0, 0);
         return true; // 과거 일정도 포함하여 D+로 표시할지 여부는 선택사항이나, "남은 날짜" 체크이므로 주로 미래
      })
      .sort((a, b) => {
         const [y1, m1, d1] = a.scheduledDate.split("-").map(Number);
         const [y2, m2, d2] = b.scheduledDate.split("-").map(Number);
         return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
      });

   // 과거 일정 제외하고 오늘 이후 것만 보여줄지, 아니면 전체 보여줄지.
   // "몇일이 남았는지 체크" -> 미래 지향적. 오늘 포함 미래만 보여주는게 깔끔함.
   // 하지만 놓친 일정도 중요할 수 있으니 user needs에 맞게...
   // 일단 오늘 포함 미래 일정만 필터링하도록 수정
   const upcomingTodos = scheduledTodos.filter((todo) => {
      const [y, m, d] = todo.scheduledDate.split("-").map(Number);
      const todoDate = new Date(y, m - 1, d);
      todoDate.setHours(0, 0, 0, 0);
      return todoDate >= today;
   });

   if (upcomingTodos.length === 0) {
      container.innerHTML =
         '<div class="empty-dashboard">예정된 일정이 없습니다</div>';
      return;
   }

   container.innerHTML = "";
   upcomingTodos.slice(0, 5).forEach((todo) => {
      const item = document.createElement("div");
      item.className = "schedule-item";
      item.style.borderLeftColor = todo.color || "#a8a8a8";

      const [y, m, d] = todo.scheduledDate.split("-").map(Number);
      const todoDate = new Date(y, m - 1, d);
      todoDate.setHours(0, 0, 0, 0);

      // D-Day 계산
      const diffTime = todoDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let dDayStr = "";
      let dDayClass = "";

      if (diffDays === 0) {
         dDayStr = "D-Day";
         dDayClass = "today";
      } else {
         dDayStr = `D-${diffDays}`;
         dDayClass = diffDays <= 3 ? "urgent" : ""; // 3일 이내 임박
      }

      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const dateStr = `${m}/${d} (${dayNames[todoDate.getDay()]})`;

      item.innerHTML = `
      <div class="schedule-left">
        <div class="schedule-dday ${dDayClass}">${dDayStr}</div>
        <div class="schedule-date">${dateStr}</div>
      </div>
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
