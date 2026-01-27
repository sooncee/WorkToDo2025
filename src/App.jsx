import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RoutineSection from './components/Routine/RoutineSection';
import TasksSection from './components/Tasks/TasksSection';
import DashboardSection from './components/Dashboard/DashboardSection';
import AuthSection from './components/Auth/AuthSection';
import bgImage from './assets/images/bg3.png';
import { supabase } from './lib/supabase';
import { useUIStore } from './store/uiStore';
import GlobalModal from './components/Common/GlobalModal';

// Placeholders (keep as is)
const Diet = () => (
	<section className="section">
		<h1>식단 플래너</h1>
		<p>서비스 준비 중...</p>
	</section>
);
const Workout = () => (
	<section className="section">
		<h1>운동 플래너</h1>
		<p>서비스 준비 중...</p>
	</section>
);
const Roadmap = () => (
	<section className="section">
		<h1>로드맵</h1>
		<p>서비스 준비 중...</p>
	</section>
);

function App() {
	const { currentView } = useUIStore();
	const [session, setSession] = useState(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
		return () => subscription.unsubscribe();
	}, []);

	const renderView = () => {
		switch (currentView) {
			case 'dashboard':
				return <DashboardSection />;
			case 'routine':
				return <RoutineSection />;
			case 'todos':
				return <TasksSection />;
			case 'diet':
				return <Diet />;
			case 'workout':
				return <Workout />;
			case 'roadmap':
				return <Roadmap />;
			default:
				return <DashboardSection />;
		}
	};

	return (
		<div className="app-container">
			<div className="animated-bg">
				<img src={bgImage} alt="" />
			</div>
			{!session ? (
				<AuthSection onLoginSuccess={(s) => setSession(s)} />
			) : (
				<div id="appSection" className="app-section" style={{ display: 'flex' }}>
					<Sidebar />
					<main className="container">{renderView()}</main>
				</div>
			)}
			<GlobalModal />
		</div>
	);
}

export default App;
