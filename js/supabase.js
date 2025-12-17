// Supabase 설정
const SUPABASE_URL = "https://aewnnwhiruatlkvtnwtb.supabase.co"; // 여기에 프로젝트 URL 입력
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld25ud2hpcnVhdGxrdnRud3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjQ4MTgsImV4cCI6MjA3ODQ0MDgxOH0.LPnV7cdCMLqzy1B4hHM02Nv-LXSQyJla4V6x9iQaTIA"; // 여기에 anon key 입력

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // 세션을 로컬 스토리지에 저장
    autoRefreshToken: true, // 토큰 자동 갱신
    detectSessionInUrl: true, // URL에서 세션 감지 (OAuth 콜백용)
    storage: window.localStorage, // 로컬 스토리지 사용
  },
});

// 현재 사용자
let currentUser = null;

// 인증 상태 확인
async function initAuth() {
  // 로딩 중 표시
  console.log("🔄 세션 확인 중...");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    console.log("✅ 로그인 상태:", session.user.email);
    currentUser = session.user;
    showApp();
    await loadTodosFromSupabase();
  } else {
    console.log("❌ 로그인 필요");
    showAuth();
  }

  // 인증 상태 변경 감지
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("🔔 인증 상태 변경:", event);

    if (session) {
      currentUser = session.user;
      showApp();
      loadTodosFromSupabase();
    } else {
      currentUser = null;
      showAuth();
    }
  });
}

// 로그인
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("로그인 실패: " + error.message);
    return false;
  }
  return true;
}

// 회원가입
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert("회원가입 실패: " + error.message);
    return false;
  }

  alert("회원가입 성공! 이메일을 확인해주세요.");
  return true;
}

// 로그아웃
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("로그아웃 실패: " + error.message);
  }
}

// Google 로그인
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) {
    alert("Google 로그인 실패: " + error.message);
  }
}

// Supabase에서 할일 불러오기
async function loadTodosFromSupabase() {
  console.log("📥 Supabase에서 할일 불러오는 중...");

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("order", { ascending: true });

  if (error) {
    console.error("❌ 할일 불러오기 실패:", error);
    return;
  }

  console.log("✅ 불러온 할일 개수:", data.length);
  console.log("📋 데이터:", data);

  // Supabase 데이터를 로컬 형식으로 변환
  todos = data.map((todo) => ({
    id: todo.id,
    title: todo.title,
    content: todo.content,
    color: todo.color,
    completed: todo.completed,
    scheduledDate: todo.scheduled_date,
    order: todo.order,
    createdAt: todo.created_at,
    completedAt: todo.completed_at,
  }));

  console.log("🔄 변환된 todos:", todos);

  renderTodos();
  renderCalendar();
  renderDashboard();
}

// Supabase에 할일 추가
async function addTodoToSupabase(todo) {
  console.log("➕ Supabase에 할일 추가 중:", todo);

  const { data, error } = await supabase
    .from("todos")
    .insert([
      {
        user_id: currentUser.id,
        title: todo.title,
        content: todo.content,
        color: todo.color,
        completed: todo.completed,
        scheduled_date: todo.scheduledDate,
        order: todo.order,
        created_at: todo.createdAt,
        completed_at: todo.completedAt,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ 할일 추가 실패:", error);
    return null;
  }

  console.log("✅ 할일 추가 성공, ID:", data.id);
  return data.id;
}

// Supabase에서 할일 수정
async function updateTodoInSupabase(todo) {
  const { error } = await supabase
    .from("todos")
    .update({
      title: todo.title,
      content: todo.content,
      color: todo.color,
      completed: todo.completed,
      scheduled_date: todo.scheduledDate,
      order: todo.order,
      completed_at: todo.completedAt,
    })
    .eq("id", todo.id)
    .eq("user_id", currentUser.id);

  if (error) {
    console.error("할일 수정 실패:", error);
    return false;
  }
  return true;
}

// Supabase에서 할일 삭제
async function deleteTodoFromSupabase(id) {
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) {
    console.error("할일 삭제 실패:", error);
    return false;
  }
  return true;
}

// UI 표시/숨김
function showAuth() {
  var authSection = document.getElementById("authSection");
  var appSection = document.getElementById("appSection");
  if (authSection) authSection.style.display = "flex";
  if (appSection) appSection.style.display = "none";
}

function showApp() {
  var authSection = document.getElementById("authSection");
  var appSection = document.getElementById("appSection");
  if (authSection) authSection.style.display = "none";
  if (appSection) appSection.style.display = "flex";
  var userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) {
    userEmailEl.textContent = currentUser?.email || "";
  }
}
