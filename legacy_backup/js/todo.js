/* global newTodoTitle, newTodoContent, selectedColor, todos, currentUser, addTodoToSupabase, renderTodos, renderCalendar, renderDashboard, saveTodos, closeAddModalHandler, deleteTodoFromSupabase, updateTodoInSupabase, todoList, currentTab, showModal, formatDate, handleDragEnd, handleTodoTouchStart, handleTodoTouchMove, handleTodoTouchEnd, draggedTodo, draggedTodoElement, getDragAfterElement */

// 할일 관련 기능

/**
 * 새로운 할일을 추가합니다.
 */
async function addTodo() {
	if (!newTodoTitle || !newTodoContent) return;

	const title = newTodoTitle.value.trim();
	const content = newTodoContent.value.trim();
	if (!title) {
		alert('제목을 입력해주세요.');
		return;
	}

	const todo = {
		title: title,
		content: content,
		color: selectedColor,
		createdAt: new Date().toISOString(),
		completed: false,
		completedAt: null,
		scheduledDate: null,
		order: (todos && todos.length) || 0,
	};

	if (currentUser) {
		// Supabase에 추가
		const id = await addTodoToSupabase(todo);
		if (id) {
			todo.id = id;
			if (Array.isArray(todos)) todos.push(todo);
			renderTodos();
			renderCalendar();
			renderDashboard();
		}
	} else {
		// 로컬 저장
		todo.id = Date.now();
		if (Array.isArray(todos)) todos.push(todo);
		saveTodos();
		renderTodos();
		renderCalendar();
		renderDashboard();
	}

	if (typeof closeAddModalHandler === 'function') {
		closeAddModalHandler();
	}
}

/**
 * 할일을 삭제합니다.
 * @param {string|number} id - 삭제할 할일의 ID
 * @param {boolean} skipConfirm - 확인 절차 건너뛰기 여부
 */
async function deleteTodo(id, skipConfirm = false) {
	if (!id) return;
	if (!skipConfirm && !confirm('이 할일을 삭제하시겠습니까?')) {
		return;
	}

	if (currentUser) {
		await deleteTodoFromSupabase(id);
	}

	if (Array.isArray(todos)) {
		todos = todos.filter((todo) => String(todo.id) !== String(id));
	}
	saveTodos();
	renderTodos();
	renderCalendar();
	renderDashboard();
}

/**
 * 할일 정보를 수정합니다.
 */
async function updateTodo(id, title, content, color) {
	if (!Array.isArray(todos)) return;
	const todo = todos.find((t) => String(t.id) === String(id));
	if (todo) {
		todo.title = title;
		todo.content = content;
		todo.color = color;

		if (currentUser) {
			await updateTodoInSupabase(todo);
		} else {
			saveTodos();
		}

		renderTodos();
		renderCalendar();
		renderDashboard();
	}
}

/**
 * 할일 목록을 화면에 렌더링합니다.
 */
function renderTodos() {
	if (!todoList) return;
	todoList.innerHTML = '';

	if (!Array.isArray(todos)) return;

	// 현재 탭에 맞고 캘린더에 없는 할일만 필터링
	const filteredTodos = todos.filter((todo) => {
		const isInList = !todo.scheduledDate; // 캘린더에 없는 것만
		if (currentTab === 'active') {
			return !todo.completed && isInList;
		} else {
			return todo.completed && isInList;
		}
	});

	if (filteredTodos.length === 0) {
		todoList.innerHTML = `<div class="empty-message">${currentTab === 'active' ? '할일이 없습니다' : '완료된 할일이 없습니다'}</div>`;
		return;
	}

	// order 속성이 없는 항목에 추가
	filteredTodos.forEach((todo, index) => {
		if (todo.order === undefined) {
			todo.order = index;
		}
	});

	// order로 정렬
	filteredTodos.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

	filteredTodos.forEach((todo, index) => {
		const todoItem = document.createElement('div');
		todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
		todoItem.draggable = !todo.completed;
		todoItem.dataset.id = String(todo.id);
		todoItem.dataset.index = String(index);
		todoItem.style.borderLeftColor = todo.color || '#a8a8a8';

		const dateInfo = todo.completed
			? `<div class="todo-date">완료: ${formatDate(todo.completedAt)}</div>`
			: `<div class="todo-date">생성: ${formatDate(todo.createdAt)}</div>`;

		todoItem.innerHTML = `
            <div class="todo-content">
                <span class="todo-text">${todo.title}</span>
                ${dateInfo}
            </div>
            <div class="todo-actions">
                ${!todo.completed ? '<button class="complete-btn">완료</button>' : '<button class="uncomplete-btn">복원</button>'}
                <button class="delete-btn">삭제</button>
            </div>
        `;

		// 클릭 이벤트 - 모달 열기
		const todoText = todoItem.querySelector('.todo-text');
		if (todoText) {
			todoText.addEventListener('click', (e) => {
				e.stopPropagation();
				if (typeof showModal === 'function') {
					showModal(todo.id, todo.title, todo.content, todo);
				}
			});
		}

		// 완료/복원 버튼
		const actionBtn = todoItem.querySelector('.complete-btn, .uncomplete-btn');
		if (actionBtn) {
			actionBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				toggleTodoComplete(todo.id);
			});
		}

		// 드래그 이벤트 (완료되지 않은 항목만, 모바일 터치도 지원)
		if (!todo.completed) {
			todoItem.addEventListener('dragstart', handleTodoItemDragStart);
			if (typeof handleDragEnd === 'function') {
				todoItem.addEventListener('dragend', handleDragEnd);
			}
			todoItem.addEventListener('dragover', handleTodoItemDragOver);
			todoItem.addEventListener('drop', handleTodoItemDrop);

			// 모바일 터치 지원
			if (typeof handleTodoTouchStart === 'function') {
				todoItem.addEventListener('touchstart', handleTodoTouchStart, { passive: false });
			}
			if (typeof handleTodoTouchMove === 'function') {
				todoItem.addEventListener('touchmove', handleTodoTouchMove, { passive: false });
			}
			if (typeof handleTodoTouchEnd === 'function') {
				todoItem.addEventListener('touchend', handleTodoTouchEnd, { passive: false });
			}
		}

		// 삭제 버튼
		const deleteBtn = todoItem.querySelector('.delete-btn');
		if (deleteBtn) {
			deleteBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				deleteTodo(todo.id);
			});
		}

		todoList.appendChild(todoItem);
	});
}

