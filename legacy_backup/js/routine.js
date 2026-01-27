let routines = [];
let routineLogs = {};
let proposedRoutines = [];

// 데일리 루틴 초기화
async function initRoutine() {
   console.log('Routine System Initializing...');
   loadRoutineData();
   setupRoutineEventListeners();
   setupAIEventListeners();
   renderRoutineTabs();
   renderRoutineList();
   renderRoutineSettings();
   renderRoutineCalendar();
}

function loadRoutineData() {
   const savedRoutines = localStorage.getItem('routines');
   const savedLogs = localStorage.getItem('routineLogs');

   if (savedRoutines) {
      routines = JSON.parse(savedRoutines);
      // 데이터 마이그레이션 (기존 time 필드 처리)
      routines = routines.map((r) => {
         if (r.time && !r.startTime) {
            const [start, end] = r.time.split('-').map((t) => t.trim());
            return {
               ...r,
               id: r.id || Date.now() + Math.random(),
               startTime: start || '09:00',
               endTime: end || '10:00',
            };
         }
         return r;
      });
   } else {
      routines = [];
   }

   if (savedLogs) {
      routineLogs = JSON.parse(savedLogs);
   }
}

function saveRoutineData() {
   localStorage.setItem('routines', JSON.stringify(routines));
   localStorage.setItem('routineLogs', JSON.stringify(routineLogs));
}

function setupRoutineEventListeners() {
   const addBtn = document.getElementById('openRoutineModalBtn');
   const saveBtn = document.getElementById('saveRoutineBtn');
   const modal = document.getElementById('routineModal');
   const closeBtns = document.querySelectorAll('.close-routine-modal');

   if (addBtn) addBtn.onclick = () => openRoutineModal();
   if (saveBtn) saveBtn.onclick = () => saveRoutine();

   closeBtns.forEach((btn) => {
      btn.onclick = () => {
         modal.style.display = 'none';
      };
   });

   window.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
   };
}

function renderRoutineTabs() {
   const tabs = document.querySelectorAll('.routine-tab-btn');
   const contents = document.querySelectorAll('.routine-tab-content');

   tabs.forEach((tab) => {
      tab.onclick = () => {
         tabs.forEach((t) => t.classList.remove('active'));
         contents.forEach((c) => c.classList.remove('active'));

         tab.classList.add('active');
         const content = document.getElementById(`routine${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`);
         if (content) content.classList.add('active');

         if (tab.dataset.tab === 'tracker') renderRoutineCalendar();
         if (tab.dataset.tab === 'settings') renderRoutineSettings();
         if (tab.dataset.tab === 'today') renderRoutineList();
      };
   });
}

function renderRoutineList() {
   const listContainer = document.getElementById('routineList');
   if (!listContainer) return;

   const today = new Date().toISOString().split('T')[0];
   const completedIds = routineLogs[today] || [];

   const sortedRoutines = [...routines].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

   listContainer.innerHTML = sortedRoutines
      .map(
         (routine) => `
      <div class="routine-check-item ${completedIds.includes(routine.id) ? 'completed' : ''}" onclick="toggleRoutine(${routine.id})">
         <div class="check-box">${completedIds.includes(routine.id) ? '✓' : ''}</div>
         <div class="info">
            <div class="time">${routine.startTime} - ${routine.endTime}</div>
            <div class="activity">${routine.activity}</div>
            <div class="strategy">${routine.strategy}</div>
         </div>
      </div>
   `,
      )
      .join('');

   if (routines.length === 0) {
      listContainer.innerHTML = '<div class="empty-routine">등록된 루틴이 없습니다.</div>';
   }

   updateRoutineProgressBar();
}

function updateRoutineProgressBar() {
   const today = new Date().toISOString().split('T')[0];
   const completedIds = routineLogs[today] || [];
   const total = routines.length;
   const progress = total === 0 ? 0 : Math.round((completedIds.length / total) * 100);

   const bar = document.getElementById('routineProgressBar');
   const text = document.getElementById('routineProgressText');

   if (bar) bar.style.width = `${progress}%`;
   if (text) text.innerText = `${progress}%`;
}

function toggleRoutine(id) {
   const today = new Date().toISOString().split('T')[0];
   if (!routineLogs[today]) routineLogs[today] = [];

   const index = routineLogs[today].indexOf(id);
   if (index === -1) routineLogs[today].push(id);
   else routineLogs[today].splice(index, 1);

   saveRoutineData();
   renderRoutineList();
   renderRoutineCalendar();
}

function renderRoutineSettings() {
   const settingsContainer = document.getElementById('manageRoutineList');
   if (!settingsContainer) return;

   settingsContainer.innerHTML = routines
      .map(
         (routine) => `
      <div class="manage-item">
         <div class="info">
            <strong>${routine.startTime} - ${routine.endTime}</strong>
            <span>${routine.activity}</span>
         </div>
         <div class="actions">
            <button class="add-btn-sm" style="background: #eee; color: #000; margin-right: 8px;" onclick="openRoutineModal(${routine.id})">수정</button>
            <button class="delete-btn-sm" onclick="deleteRoutine(${routine.id})">삭제</button>
         </div>
      </div>
   `,
      )
      .join('');

   if (routines.length === 0) {
      settingsContainer.innerHTML = '<div class="empty-routine">관리할 루틴이 없습니다.</div>';
   }
}

