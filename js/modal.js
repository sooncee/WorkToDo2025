// 모달 관련 기능

// 모달 표시
function showModal(id, title, content, todo = null) {
  currentEditingTodo = { id };

  const modalBody = document.querySelector("#editModal .modal-body");

  let dateInfoHtml = "";
  if (todo) {
    dateInfoHtml = `
      <div class="modal-date-info">
        <div>생성일: ${formatDate(todo.createdAt)}</div>
        ${
          todo.completed
            ? `<div>완료일: ${formatDate(todo.completedAt)}</div>`
            : ""
        }
      </div>
    `;
  }

  const todoColor = todo ? todo.color || "#a8a8a8" : "#a8a8a8";

  modalBody.innerHTML = `
    <div class="modal-form">
      ${dateInfoHtml}
      <label>제목</label>
      <input type="text" id="editTitle" value="${title}" />
      <label>내용</label>
      <textarea id="editContent" rows="5">${content || ""}</textarea>
      <div class="modal-color-picker">
        <label>색상</label>
        <div class="color-options">
          <div class="color-option ${
            todoColor === "#667eea" ? "active" : ""
          }" data-color="#667eea" style="background: #667eea;"></div>
          <div class="color-option ${
            todoColor === "#f093fb" ? "active" : ""
          }" data-color="#f093fb" style="background: #f093fb;"></div>
          <div class="color-option ${
            todoColor === "#4facfe" ? "active" : ""
          }" data-color="#4facfe" style="background: #4facfe;"></div>
          <div class="color-option ${
            todoColor === "#43e97b" ? "active" : ""
          }" data-color="#43e97b" style="background: #43e97b;"></div>
          <div class="color-option ${
            todoColor === "#fa709a" ? "active" : ""
          }" data-color="#fa709a" style="background: #fa709a;"></div>
          <div class="color-option ${
            todoColor === "#feca57" ? "active" : ""
          }" data-color="#feca57" style="background: #feca57;"></div>
          <div class="color-option ${
            todoColor === "#ff6b6b" ? "active" : ""
          }" data-color="#ff6b6b" style="background: #ff6b6b;"></div>
          <div class="color-option ${
            todoColor === "#a8a8a8" ? "active" : ""
          }" data-color="#a8a8a8" style="background: #a8a8a8;"></div>
        </div>
      </div>
      <div class="modal-buttons">
        ${
          todo && !todo.completed
            ? '<button id="completeBtn" class="complete-btn">완료</button>'
            : ""
        }
        ${
          todo && todo.completed
            ? '<button id="uncompleteBtn" class="uncomplete-btn">복원</button>'
            : ""
        }
        <button id="saveBtn" class="save-btn">저장</button>
        <button id="cancelBtn" class="cancel-btn">취소</button>
      </div>
    </div>
  `;

  editModal.style.display = "block";

  // 모달 내 색상 선택
  let modalSelectedColor = todoColor;
  const modalColorOptions = modalBody.querySelectorAll(".color-option");
  modalColorOptions.forEach((option) => {
    option.addEventListener("click", () => {
      modalColorOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      modalSelectedColor = option.dataset.color;
    });
  });

  // 완료/복원 버튼
  if (todo) {
    const completeBtn = document.getElementById("completeBtn");
    const uncompleteBtn = document.getElementById("uncompleteBtn");

    if (completeBtn) {
      completeBtn.addEventListener("click", () => {
        toggleTodoComplete(id);
        closeEditModalHandler();
      });
    }

    if (uncompleteBtn) {
      uncompleteBtn.addEventListener("click", () => {
        toggleTodoComplete(id);
        closeEditModalHandler();
      });
    }
  }

  // 저장 버튼
  document.getElementById("saveBtn").addEventListener("click", () => {
    saveModalChanges(modalSelectedColor);
  });

  // 취소 버튼
  document
    .getElementById("cancelBtn")
    .addEventListener("click", closeEditModalHandler);
}

// 모달 변경사항 저장
function saveModalChanges(color) {
  const newTitle = document.getElementById("editTitle").value.trim();
  const newContent = document.getElementById("editContent").value.trim();

  if (!newTitle) {
    alert("제목을 입력해주세요.");
    return;
  }

  updateTodo(currentEditingTodo.id, newTitle, newContent, color);

  closeEditModalHandler();
}
