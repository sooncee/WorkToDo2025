import React, { useState, useEffect, useMemo } from 'react';
import { useModalStore } from '../../store/modalStore';
import { useDragStore } from '../../store/dragStore';

const TodoList = ({ todos, addTodo, updateTodo, deleteTodo }) => {
	const [activeTab, setActiveTab] = useState('active');
	const { openTaskModal } = useModalStore();
	const { draggingTodoId, setDraggingTodoId } = useDragStore();

	// 로컬 순서를 관리하기 위한 내부 상태
	const [localItems, setLocalItems] = useState([]);

	// 초기 정렬 및 탭 변경 시 데이터 로드
	const sortedTodos = useMemo(() => {
		return todos
			.filter((t) => {
				const isInList = !t.scheduledDate;
				return activeTab === 'active' ? !t.completed && isInList : t.completed && isInList;
			})
			.sort((a, b) => (a.order || 0) - (b.order || 0));
	}, [todos, activeTab]);

	// 원본 데이터가 변경되면 로컬 상태 동기화
	useEffect(() => {
		setLocalItems(sortedTodos);
	}, [sortedTodos]);

	const handleOpenModal = (todo = null) => {
		openTaskModal(todo, (formData) => {
			if (todo) {
				updateTodo({ ...todo, ...formData });
			} else {
				addTodo({ ...formData, completed: false, order: todos.length });
			}
		});
	};

	// 드래그 시작
	const onDragStart = (e, id) => {
		setDraggingTodoId(id);
		e.dataTransfer.setData('todoId', id.toString());
		e.dataTransfer.effectAllowed = 'move';
		e.currentTarget.classList.add('dragging');
	};

	// 리스트 내에서 이동 시 화면상에서 위치를 즉시 바꿔주는 핵심 로직
	const onDragOverItem = (e, id) => {
		e.preventDefault();
		if (!draggingTodoId || draggingTodoId === id) return;

		const draggingIdx = localItems.findIndex((i) => i.id === draggingTodoId);
		const targetIdx = localItems.findIndex((i) => i.id === id);

		if (draggingIdx !== -1 && targetIdx !== -1) {
			const newItems = [...localItems];
			const [removed] = newItems.splice(draggingIdx, 1);
			newItems.splice(targetIdx, 0, removed);
			setLocalItems(newItems); // 화면상에 즉시 반영
		}
	};

	// 드래그가 끝났을 때 DB에 바뀐 순서 저장
	const onDragEnd = (e) => {
		e.currentTarget.classList.remove('dragging');

		// 만약 draggingTodoId가 null이라면 (캘린더에 드롭되어 이미 처리됨), 순서 저장 로직을 건너뜁니다.
		if (draggingTodoId) {
			localItems.forEach((item, index) => {
				if (item.order !== index) {
					updateTodo({ ...item, order: index });
				}
			});
			setDraggingTodoId(null);
		}
	};

	// 캘린더에서 넘어온 아이템 처리
	const onPanelDrop = (e) => {
		e.preventDefault();
		const todoId = e.dataTransfer.getData('todoId') || draggingTodoId;
		const todo = todos.find((t) => t.id.toString() === todoId?.toString());

		if (todo && todo.scheduledDate) {
			// 리스트로 돌아온 아이템은 일정을 null로 초기화
			updateTodo({ ...todo, scheduledDate: null });
		}
		setDraggingTodoId(null);
	};

	return (
		<div className="todo-panel" onDragOver={(e) => e.preventDefault()} onDrop={onPanelDrop}>
			<h2>할일 목록</h2>
			<div className="sticky-tab">
				<div className="tabs">
					<button
						className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
						onClick={() => setActiveTab('active')}
					>
						진행중
					</button>
					<button
						className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
						onClick={() => setActiveTab('completed')}
					>
						완료
					</button>
				</div>
				<button className="add-todo-btn" onClick={() => handleOpenModal()}>
					+ 새 할일 추가
				</button>
			</div>

			<div className="todo-list" onDragOver={(e) => e.preventDefault()}>
				{localItems.length === 0 ? (
					<div className="empty-message">{activeTab === 'active' ? '할일이 없습니다' : '완료된 할일이 없습니다'}</div>
				) : (
					<div className="reorder-group">
						{localItems.map((todo) => (
							<div
								key={todo.id}
								className={`todo-item ${todo.completed ? 'completed' : ''} ${draggingTodoId === todo.id ? 'dragging-node' : ''}`}
								style={{ borderLeftColor: todo.color }}
								draggable={!todo.completed}
								onDragStart={(e) => onDragStart(e, todo.id)}
								onDragEnd={onDragEnd}
								onDragOver={(e) => onDragOverItem(e, todo.id)}
							>
								<div className="todo-content" onClick={() => handleOpenModal(todo)}>
									<span className="todo-text">{todo.title}</span>
									<div className="todo-date">
										{todo.completed
											? `완료: ${todo.completedAt?.split('T')[0] || '날짜 없음'}`
											: `생성: ${todo.createdAt?.split('T')[0] || '날짜 없음'}`}
									</div>
								</div>
								<div className="todo-actions">
									<button
										className={todo.completed ? 'uncomplete-btn' : 'complete-btn'}
										onClick={(e) => {
											e.stopPropagation();
											updateTodo({
												...todo,
												completed: !todo.completed,
												completedAt: !todo.completed ? new Date().toISOString() : null,
											});
										}}
									>
										{todo.completed ? '복원' : '완료'}
									</button>
									<button
										className="delete-btn"
										onClick={(e) => {
											e.stopPropagation();
											deleteTodo(todo.id);
										}}
									>
										삭제
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default TodoList;