/**
 * 할일 완료 상태를 토글합니다.
 */
async function toggleTodoComplete(id) {
	if (!Array.isArray(todos)) return;
	const todo = todos.find((t) => String(t.id) === String(id));
	if (todo) {
		todo.completed = !todo.completed;
		todo.completedAt = todo.completed ? new Date().toISOString() : null;

		// 완료 처리 시 캘린더에서 제거 (할일 목록으로 이동)
		if (todo.completed && todo.scheduledDate) {
			todo.scheduledDate = null;
		}

		if (currentUser) {
			await updateTodoInSupabase(todo);
		} else {
			saveTodos();
		}

		renderTodos();
		renderCalendar();
		renderDashboard();
	}
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 */
function formatDate(isoString) {
	if (!isoString) return '';
	const date = new Date(isoString);
	if (isNaN(date.getTime())) return '';

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * 데스크톱 드래그 시작 핸들러
 */
function handleTodoItemDragStart(e) {
	const todoId = e.currentTarget.dataset.id;
	if (!Array.isArray(todos)) return;
	const todo = todos.find((t) => String(t.id) === String(todoId));

	if (!todo || todo.completed) {
		e.preventDefault();
		return;
	}

	// 글로벌 변수 업데이트 (state.js 정의 필요)
	if (typeof draggedTodo !== 'undefined') draggedTodo = todo;
	if (typeof draggedTodoElement !== 'undefined') draggedTodoElement = e.currentTarget;

	e.currentTarget.classList.add('dragging');
	if (e.dataTransfer) {
		e.dataTransfer.effectAllowed = 'move';
	}
}

/**
 * 데스크톱 드래그 오버 핸들러
 */
function handleTodoItemDragOver(e) {
	e.preventDefault();
	if (e.dataTransfer) {
		e.dataTransfer.dropEffect = 'move';
	}

	const draggingElement = document.querySelector('.dragging');
	if (!draggingElement || !todoList) return;

	if (typeof getDragAfterElement === 'function') {
		const afterElement = getDragAfterElement(todoList, e.clientY);
		if (afterElement == null) {
			todoList.appendChild(draggingElement);
		} else {
			todoList.insertBefore(draggingElement, afterElement);
		}
	}
}

/**
 * 데스크톱 드롭 핸들러 (순서 변경)
 */
async function handleTodoItemDrop(e) {
	e.preventDefault();
	e.stopPropagation();

	if (!todoList || !Array.isArray(todos)) return;

	// 새로운 순서 저장
	const todoItems = Array.from(todoList.querySelectorAll('.todo-item'));
	const updatePromises = [];

	todoItems.forEach((item, index) => {
		const todoId = item.dataset.id;
		const todo = todos.find((t) => String(t.id) === String(todoId));
		if (todo) {
			todo.order = index;
			if (currentUser && typeof updateTodoInSupabase === 'function') {
				updatePromises.push(updateTodoInSupabase(todo));
			}
		}
	});

	if (currentUser && updatePromises.length > 0) {
		await Promise.all(updatePromises);
	} else {
		saveTodos();
	}

	if (typeof draggedTodo !== 'undefined') draggedTodo = null;
	if (typeof draggedTodoElement !== 'undefined') draggedTodoElement = null;
}
