import React, { useState, useEffect } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { useModalStore } from '../../store/modalStore';

const TodoList = ({ todos, addTodo, updateTodo, deleteTodo }) => {
	const [activeTab, setActiveTab] = useState('active');
	const [items, setItems] = useState([]);
	const { openTaskModal } = useModalStore();

	useEffect(() => {
		const filtered = todos
			.filter((t) => {
				const isInList = !t.scheduledDate;
				return activeTab === 'active' ? !t.completed && isInList : t.completed && isInList;
			})
			.sort((a, b) => (a.order || 0) - (b.order || 0));
		setItems(filtered);
	}, [todos, activeTab]);

	const handleOpenModal = (todo = null) => {
		openTaskModal(todo, (formData) => {
			if (todo) {
				updateTodo({ ...todo, ...formData });
			} else {
				addTodo({ ...formData, completed: false, order: todos.length });
			}
		});
	};

	const handleReorder = (newItems) => {
		setItems(newItems);
		// 순서 변경 시 즉시 저장 (Debounce 없이 처리)
		newItems.forEach((item, index) => {
			if (item.order !== index) {
				updateTodo({ ...item, order: index });
			}
		});
	};

	return (
		<div className="todo-panel">
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

			<div className="todo-list">
				{items.length === 0 ? (
					<div className="empty-message">{activeTab === 'active' ? '할일이 없습니다' : '완료된 할일이 없습니다'}</div>
				) : (
					<Reorder.Group axis="y" values={items} onReorder={handleReorder} className="reorder-group">
						<AnimatePresence mode="popLayout">
							{items.map((todo) => (
								<Reorder.Item
									key={todo.id}
									value={todo}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ type: 'spring', stiffness: 500, damping: 40 }}
									className={`todo-item ${todo.completed ? 'completed' : ''}`}
									style={{ borderLeftColor: todo.color }}
									onDragStart={(e) => {
										// 캘린더 드롭을 위한 네이티브 드래그 데이터 주입
										// Reorder.Item은 네이티브 드래그를 차단할 수 있으므로
										// 드래그 시작 시 데이터를 강제로 넣어줍니다.
										if (e.dataTransfer) {
											e.dataTransfer.setData('todoId', todo.id.toString());
											e.dataTransfer.effectAllowed = 'move';
										}
									}}
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
								</Reorder.Item>
							))}
						</AnimatePresence>
					</Reorder.Group>
				)}
			</div>
		</div>
	);
};

export default TodoList;
