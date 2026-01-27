import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthSection = ({ onLoginSuccess }) => {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleAuth = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (isLogin) {
				const { data, error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
				onLoginSuccess(data.session);
			} else {
				const { data, error } = await supabase.auth.signUp({ email, password });
				if (error) throw error;
				if (data.session) {
					onLoginSuccess(data.session);
				} else {
					alert('회원가입 확인 메일을 확인해주세요!');
				}
			}
		} catch (error) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		await supabase.auth.signInWithOAuth({ provider: 'google' });
	};

	return (
		<section className="auth-section">
			<div className="auth-container">
				<div className="auth-tabs">
					<div className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
						로그인
					</div>
					<div className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
						회원가입
					</div>
				</div>

				<form className="auth-form" onSubmit={handleAuth}>
					<input
						type="email"
						placeholder="이메일 주소"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						type="password"
						placeholder="비밀번호"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<button type="submit" className="auth-btn" disabled={loading}>
						{loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
					</button>
				</form>

				<div className="auth-divider">
					<span>또는</span>
				</div>
				<button className="google-btn" onClick={handleGoogleLogin}>
					<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
					Google로 계속하기
				</button>
			</div>
		</section>
	);
};

export default AuthSection;
