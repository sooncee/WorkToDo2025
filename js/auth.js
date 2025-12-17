// 인증 관련 이벤트 핸들러

// 페이지 로드 시 인증 초기화
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("loginBtn")) return; // 로그인 UI 없는 페이지에선 아무것도 하지 않음
  initAuth();

  // 탭 전환
  const authTabs = document.querySelectorAll(".auth-tab");
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const tabName = tab.dataset.tab;
      if (tabName === "login") {
        document.getElementById("loginForm").style.display = "flex";
        document.getElementById("signupForm").style.display = "none";
      } else {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("signupForm").style.display = "flex";
      }
    });
  });

  // 로그인
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const ok = await signIn(email, password);
    if (ok) {
      window.location.href = "index.html";
    }
  });

  // 회원가입
  document.getElementById("signupBtn").addEventListener("click", async () => {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const passwordConfirm = document.getElementById(
      "signupPasswordConfirm"
    ).value;

    if (!email || !password || !passwordConfirm) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    const ok = await signUp(email, password);
    if (ok) {
      // 회원가입 후 index로 이동 (또는 안내만 할 수도 있음)
      window.location.href = "index.html";
    }
  });

  // Google 로그인
  document
    .getElementById("googleLoginBtn")
    .addEventListener("click", async () => {
      await signInWithGoogle();
    });

  // 로그아웃(만약 로그인 UI에 있으면)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (confirm("로그아웃 하시겠습니까?")) {
        await signOut();
      }
    });
  }

  // Enter 키로 로그인
  document.getElementById("loginPassword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("loginBtn").click();
    }
  });

  document
    .getElementById("signupPasswordConfirm")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("signupBtn").click();
      }
    });
});
