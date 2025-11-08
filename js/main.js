// DOM 요소
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");
const calendar = document.getElementById("calendar");
const currentPeriodEl = document.getElementById("currentPeriod");
const prevPeriodBtn = document.getElementById("prevPeriod");
const nextPeriodBtn = document.getElementById("nextPeriod");
const addModal = document.getElementById("addModal");
const editModal = document.getElementById("editModal");
const closeAddModal = document.querySelector(".close-add");
const closeEditModal = document.querySelector(".close-edit");
const tabBtns = document.querySelectorAll(".tab-btn");
const viewBtns = document.querySelectorAll(".view-btn");
const newTodoTitle = document.getElementById("newTodoTitle");
const newTodoContent = document.getElementById("newTodoContent");
const createTodoBtn = document.getElementById("createTodoBtn");
const cancelAddBtn = document.getElementById("cancelAddBtn");

// 초기화
init();

function init() {
  renderTodos();
  renderCalendar();

  // 할일 추가 모달 열기
  addTodoBtn.addEventListener("click", openAddModal);

  // 할일 추가
  createTodoBtn.addEventListener("click", addTodo);
  newTodoTitle.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  });

  // 모달 닫기
  closeAddModal.addEventListener("click", closeAddModalHandler);
  closeEditModal.addEventListener("click", closeEditModalHandler);
  cancelAddBtn.addEventListener("click", closeAddModalHandler);

  window.addEventListener("click", (e) => {
    if (e.target === addModal) {
      closeAddModalHandler();
    }
    if (e.target === editModal) {
      closeEditModalHandler();
    }
  });

  prevPeriodBtn.addEventListener("click", () => {
    movePeriod(-1);
  });

  nextPeriodBtn.addEventListener("click", () => {
    movePeriod(1);
  });

  // 뷰 전환
  viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      calendarView = btn.dataset.view;
      renderCalendar();
    });
  });

  // 탭 전환
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      renderTodos();
    });
  });

  // 할일 목록 드롭 이벤트
  todoList.addEventListener("dragover", handleTodoListDragOver);
  todoList.addEventListener("dragleave", handleTodoListDragLeave);
  todoList.addEventListener("drop", handleTodoListDrop);
}

// 할일 추가 모달 열기
function openAddModal() {
  addModal.style.display = "block";
  newTodoTitle.value = "";
  newTodoContent.value = "";
  selectedColor = "#a8a8a8";

  // 색상 선택 초기화
  const colorOptions = addModal.querySelectorAll(".color-option");
  colorOptions.forEach((option) => {
    option.classList.remove("active");
    if (option.dataset.color === "#a8a8a8") {
      option.classList.add("active");
    }

    option.addEventListener("click", () => {
      colorOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      selectedColor = option.dataset.color;
    });
  });

  newTodoTitle.focus();
}

// 할일 추가 모달 닫기
function closeAddModalHandler() {
  addModal.style.display = "none";
}

// 할일 수정 모달 닫기
function closeEditModalHandler() {
  editModal.style.display = "none";
  currentEditingTodo = null;
}
