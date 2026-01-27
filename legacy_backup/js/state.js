// 상태 관리
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentDate = new Date();
let draggedTodo = null;
let draggedTodoElement = null;
let currentEditingTodo = null;
let currentTab = "active"; // 'active' 또는 'completed'
let selectedColor = "#a8a8a8"; // 기본 색상
let calendarView = "calendar"; // 'calendar', 'list'

// 기존 데이터 마이그레이션 (한 번만 실행)
const oldCalendarTodos = JSON.parse(localStorage.getItem("calendarTodos"));
if (oldCalendarTodos && Object.keys(oldCalendarTodos).length > 0) {
  // 기존 캘린더 데이터를 todos에 병합
  Object.entries(oldCalendarTodos).forEach(([date, todosInDate]) => {
    todosInDate.forEach((todo) => {
      const exists = todos.some((t) => t.id === todo.id);
      if (!exists) {
        todos.push({ ...todo, scheduledDate: date });
      } else {
        // 이미 존재하면 scheduledDate만 업데이트
        const existingTodo = todos.find((t) => t.id === todo.id);
        existingTodo.scheduledDate = date;
      }
    });
  });
  localStorage.removeItem("calendarTodos");
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 로컬 스토리지 저장 (Supabase 사용 시 백업용)
function saveTodos() {
  if (!currentUser) {
    localStorage.setItem("todos", JSON.stringify(todos));
  }
}
