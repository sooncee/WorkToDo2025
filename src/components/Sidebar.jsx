import React from 'react';
import { supabase } from '../lib/supabase';
import { useUIStore } from '../store/uiStore';

const Sidebar = () => {
	const { currentView, setCurrentView, isSidebarExpanded, toggleSidebar } = useUIStore();

	const menuItems = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<rect x="3" y="3" width="7" height="7"></rect>
					<rect x="14" y="3" width="7" height="7"></rect>
					<rect x="14" y="14" width="7" height="7"></rect>
					<rect x="3" y="14" width="7" height="7"></rect>
				</svg>
			),
		},
		{
			id: 'todos',
			label: 'Tasks',
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
					<polyline points="14 2 14 8 20 8"></polyline>
					<line x1="16" y1="13" x2="8" y2="13"></line>
					<line x1="16" y1="17" x2="8" y2="17"></line>
					<polyline points="10 9 9 9 8 9"></polyline>
				</svg>
			),
		},
		{
			id: 'routine',
			label: 'Routine',
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="12" cy="12" r="10"></circle>
					<polyline points="12 6 12 12 16 14"></polyline>
				</svg>
			),
		},
		{
			id: 'diet',
			label: 'Diet',
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
					<path d="M7 2v20"></path>
					<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
				</svg>
			),
		},
		{
			id: 'workout',
			label: 'Workout',
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M18 8h-3V6c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2Z"></path>
					<path d="M13 14h-2"></path>
				</svg>
			),
		},
		{
			id: 'roadmap',
			label: 'Roadmap',
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13 0-3-.54-.64-1.39-.75-3-.5z"></path>
					<path d="M11 15v-5"></path>
					<path d="M15 15V9"></path>
					<path d="M19 15V7"></path>
				</svg>
			),
		},
	];

	return (
		<nav className={`sidebar ${isSidebarExpanded ? 'expanded' : ''}`}>
			<div className="sidebar-header">
				<div className="profile-info">
					<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="profile-img" />
					<span className="user-name">Soon Cee</span>
				</div>
				<button id="sidebarToggle" className="sidebar-toggle-btn" onClick={toggleSidebar}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
						<polyline points={isSidebarExpanded ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}></polyline>
					</svg>
				</button>
			</div>

			<div className="sidebar-menu">
				{menuItems.map((item) => (
					<button
						key={item.id}
						className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
						onClick={() => setCurrentView(item.id)}
						title={item.label}
					>
						{item.icon}
						<span className="item-label">{item.label}</span>
					</button>
				))}
			</div>

			<div className="sidebar-bottom">
				<button className="sidebar-item" title="다크모드 토글">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
					</svg>
					<span className="item-label">Dark Mode</span>
				</button>
				<button
					className="sidebar-item"
					title="로그아웃"
					onClick={() => {
						if (window.confirm('로그아웃 하시겠습니까?')) supabase.auth.signOut();
					}}
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
						<polyline points="16 17 21 12 16 7"></polyline>
						<line x1="21" y1="12" x2="9" y2="12"></line>
					</svg>
					<span className="item-label">Logout</span>
				</button>
			</div>
		</nav>
	);
};

export default Sidebar;
