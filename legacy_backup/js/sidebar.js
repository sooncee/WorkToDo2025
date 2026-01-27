// 사이드바 관련 기능

let currentView = 'dashboard';

// 사이드바 초기화
function initSidebar() {
   const sidebarItems = document.querySelectorAll('.sidebar-item[data-view]');
   const sidebarLogout = document.getElementById('sidebarLogout');

   // 뷰 전환
   sidebarItems.forEach((item) => {
      item.addEventListener('click', () => {
         const view = item.dataset.view;
         switchView(view);

         // 활성 상태 업데이트
         sidebarItems.forEach((i) => i.classList.remove('active'));
         item.classList.add('active');
      });
   });

   // 로그아웃
   sidebarLogout.addEventListener('click', async () => {
      if (confirm('로그아웃 하시겠습니까?')) {
         await signOut();
         window.location.href = 'login.html';
      }
   });

   // 사이드바 토글
   const sidebarToggle = document.getElementById('sidebarToggle');
   const sidebar = document.querySelector('.sidebar');

   if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
         const isCollapsed = sidebar.classList.contains('collapsed');
         if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.add('expanded');
         } else {
            sidebar.classList.remove('expanded');
            sidebar.classList.add('collapsed');
         }
      });
   }

   // 초기 뷰 설정
   switchView(currentView);
}

// 뷰 전환
function switchView(view) {
   currentView = view;
   const dashboardSection = document.querySelector('.dashboard-section');
   const todoSection = document.querySelector('.todo-section');
   const calendarSection = document.querySelector('.calendar-section');
   const dietSection = document.querySelector('.diet-section');
   const workoutSection = document.querySelector('.workout-section');
   const roadmapSection = document.querySelector('.roadmap-section');
   const routineSection = document.querySelector('.routine-section');

   // 모든 섹션 숨기기
   [dashboardSection, todoSection, calendarSection, dietSection, workoutSection, roadmapSection, routineSection].forEach((section) => {
      if (section) section.style.display = 'none';
   });

   switch (view) {
      case 'dashboard':
         dashboardSection.style.display = 'block';
         renderDashboard();
         break;

      case 'routine':
         routineSection.style.display = 'block';
         if (typeof renderRoutineCalendar === 'function') renderRoutineCalendar();
         break;

      case 'todos':
         // 할일 목록과 캘린더를 동시에 표시
         todoSection.style.display = 'block';
         calendarSection.style.display = 'block';
         // 진행중 탭으로 전환
         const activeTab = document.querySelector('.tab-btn[data-tab="active"]');
         if (activeTab) activeTab.click();
         break;

      case 'diet':
         dietSection.style.display = 'block';
         break;

      case 'workout':
         workoutSection.style.display = 'block';
         break;

      case 'roadmap':
         roadmapSection.style.display = 'block';
         break;
   }
}
