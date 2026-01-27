import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.scss';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5분 동안은 신선하다고 판단 (서버 요청 안함)
			refetchOnWindowFocus: false, // 창 클릭 시 자동 새로고침 방지 (데이터 절약)
		},
	},
});

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>,
);
