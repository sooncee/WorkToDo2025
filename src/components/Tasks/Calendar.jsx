import React, { useState } from 'react';
import { useModalStore } from '../../store/modalStore';
import { useDragStore } from '../../store/dragStore';

const Calendar = ({ todos, updateTodo }) => {
	const [view, setView] = useState('calendar'); // 'calendar' or 'list'
	const [currentDate, setCurrentDate] = useState(new Date());
	const { openTaskModal } = useModalStore();
	const { draggingTodoId, setDraggingTodoId } = useDragStore();

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
	const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

	// YYYY-MM-DD 형식으로 변환 (DB 호환성 확보)
	const formatDateKey = (y, m, d) => {
		const mm = String(m).padStart(2, '0');
		const dd = String(d).padStart(2, '0');
		return `${y}-${mm}-${dd}`;
	};

	const onDrop = (e, dateKey) => {
		e.preventDefault();
		e.currentTarget.classList.remove('drag-over');
		const todoId = e.dataTransfer.getData('todoId') || draggingTodoId;
		const todo = todos.find((t) => t.id.toString() === todoId?.toString());
		if (todo) {
			updateTodo({ ...todo, scheduledDate: dateKey });
		}
		setDraggingTodoId(null);
	};

	const onDragOver = (e) => {
		e.preventDefault();
		if (!e.currentTarget.classList.contains('drag-over')) {
			e.currentTarget.classList.add('drag-over');
		}
	};

	const onDragLeave = (e) => {
		e.currentTarget.classList.remove('drag-over');
	};

	const scheduledTodos = todos.filter((t) => t.scheduledDate && !t.completed);
	const firstDay = new Date(year, month, 1).getDay();
	const lastDate = new Date(year, month + 1, 0).getDate();
	const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

	const renderCalendarView = () => {
		const cells = [];
		for (let i = 0; i < firstDay; i++) {
			cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
		}
		for (let d = 1; d <= lastDate; d++) {
			const dateKey = formatDateKey(year, month + 1, d);
			const dayTodos = scheduledTodos.filter((t) => t.scheduledDate === dateKey);
			const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

			cells.push(
				<div
					key={d}
					className={`calendar-day ${isToday ? 'today' : ''}`}
					data-date={dateKey}
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={(e) => onDrop(e, dateKey)}
				>
					<div className="day-number">{d}</div>
					<div className="calendar-todos">
						{dayTodos.map((todo) => (
							<div
								key={todo.id}
								className="calendar-todo"
								style={{ backgroundColor: todo.color }}
								draggable
								onDragStart={(e) => {
									setDraggingTodoId(todo.id);
									e.dataTransfer.setData('todoId', todo.id.toString());
									e.dataTransfer.effectAllowed = 'move';
								}}
								onDragEnd={() => setDraggingTodoId(null)}
								onClick={() => openTaskModal(todo, (data) => updateTodo({ ...todo, ...data }))}
							>
								<span className="calendar-todo-title">{todo.title}</span>
								<button
									className="delete-btn"
									onClick={(e) => {
										e.stopPropagation();
										updateTodo({ ...todo, scheduledDate: null });
									}}
								>
									×
								</button>
							</div>
						))}
					</div>
				</div>,
			);
		}
		return (
			<div className="calendar">
				{dayNames.map((name) => (
					<div key={name} className="day-header">
						{name}
					</div>
				))}
				{cells}
			</div>
		);
	};

	const renderListView = () => {
		const grouped = scheduledTodos.reduce((acc, t) => {
			if (!acc[t.scheduledDate]) acc[t.scheduledDate] = [];
			acc[t.scheduledDate].push(t);
			return acc;
		}, {});

		const sortedDates = Object.keys(grouped).sort();

		return (
			<div className="calendar list-view">
				{sortedDates.length === 0 ? (
					<div className="empty-message">이번 달에 예정된 할일이 없습니다</div>
				) : (
					sortedDates.map((date) => {
						const [y, m, d] = date.split('-').map(Number);
						const dateObj = new Date(y, m - 1, d);
						return (
							<div
								key={date}
								className="list-date-section"
								onDragOver={onDragOver}
								onDragLeave={onDragLeave}
								onDrop={(e) => onDrop(e, date)}
							>
								<div className="list-date-header">
									<span className="list-date-day">{d}</span>
									<span className="list-date-info">
										{m}월 {d}일 ({dayNames[dateObj.getDay()]})
									</span>
								</div>
								<div className="list-todos-container">
									{grouped[date].map((todo) => (
										<div
											key={todo.id}
											className="list-todo-item"
											style={{ borderLeftColor: todo.color }}
											draggable
											onDragStart={(e) => {
												setDraggingTodoId(todo.id);
												e.dataTransfer.setData('todoId', todo.id.toString());
												e.dataTransfer.effectAllowed = 'move';
											}}
											onDragEnd={() => setDraggingTodoId(null)}
											onClick={() => openTaskModal(todo, (data) => updateTodo({ ...todo, ...data }))}
										>
											<div className="list-todo-content">
												<span className="list-todo-title">{todo.title}</span>
												{todo.content && <span className="list-todo-desc">{todo.content}</span>}
											</div>
											<button
												className="delete-btn"
												onClick={(e) => {
													e.stopPropagation();
													updateTodo({ ...todo, scheduledDate: null });
												}}
											>
												×
											</button>
										</div>
									))}
								</div>
							</div>
						);
					})
				)}
			</div>
		);
	};

	return (
		<div className="calendar-panel">
			<div className="calendar-controls">
				<div className="calendar-header">
					<button onClick={handlePrev}>&lt;</button>
					<h3>
						{year}년 {month + 1}월
					</h3>
					<button onClick={handleNext}>&gt;</button>
				</div>
				<div className="view-switcher">
					<button className={`view-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
						캘린더
					</button>
					<button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
						리스트
					</button>
				</div>
			</div>
			{view === 'calendar' ? renderCalendarView() : renderListView()}
		</div>
	);
};

export default Calendar;
