// 사이드바 관련 기능

let currentView = "dashboard";

// 사이드바 초기화
function initSidebar() {
  const sidebarItems = document.querySelectorAll(".sidebar-item[data-view]");
  const sidebarLogout = document.getElementById("sidebarLogout");

  // 뷰 전환
  sidebarItems.forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      switchView(view);

      // 활성 상태 업데이트
      sidebarItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // 로그아웃
  sidebarLogout.addEventListener("click", () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      signOut();
    }
  });
}

// 뷰 전환
function switchView(view) {
  currentView = view;
  const dashboardSection = document.querySelector(".dashboard-section");
  const todoSection = document.querySelector(".todo-section");
  const calendarSection = document.querySelector(".calendar-section");

  // 모든 섹션 숨기기
  dashboardSection.style.display = "none";
  todoSection.style.display = "none";
  calendarSection.style.display = "none";

  switch (view) {
    case "dashboard":
      // 대시보드
      dashboardSection.style.display = "block";
      renderDashboard();
      break;

    case "todos":
      // 할일 목록만
      todoSection.style.display = "block";
      calendarSection.style.display = "block";
      // 진행중 탭으로 전환
      document.querySelector('.tab-btn[data-tab="active"]').click();
      break;

    case "calendar":
      // 캘린더만
      calendarSection.style.display = "block";
      break;

    case "completed":
      // 완료된 할일만
      todoSection.style.display = "block";
      // 완료 탭으로 전환
      document.querySelector('.tab-btn[data-tab="completed"]').click();
      break;
  }
}
