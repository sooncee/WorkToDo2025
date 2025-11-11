// Supabase 설정
const SUPABASE_URL = "https://aewnnwhiruatlkvtnwtb.supabase.co"; // 여기에 프로젝트 URL 입력
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld25ud2hpcnVhdGxrdnRud3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjQ4MTgsImV4cCI6MjA3ODQ0MDgxOH0.LPnV7cdCMLqzy1B4hHM02Nv-LXSQyJla4V6x9iQaTIA"; // 여기에 anon key 입력

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 현재 사용자
let currentUser = null;

// 인증 상태 확인
async function initAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    currentUser = session.user;
    showApp();
    await loadTodosFromSupabase();
  } else {
    showAuth();
  }

  // 인증 상태 변경 감지
  supabase.auth.onAuthStateChange((_event, session) => {
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
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("order", { ascending: true });

  if (error) {
    console.error("할일 불러오기 실패:", error);
    return;
  }

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

  renderTodos();
  renderCalendar();
}

// Supabase에 할일 추가
async function addTodoToSupabase(todo) {
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
    console.error("할일 추가 실패:", error);
    return null;
  }

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
  document.getElementById("authSection").style.display = "flex";
  document.getElementById("appSection").style.display = "none";
}

function showApp() {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("appSection").style.display = "flex";
  document.getElementById("userEmail").textContent = currentUser?.email || "";
}