let editingRoutineId = null;
function openRoutineModal(id = null) {
   const modal = document.getElementById('routineModal');
   const title = modal.querySelector('h2');
   editingRoutineId = id;

   if (id) {
      const r = routines.find((item) => item.id === id);
      title.innerText = '루틴 수정';
      document.getElementById('routineActivity').value = r.activity;
      document.getElementById('routineStartTime').value = r.startTime;
      document.getElementById('routineEndTime').value = r.endTime;
      document.getElementById('routineStrategy').value = r.strategy;
   } else {
      title.innerText = '새 루틴 추가';
      document.getElementById('routineActivity').value = '';
      document.getElementById('routineStartTime').value = '09:00';
      document.getElementById('routineEndTime').value = '10:00';
      document.getElementById('routineStrategy').value = '';
   }
   modal.style.display = 'flex';
}

function saveRoutine() {
   const activity = document.getElementById('routineActivity').value;
   const startTime = document.getElementById('routineStartTime').value;
   const endTime = document.getElementById('routineEndTime').value;
   const strategy = document.getElementById('routineStrategy').value;

   if (!activity) return alert('활동 내용을 입력해주세요.');

   if (editingRoutineId) {
      const idx = routines.findIndex((r) => r.id === editingRoutineId);
      routines[idx] = { ...routines[idx], activity, startTime, endTime, strategy };
   } else {
      routines.push({ id: Date.now(), activity, startTime, endTime, strategy });
   }

   saveRoutineData();
   document.getElementById('routineModal').style.display = 'none';
   renderRoutineList();
   renderRoutineSettings();
   renderRoutineCalendar();
}

function deleteRoutine(id) {
   if (confirm('이 루틴을 삭제하시겠습니까?')) {
      routines = routines.filter((r) => r.id !== id);
      saveRoutineData();
      renderRoutineList();
      renderRoutineSettings();
      renderRoutineCalendar();
   }
}

function renderRoutineCalendar() {
   const grid = document.getElementById('routineCalendarGrid');
   if (!grid) return;
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth();
   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
   grid.innerHTML = days.map((d) => `<div class="day-header">${d}</div>`).join('');
   const firstDay = new Date(year, month, 1).getDay();
   const lastDate = new Date(year, month + 1, 0).getDate();
   for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="tracker-cell empty"></div>`;
   for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const completedIds = routineLogs[dateStr] || [];
      const isPerfect = routines.length > 0 && completedIds.length === routines.length;
      grid.innerHTML += `<div class="tracker-cell ${isPerfect ? 'perfect' : ''} ${d === now.getDate() ? 'today' : ''}"><span class="date-num">${d}</span><div class="mark">X</div></div>`;
   }
}

// --- AI Routine Manager Logic ---
function setupAIEventListeners() {
   const sendBtn = document.getElementById('sendAiMsgBtn');
   const input = document.getElementById('aiChatInput');
   if (sendBtn) sendBtn.onclick = sendAiMessage;
   if (input) {
      input.onkeydown = (e) => {
         if (e.key === 'Enter') sendAiMessage();
      };
   }
}

function addChatMessage(role, content) {
   const container = document.getElementById('aiChatMessages');
   if (!container) return;
   const msgDiv = document.createElement('div');
   msgDiv.className = role === 'bot' ? 'bot-msg' : 'user-msg';
   msgDiv.innerHTML = content;
   container.appendChild(msgDiv);
   container.scrollTop = container.scrollHeight;
}

function sendAiMessage() {
   const input = document.getElementById('aiChatInput');
   const text = input.value.trim();
   if (!text) return;
   addChatMessage('user', text);
   input.value = '';
   setTimeout(() => processAIRequest(text), 600);
}

function processAIRequest(text) {
   if ((text.includes('생성') || text.includes('추가')) && proposedRoutines.length > 0) {
      // 기존 배열 데이터 병합 보강
      proposedRoutines.forEach((item) => {
         routines.push({ ...item });
      });

      saveRoutineData();

      // 모든 탭 강제 새로고침
      renderRoutineList();
      renderRoutineSettings();
      renderRoutineCalendar();
      updateRoutineProgressBar();

      addChatMessage('bot', '✅ 요청하신 루틴들을 [오늘의 수행]과 [설정]에 모두 추가했습니다! 🔥');
      proposedRoutines = [];
      return;
   }

   if (text.includes('영어') || text.includes('태국어') || text.includes('루틴') || text.includes('만들어')) {
      proposedRoutines = [
         { id: Date.now() + 1, startTime: '08:00', endTime: '09:00', activity: '영어 공부', strategy: '쉐도잉 30분' },
         { id: Date.now() + 2, startTime: '10:00', endTime: '11:00', activity: '태국어 공부', strategy: '단어장 복습' },
         { id: Date.now() + 3, startTime: '13:00', endTime: '19:00', activity: '본업무 (Focus Work)', strategy: '집중 모드' },
         { id: Date.now() + 4, startTime: '20:00', endTime: '21:30', activity: '운동 & 개인공부', strategy: '가벼운 스트레칭 후 독서' },
      ];
      let response = `추천 루틴입니다:<br><div class="temp-routine-card"><b>📋 제안 목록</b><br>${proposedRoutines.map((r) => `• ${r.startTime}: ${r.activity}`).join('<br>')}</div>마음에 드시면 <b>"생성해줘"</b>라고 입력하세요!`;
      addChatMessage('bot', response);
   } else {
      addChatMessage('bot', '구체적인 활동을 말씀해 주시면 루틴을 짜 드릴게요! (예: 영어공부 포함해서 루틴 짜줘)');
   }
}

// Global Export
window.initRoutine = initRoutine;
window.toggleRoutine = toggleRoutine;
window.openRoutineModal = openRoutineModal;
window.deleteRoutine = deleteRoutine;
window.saveRoutine = saveRoutine;
