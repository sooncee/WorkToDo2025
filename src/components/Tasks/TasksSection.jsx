import React from 'react';
import TodoList from './TodoList';
import Calendar from './Calendar';
import { useTodos } from '../../hooks/useTodos';

const TasksSection = () => {
	const { todos, addTodo, updateTodo, deleteTodo, isLoading } = useTodos();

	if (isLoading) return <div className="loading">데이터를 불러오는 중...</div>;

	return (
		<section className="tasks-group-section">
			<div className="section-header">
				<h1>할일 및 일정</h1>
				<p>스마트한 시간 관리와 목표 달성을 위한 통합 워크스페이스</p>
			</div>

			<div className="tasks-layout">
				<div className="section todo-section">
					<TodoList todos={todos} addTodo={addTodo} updateTodo={updateTodo} deleteTodo={deleteTodo} />
				</div>
				<div className="section calendar-section">
					<Calendar todos={todos} updateTodo={updateTodo} />
				</div>
			</div>
		</section>
	);
};

export default TasksSection;
