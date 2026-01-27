import React from 'react';
import { useTodos } from '../../hooks/useTodos';

const DashboardSection = () => {
	const { todos, isLoading } = useTodos();

	if (isLoading) return <div className="loading">통계를 계산 중...</div>;

	const activeCount = todos.filter((t) => !t.completed).length;
	const completedCount = todos.filter((t) => t.completed).length;
	const scheduledCount = todos.filter((t) => t.scheduledDate && !t.completed).length;
	const completionRate = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

	// Weekly Schedule (next 7 days)
	const today = new Date();
	const next7Days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(today);
		d.setDate(today.getDate() + i);
		return d.toISOString().split('T')[0];
	});

	const weeklyTodos = todos.filter((t) => t.scheduledDate && next7Days.includes(t.scheduledDate) && !t.completed);
	const recentCompleted = [...todos]
		.filter((t) => t.completed)
		.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
		.slice(0, 5);

	return (
		<section className="section dashboard-section">
			<div className="dashboard-header">
				<h1>대시보드</h1>
			</div>

			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-content">
						<div className="stat-label">진행중인 할일</div>
						<div className="stat-value">{activeCount}</div>
					</div>
					<div className="stat-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10"></circle>
							<polyline points="12 6 12 12 16 14"></polyline>
						</svg>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-content">
						<div className="stat-label">완료된 할일</div>
						<div className="stat-value">{completedCount}</div>
					</div>
					<div className="stat-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-content">
						<div className="stat-label">예정된 할일</div>
						<div className="stat-value">{scheduledCount}</div>
					</div>
					<div className="stat-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-content">
						<div className="stat-label">완료율</div>
						<div className="stat-value">{completionRate}%</div>
					</div>
					<div className="stat-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<line x1="12" y1="1" x2="12" y2="23"></line>
							<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
						</svg>
					</div>
				</div>
			</div>

			<div className="dashboard-content">
				<div className="dashboard-card">
					<h3>📅 이번 주 예정</h3>
					<div className="weekly-schedule">
						{weeklyTodos.length === 0 ? (
							<p className="empty-msg">예정된 일정이 없습니다.</p>
						) : (
							weeklyTodos.map((todo) => (
								<div key={todo.id} className="schedule-item">
									<span className="dot" style={{ backgroundColor: todo.color }}></span>
									<span className="time">{todo.scheduledDate}</span>
									<span className="title">{todo.title}</span>
								</div>
							))
						)}
					</div>
				</div>

				<div className="dashboard-card">
					<h3>🎯 최근 완료</h3>
					<div className="recent-list">
						{recentCompleted.length === 0 ? (
							<p className="empty-msg">최근 완료된 할일이 없습니다.</p>
						) : (
							recentCompleted.map((todo) => (
								<div key={todo.id} className="recent-item">
									<span className="title">{todo.title}</span>
									<span className="date">{todo.completedAt?.split('T')[0]}</span>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default DashboardSection;
