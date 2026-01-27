// DOM 요소
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const calendar = document.getElementById('calendar');
const currentPeriodEl = document.getElementById('currentPeriod');
const prevPeriodBtn = document.getElementById('prevPeriod');
const nextPeriodBtn = document.getElementById('nextPeriod');
const addModal = document.getElementById('addModal');
const editModal = document.getElementById('editModal');
const closeAddModal = document.querySelector('.close-add');
const closeEditModal = document.querySelector('.close-edit');
const tabBtns = document.querySelectorAll('.tab-btn');
const viewBtns = document.querySelectorAll('.view-btn');
const newTodoTitle = document.getElementById('newTodoTitle');
const newTodoContent = document.getElementById('newTodoContent');
const createTodoBtn = document.getElementById('createTodoBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const themeToggleBtn = document.getElementById('themeToggle');

// 초기화
init();

function init() {
   // Supabase 인증 초기화
   initAuth();

   // 사이드바 초기화
   initSidebar();

   // 테마 초기화
   initTheme();

   // 데일리 루틴 초기화
   if (typeof initRoutine === 'function') initRoutine();

   renderTodos();
   renderCalendar();
   renderDashboard();

   // 할일 추가 모달 열기
   addTodoBtn.addEventListener('click', openAddModal);

   // 할일 추가
   createTodoBtn.addEventListener('click', addTodo);
   newTodoTitle.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         addTodo();
      }
   });

   // 모달 닫기
   closeAddModal.addEventListener('click', closeAddModalHandler);
   closeEditModal.addEventListener('click', closeEditModalHandler);
   cancelAddBtn.addEventListener('click', closeAddModalHandler);

   window.addEventListener('click', (e) => {
      if (e.target === addModal) {
         closeAddModalHandler();
      }
      if (editModal === e.target) {
         closeEditModalHandler();
      }
   });

   prevPeriodBtn.addEventListener('click', () => {
      movePeriod(-1);
   });

   nextPeriodBtn.addEventListener('click', () => {
      movePeriod(1);
   });

   // 뷰 전환
   viewBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
         viewBtns.forEach((b) => b.classList.remove('active'));
         btn.classList.add('active');
         calendarView = btn.dataset.view;
         renderCalendar();
      });
   });

   // 탭 전환
   tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
         tabBtns.forEach((b) => b.classList.remove('active'));
         btn.classList.add('active');
         currentTab = btn.dataset.tab;
         renderTodos();
      });
   });

   // 할일 목록 드롭 이벤트
   todoList.addEventListener('dragover', handleTodoListDragOver);
   todoList.addEventListener('dragleave', handleTodoListDragLeave);
   todoList.addEventListener('drop', handleTodoListDrop);

   // 테마 토글 이벤트
   if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
   }
}

// 테마 초기화
function initTheme() {
   const savedTheme = localStorage.getItem('theme');
   const isDark = savedTheme === 'dark';

   if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
   } else {
      document.documentElement.removeAttribute('data-theme');
   }
   updateThemeIcon(isDark);
}

// 테마 토글
function toggleTheme() {
   const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
   const newTheme = isDark ? 'light' : 'dark';

   if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      updateThemeIcon(true);
   } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      updateThemeIcon(false);
   }
}

// 테마 아이콘 업데이트
function updateThemeIcon(isDark) {
   if (!themeToggleBtn) return;

   // Dark mode active -> Show Sun icon (to switch to light)
   // Light mode active -> Show Moon icon (to switch to dark)
   const svg = themeToggleBtn.querySelector('svg');
   if (isDark) {
      svg.innerHTML =
         '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
   } else {
      svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
   }
}

// 할일 추가 모달 열기
function openAddModal() {
   addModal.style.display = 'flex';
   newTodoTitle.value = '';
   newTodoContent.value = '';
   selectedColor = '#a8a8a8';

   // 색상 선택 초기화
   const colorOptions = addModal.querySelectorAll('.color-option');
   colorOptions.forEach((option) => {
      option.classList.remove('active');
      if (option.dataset.color === '#a8a8a8') {
         option.classList.add('active');
      }

      option.addEventListener('click', () => {
         colorOptions.forEach((opt) => opt.classList.remove('active'));
         option.classList.add('active');
         selectedColor = option.dataset.color;
      });
   });

   newTodoTitle.focus();
}

// 할일 추가 모달 닫기
function closeAddModalHandler() {
   addModal.style.display = 'none';
}

// 할일 수정 모달 닫기
function closeEditModalHandler() {
   editModal.style.display = 'none';
   currentEditingTodo = null;
}
