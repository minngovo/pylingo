/* 파이스텝 앱 로직: 초기 설정, 홈(챕터 지도), 레슨, 결과, 오답노트, 스트릭 */
(function () {
  "use strict";

  const STORE_KEY = "pystep-v1";
  const XP_PER_CORRECT = 10;
  const COLAB_URL = "https://colab.research.google.com/#create=true";
  const app = document.getElementById("app");

  /* ---------- 저장소 ---------- */
  function defaultState() {
    return {
      onboarded: false,
      name: "",
      dailyGoal: 1,
      xp: 0,
      streak: 0,
      bestStreak: 0,
      lastGoalDate: null,
      today: { date: todayStr(), count: 0 },
      completed: {},   // { "1-1": { stars, date } }
      wrong: []        // [{ key, lessonId, step, date }]
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { /* 저장소를 못 쓰면 새로 시작 */ }
    return defaultState();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* 무시 */ }
  }

  /* ---------- 날짜 ---------- */
  function dateStr(d) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function todayStr() { return dateStr(new Date()); }
  function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); }

  function refreshDay() {
    const t = todayStr();
    if (state.today.date !== t) state.today = { date: t, count: 0 };
    // 어제도 오늘도 목표를 못 채웠으면 스트릭이 끊겨요
    if (state.lastGoalDate !== t && state.lastGoalDate !== yesterdayStr()) state.streak = 0;
    save();
  }

  let state = load();
  refreshDay();

  /* ---------- 도우미 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // `코드`와 **굵게** 를 HTML로 바꿔요
  function rich(s) {
    const parts = String(s).split(/(`[^`]*`)/g);
    return parts.map(p => {
      if (p.length > 1 && p.startsWith("`") && p.endsWith("`")) return "<code>" + esc(p.slice(1, -1)) + "</code>";
      return esc(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }).join("");
  }
  const KW = /^(if|elif|else|for|while|in|def|return|break|continue|and|or|not|True|False|None|import|from|as|pass)$/;
  const BI = /^(print|input|int|float|str|bool|type|len|range|list|tuple)$/;
  function highlight(code) {
    const re = /(#[^\n]*)|("[^"\n]*"?|'[^'\n]*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="t-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="t-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="t-num">' + esc(m[3]) + "</span>";
      else if (KW.test(m[4])) out += '<span class="t-kw">' + esc(m[4]) + "</span>";
      else if (BI.test(m[4])) out += '<span class="t-fn">' + esc(m[4]) + "</span>";
      else out += esc(m[4]);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  function codeBlock(code) { return '<pre class="code"><code>' + highlight(code) + "</code></pre>"; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function findLesson(id) {
    for (const ch of CHAPTERS) for (const ls of ch.lessons) if (ls.id === id) return { chapter: ch, lesson: ls };
    return null;
  }
  function allLessons() { return CHAPTERS.flatMap(ch => ch.lessons.map(ls => ({ chapter: ch, lesson: ls }))); }
  function isUnlocked(id) {
    const list = allLessons();
    const i = list.findIndex(x => x.lesson.id === id);
    return i === 0 || (i > 0 && !!state.completed[list[i - 1].lesson.id]);
  }
  function normalize(s) { return String(s).trim().replace(/\s+/g, " "); }

  const MASCOT = '<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true">' +
    '<path d="M22 92c0-18 16-24 34-24s30-6 30-20" fill="none" stroke="#2fb673" stroke-width="18" stroke-linecap="round"/>' +
    '<circle cx="84" cy="40" r="24" fill="#2fb673"/>' +
    '<circle cx="76" cy="36" r="7" fill="#fff"/><circle cx="94" cy="36" r="7" fill="#fff"/>' +
    '<circle cx="77" cy="37" r="3.5" fill="#1f2937"/><circle cx="95" cy="37" r="3.5" fill="#1f2937"/>' +
    '<path d="M78 50q7 6 14 0" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="22" cy="92" r="9" fill="#ffc83d"/></svg>';

  const ICON = {
    fire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5S9 11 11 11c0-4 1-9 1-9z" fill="currentColor"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4-2.1-.7.5-2.2-1.9-1.9-2.2.5L14.6 5h-2.8l-.7 2.1-2.2-.5-1.9 1.9.5 2.2L5 12v2.8l2.1.7-.5 2.2 1.9 1.9 2.2-.5.7 2.1h2.8l.7-2.1 2.2.5 1.9-1.9-.5-2.2L21 14.8z" fill="currentColor" opacity=".9"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2h1v11H6V10zm2 0h6V8a3 3 0 0 0-6 0z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zm16 0h-4a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h4z" fill="currentColor"/></svg>'
  };

  /* ---------- 초기 설정 ---------- */
  let ob = { step: 0, name: "", goal: 1 };
  function renderOnboarding() {
    const dots = [0, 1, 2, 3].map(i => '<span class="dot' + (i === ob.step ? " on" : "") + '"></span>').join("");
    let body = "", footer = "";
    if (ob.step === 0) {
      body = '<div class="ob-hero">' + MASCOT +
        '<h1>파이스텝</h1><p class="lead">하루 5분, 게임처럼 파이썬을 배워 봐요!</p>' +
        '<p class="muted">파이썬을 처음 배우는 고등학생을 위한 학습 사이트예요.</p></div>';
      footer = '<button class="btn primary block" data-act="next">시작하기</button>';
    } else if (ob.step === 1) {
      body = '<h2>뭐라고 불러 드릴까요?</h2>' +
        '<p class="muted">실명 대신 닉네임을 써 주세요. 이 정보는 이 브라우저에만 저장돼요.</p>' +
        '<input id="ob-name" class="input" maxlength="10" placeholder="닉네임 (최대 10자)" value="' + esc(ob.name) + '" autocomplete="off">';
      footer = '<button class="btn primary block" data-act="next" id="ob-name-next"' + (ob.name.trim() ? "" : " disabled") + '>다음</button>';
    } else if (ob.step === 2) {
      const goals = [[1, "가볍게", "하루 레슨 1개"], [2, "꾸준히", "하루 레슨 2개"], [3, "열심히", "하루 레슨 3개"]];
      body = '<h2>하루 목표를 골라 주세요</h2>' +
        '<p class="muted">목표를 채운 날마다 스트릭이 1일씩 늘어나요.</p>' +
        '<div class="choices">' + goals.map(g =>
          '<button class="choice' + (ob.goal === g[0] ? " selected" : "") + '" data-act="goal" data-v="' + g[0] + '">' +
          '<strong>' + g[1] + '</strong><span>' + g[2] + '</span></button>').join("") + '</div>';
      footer = '<button class="btn primary block" data-act="next">다음</button>';
    } else {
      body = '<h2>실습 준비: 구글 코랩 열기</h2>' +
        '<p class="muted">코랩은 설치 없이 브라우저에서 파이썬을 실행하는 무료 도구예요. 구글 계정이 필요해요.</p>' +
        '<ol class="steps-list"><li>아래 버튼으로 코랩 열기</li><li>구글 계정으로 로그인</li><li>코드 칸에 코드를 붙여 넣기</li><li>왼쪽 재생(▶) 버튼 누르기</li></ol>' +
        '<p>바로 해 보기:</p>' + codeBlock('print("안녕, 파이썬!")') +
        '<button class="btn ghost block" data-act="colab" data-code=\'print("안녕, 파이썬!")\'>코드 복사하고 코랩 열기</button>' +
        '<p class="muted small">코랩 없이도 레슨은 모두 풀 수 있어요.</p>';
      footer = '<button class="btn primary block" data-act="finish">학습 시작하기</button>' +
        '<button class="btn text block" data-act="finish">지금은 건너뛰기</button>';
    }
    app.innerHTML = '<div class="screen onboarding">' +
      '<div class="ob-top">' + (ob.step > 0 ? '<button class="icon-btn" data-act="back" aria-label="이전">‹</button>' : '<span></span>') +
      '<div class="dots">' + dots + '</div><span></span></div>' +
      '<div class="ob-body">' + body + '</div><div class="footer">' + footer + '</div></div>';
    const input = document.getElementById("ob-name");
    if (input) {
      input.focus();
      input.addEventListener("input", () => {
        ob.name = input.value;
        document.getElementById("ob-name-next").disabled = !ob.name.trim();
      });
      input.addEventListener("keydown", e => { if (e.key === "Enter" && ob.name.trim()) { ob.step++; renderOnboarding(); } });
    }
  }

  /* ---------- 홈 ---------- */
  function goalDoneToday() { return state.today.count >= state.dailyGoal; }
  function renderHome() {
    refreshDay();
    const lessons = allLessons();
    const nextId = (lessons.find(x => !state.completed[x.lesson.id]) || {}).lesson;
    const progress = Math.min(state.today.count / state.dailyGoal, 1);
    let html = '<div class="screen home">' +
      '<header class="topbar">' +
      '<span class="brand">파이스텝</span>' +
      '<span class="stat fire' + (state.lastGoalDate === todayStr() ? " lit" : "") + '" title="연속 학습일">' + ICON.fire + state.streak + '</span>' +
      '<span class="stat xp" title="경험치">' + ICON.bolt + state.xp + '</span>' +
      '<button class="icon-btn" data-act="settings" aria-label="설정">' + ICON.gear + '</button>' +
      '</header><main class="home-main">';

    html += '<section class="greet card">' +
      '<div><p class="hello">' + esc(state.name) + '님, ' + (goalDoneToday() ? "오늘 목표 달성! 대단해요." : "오늘도 한 걸음 가 볼까요?") + '</p>' +
      '<div class="goalbar"><div style="width:' + Math.round(progress * 100) + '%"></div></div>' +
      '<p class="muted small">오늘 목표 ' + Math.min(state.today.count, state.dailyGoal) + ' / ' + state.dailyGoal + ' 레슨</p></div>' +
      MASCOT + '</section>';

    if (state.wrong.length) {
      const old = state.wrong.filter(w => w.date !== todayStr()).length;
      html += '<button class="card review-card" data-act="review">' + ICON.book +
        '<div><strong>오답노트 복습</strong><span>' + (old ? "어제까지 틀린 문제 " + old + "개를 다시 풀어 봐요" : "틀린 문제 " + state.wrong.length + "개가 저장되어 있어요") + '</span></div>' +
        '<span class="badge">' + state.wrong.length + '</span></button>';
    }

    CHAPTERS.forEach(ch => {
      html += '<section class="chapter c-' + ch.color + '">' +
        '<div class="chapter-head"><span class="ch-num">' + ch.id + '챕터</span><h2>' + esc(ch.title) + '</h2><p>' + esc(ch.desc) + '</p></div>';
      if (!ch.lessons.length) {
        html += '<div class="path"><div class="node-wrap"><button class="node locked" disabled>' + ICON.lock + '</button><span class="node-label">준비 중</span></div></div>';
      } else {
        html += '<div class="path">';
        ch.lessons.forEach((ls, i) => {
          const done = !!state.completed[ls.id];
          const open = isUnlocked(ls.id);
          const isNext = nextId && nextId.id === ls.id;
          const cls = done ? "done" : open ? "open" : "locked";
          const offset = [0, 1, 0, -1][i % 4];
          html += '<div class="node-wrap" style="--x:' + offset + '">' +
            (isNext ? '<span class="start-tip">시작</span>' : "") +
            '<button class="node ' + cls + (isNext ? " next" : "") + '" data-act="lesson" data-id="' + ls.id + '"' + (open ? "" : " disabled") + ' aria-label="' + esc(ls.title) + '">' +
            (done ? ICON.check : open ? ICON.star : ICON.lock) + '</button>' +
            '<span class="node-label">' + ls.id + ' ' + esc(ls.title) + '</span></div>';
        });
        html += '</div>';
      }
      html += '</section>';
    });
    html += '<p class="muted small center foot">컴퓨터에 파이썬을 설치하고 싶다면 <a href="#" data-act="install">설치 안내</a>를 확인하세요.</p>';
    html += '</main></div>';
    app.innerHTML = html;
    const nextBtn = app.querySelector(".node.next");
    if (nextBtn) nextBtn.scrollIntoView({ block: "center" });
  }

  /* ---------- 레슨 진행 ---------- */
  let run = null;
  function startLesson(id) {
    const found = findLesson(id);
    if (!found || !isUnlocked(id)) return;
    run = { mode: "lesson", lessonId: id, title: found.lesson.title, steps: found.lesson.steps.map((s, i) => ({ s, lessonId: id, idx: i })), i: 0, correct: 0, total: 0, xp: 0, ui: null };
    renderStep();
  }
  function startReview() {
    const items = state.wrong.map(w => { const f = findLesson(w.lessonId); return f ? { s: f.lesson.steps[w.step], lessonId: w.lessonId, idx: w.step } : null; })
      .filter(x => x && x.s && x.s.type === "quiz");
    if (!items.length) return;
    run = { mode: "review", title: "오답노트 복습", steps: items, i: 0, correct: 0, total: 0, xp: 0, ui: null };
    renderStep();
  }

  function stageLabel(stage) {
    return { recall: "지난 내용 떠올리기", check: "개념 확인 문제", apply: "응용 문제" }[stage] || "문제";
  }

  function renderStep() {
    const item = run.steps[run.i];
    const s = item.s;
    const pct = Math.round((run.i / run.steps.length) * 100);
    run.ui = { selected: null, order: [], pool: null, checked: false };
    let body = "", footer = '<button class="btn primary block" data-act="continue">계속</button>';

    if (s.type === "intro") {
      body = '<div class="intro">' + MASCOT + '<div class="bubble">' + rich(s.hook) + '</div></div>' +
        '<div class="card goal-card"><span class="tag">학습 목표</span><p>이번 레슨에서는 ' + rich(s.goal) + '</p></div>';
    } else if (s.type === "concept") {
      body = '<span class="tag">개념 설명</span><h2>' + esc(run.title) + '</h2><ul class="points">' +
        s.points.map(p => '<li>' + rich(p) + '</li>').join("") + '</ul>';
    } else if (s.type === "example") {
      body = '<span class="tag">예제</span><p class="lead">' + rich(s.text) + '</p>' + codeBlock(s.code) +
        (s.output ? '<div class="output' + (s.error ? " error" : "") + '"><span>실행 결과</span><pre>' + esc(s.output) + '</pre></div>' : "") +
        '<button class="btn ghost small-btn" data-act="colab" data-code="' + esc(s.code) + '">코랩에서 직접 해 보기</button>';
    } else if (s.type === "summary") {
      body = '<div class="intro">' + MASCOT + '<div class="bubble"><span class="tag">오늘의 요약</span><p>' + rich(s.text) + '</p></div></div>';
      footer = '<button class="btn primary block" data-act="continue">레슨 완료</button>';
    } else if (s.type === "quiz") {
      body = renderQuiz(s);
      footer = '<button class="btn primary block" data-act="check" id="check-btn" disabled>확인</button>';
    }

    app.innerHTML = '<div class="screen lesson">' +
      '<div class="lesson-top"><button class="icon-btn" data-act="quit" aria-label="그만하기">' + ICON.close + '</button>' +
      '<div class="progress"><div style="width:' + pct + '%"></div></div>' +
      (run.mode === "review" ? '<span class="mode-pill">복습</span>' : "") + '</div>' +
      '<div class="lesson-body">' + body + '</div>' +
      '<div class="footer" id="footer">' + footer + '</div></div>';

    if (s.type === "quiz") bindQuiz(s);
  }

  function renderQuiz(s) {
    let h = '<span class="tag">' + (run.mode === "review" ? "다시 풀기" : stageLabel(s.stage)) + '</span>' +
      '<h2 class="question">' + rich(s.question) + '</h2>' + (s.code ? codeBlock(s.code) : "");
    if (s.kind === "ox") {
      h += '<div class="ox"><button class="ox-btn" data-pick="true"><span class="o">O</span>맞아요</button>' +
        '<button class="ox-btn" data-pick="false"><span class="x">X</span>아니에요</button></div>';
    } else if (s.kind === "mc") {
      h += '<div class="options">' + s.options.map((o, i) =>
        '<button class="option" data-pick="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + rich(o) + '</span></button>').join("") + '</div>';
    } else if (s.kind === "short") {
      h += '<input id="short-input" class="input mono" placeholder="답을 입력하세요" autocomplete="off" autocapitalize="off" spellcheck="false">';
    } else if (s.kind === "order") {
      h += '<p class="muted small">코드 조각을 눌러 순서대로 놓아 보세요. 다시 누르면 빠져요.</p>' +
        '<div class="order-answer" id="order-answer"></div><div class="order-pool" id="order-pool"></div>';
    }
    return h;
  }

  function bindQuiz(s) {
    const btn = document.getElementById("check-btn");
    const ui = run.ui;
    if (s.kind === "ox" || s.kind === "mc") {
      app.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => {
        if (ui.checked) return;
        app.querySelectorAll("[data-pick]").forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        ui.selected = b.dataset.pick;
        btn.disabled = false;
      }));
    } else if (s.kind === "short") {
      const input = document.getElementById("short-input");
      input.focus();
      input.addEventListener("input", () => { ui.selected = input.value; btn.disabled = !input.value.trim(); });
      input.addEventListener("keydown", e => { if (e.key === "Enter" && input.value.trim() && !ui.checked) checkAnswer(); });
    } else if (s.kind === "order") {
      let pool = shuffle(s.items.map((t, i) => i));
      if (pool.every((v, i) => v === i) && pool.length > 1) pool = pool.reverse();
      ui.pool = pool;
      drawOrder(s);
    }
  }
  function drawOrder(s) {
    const ui = run.ui;
    const ans = document.getElementById("order-answer");
    const pool = document.getElementById("order-pool");
    ans.innerHTML = ui.order.length ? ui.order.map(i => '<button class="chip" data-o="' + i + '">' + highlight(s.items[i]) + '</button>').join("") : '<span class="placeholder">여기에 순서대로 쌓여요</span>';
    pool.innerHTML = ui.pool.map(i => '<button class="chip" data-p="' + i + '">' + highlight(s.items[i]) + '</button>').join("");
    ans.querySelectorAll("[data-o]").forEach(b => b.addEventListener("click", () => {
      if (ui.checked) return;
      const v = +b.dataset.o; ui.order = ui.order.filter(x => x !== v); ui.pool.push(v); drawOrder(s);
    }));
    pool.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => {
      if (ui.checked) return;
      const v = +b.dataset.p; ui.pool = ui.pool.filter(x => x !== v); ui.order.push(v); drawOrder(s);
    }));
    document.getElementById("check-btn").disabled = ui.order.length !== s.items.length;
  }

  function correctText(s) {
    if (s.kind === "ox") return s.answer ? "O" : "X";
    if (s.kind === "mc") return (s.answer + 1) + "번 " + s.options[s.answer];
    if (s.kind === "short") return s.answers[0];
    if (s.kind === "order") return s.items.join("  →  ");
    return "";
  }

  function checkAnswer() {
    const item = run.steps[run.i];
    const s = item.s;
    const ui = run.ui;
    let ok = false;
    if (s.kind === "ox") ok = (ui.selected === "true") === s.answer;
    else if (s.kind === "mc") ok = +ui.selected === s.answer;
    else if (s.kind === "short") ok = s.answers.some(a => normalize(a) === normalize(ui.selected || ""));
    else if (s.kind === "order") ok = ui.order.every((v, i) => v === i);
    ui.checked = true;
    run.total++;
    const key = item.lessonId + "#" + item.idx;
    if (ok) {
      run.correct++;
      run.xp += XP_PER_CORRECT;
      if (run.mode === "review") state.wrong = state.wrong.filter(w => w.key !== key);
    } else if (!state.wrong.some(w => w.key === key)) {
      state.wrong.push({ key, lessonId: item.lessonId, step: item.idx, date: todayStr() });
    }
    save();

    // 선택지에 정답·오답 표시
    if (s.kind === "ox" || s.kind === "mc") {
      app.querySelectorAll("[data-pick]").forEach(b => {
        b.disabled = true;
        const v = b.dataset.pick;
        const isAns = s.kind === "ox" ? (v === "true") === s.answer : +v === s.answer;
        if (isAns) b.classList.add("right");
        else if (v === ui.selected) b.classList.add("wrong");
      });
    } else if (s.kind === "short") {
      const inp = document.getElementById("short-input");
      inp.disabled = true; inp.classList.add(ok ? "right" : "wrong");
    } else if (s.kind === "order") {
      document.getElementById("order-answer").classList.add(ok ? "right" : "wrong");
    }

    const footer = document.getElementById("footer");
    footer.className = "footer feedback " + (ok ? "good" : "bad");
    footer.innerHTML = '<div class="fb-text"><strong>' + (ok ? "정답이에요!" : "아쉬워요") + '</strong>' +
      (ok ? "" : '<p class="answer-line">정답: <code>' + esc(correctText(s)) + '</code></p>') +
      '<p>' + rich(s.explanation) + '</p>' +
      (ok ? "" : '<p class="muted small">이 문제는 오답노트에 저장했어요.</p>') + '</div>' +
      '<button class="btn ' + (ok ? "primary" : "danger") + ' block" data-act="continue" id="cont-btn">계속</button>';
    document.getElementById("cont-btn").focus();
  }

  function nextStep() {
    run.i++;
    if (run.i >= run.steps.length) finishRun();
    else renderStep();
  }

  function finishRun() {
    state.xp += run.xp;
    let goalJustDone = false;
    if (run.mode === "lesson") {
      const rate = run.total ? run.correct / run.total : 1;
      const stars = rate === 1 ? 3 : rate >= 0.7 ? 2 : 1;
      const prev = state.completed[run.lessonId];
      state.completed[run.lessonId] = { stars: Math.max(stars, prev ? prev.stars : 0), date: todayStr() };
      refreshDay();
      const before = state.today.count;
      state.today.count++;
      if (before < state.dailyGoal && state.today.count >= state.dailyGoal) {
        goalJustDone = true;
        if (state.lastGoalDate === yesterdayStr()) state.streak++;
        else if (state.lastGoalDate !== todayStr()) state.streak = 1;
        state.lastGoalDate = todayStr();
        state.bestStreak = Math.max(state.bestStreak, state.streak);
      }
    }
    save();
    renderResult(goalJustDone);
  }

  function renderResult(goalJustDone) {
    const rate = run.total ? Math.round((run.correct / run.total) * 100) : 100;
    const found = run.mode === "lesson" ? findLesson(run.lessonId) : null;
    const example = found ? found.lesson.steps.find(s => s.type === "example") : null;
    const cheer = rate === 100 ? "완벽해요!" : rate >= 70 ? "잘했어요!" : "끝까지 해낸 것도 대단해요!";
    app.innerHTML = '<div class="screen result">' +
      '<div class="result-body">' + MASCOT +
      '<h1>' + (run.mode === "review" ? "복습 완료!" : "레슨 완료!") + '</h1>' +
      '<p class="lead">' + esc(state.name) + '님, ' + cheer + '</p>' +
      '<div class="result-stats">' +
      '<div class="rs xp"><span>획득 XP</span><strong>' + ICON.bolt + run.xp + '</strong></div>' +
      '<div class="rs acc"><span>정답률</span><strong>' + rate + '%</strong></div>' +
      '<div class="rs fire"><span>연속 학습</span><strong>' + ICON.fire + state.streak + '일</strong></div></div>' +
      (goalJustDone ? '<div class="card celebrate">오늘 목표 달성! 스트릭이 ' + state.streak + '일이 되었어요.</div>' : "") +
      (run.mode === "lesson" && run.correct < run.total ? '<p class="muted small">틀린 문제는 오답노트에 저장했어요. 내일 홈 화면에서 다시 풀어 봐요.</p>' : "") +
      (example ? '<button class="btn ghost block" data-act="colab" data-code="' + esc(example.code) + '">예제 코드를 코랩에서 직접 해 보기</button>' : "") +
      '</div><div class="footer"><button class="btn primary block" data-act="home">홈으로</button></div></div>';
  }

  /* ---------- 설정과 안내 ---------- */
  function openModal(html) {
    const m = document.createElement("div");
    m.className = "modal-bg";
    m.innerHTML = '<div class="modal" role="dialog">' + html + '</div>';
    m.addEventListener("click", e => { if (e.target === m) m.remove(); });
    document.body.appendChild(m);
    return m;
  }
  function openSettings() {
    const m = openModal('<h2>설정</h2>' +
      '<label class="field">닉네임<input id="set-name" class="input" maxlength="10" value="' + esc(state.name) + '"></label>' +
      '<label class="field">하루 목표<select id="set-goal" class="input">' +
      [1, 2, 3].map(g => '<option value="' + g + '"' + (state.dailyGoal === g ? " selected" : "") + '>레슨 ' + g + '개</option>').join("") + '</select></label>' +
      '<p class="muted small">최고 연속 학습: ' + state.bestStreak + '일 · 완료한 레슨: ' + Object.keys(state.completed).length + '개</p>' +
      '<div class="modal-actions"><button class="btn primary" data-m="save">저장</button><button class="btn text" data-m="close">닫기</button></div>' +
      '<hr><button class="btn text danger-text" data-m="reset">학습 기록 모두 지우기</button>');
    m.addEventListener("click", e => {
      const a = e.target.closest("[data-m]");
      if (!a) return;
      if (a.dataset.m === "save") {
        const n = m.querySelector("#set-name").value.trim();
        if (n) state.name = n;
        state.dailyGoal = +m.querySelector("#set-goal").value;
        save(); m.remove(); renderHome();
      } else if (a.dataset.m === "close") m.remove();
      else if (a.dataset.m === "reset") {
        if (a.dataset.confirm) {
          state = defaultState(); save(); m.remove(); ob = { step: 0, name: "", goal: 1 }; renderOnboarding();
        } else { a.dataset.confirm = "1"; a.textContent = "한 번 더 누르면 모두 지워져요"; }
      }
    });
  }
  function openInstall() {
    const m = openModal('<h2>컴퓨터에 파이썬 설치하기 (선택)</h2>' +
      '<p class="muted">코랩만으로도 충분해요. 내 컴퓨터에서 실행하고 싶을 때만 따라 하세요.</p>' +
      '<ol class="steps-list"><li>python.org에 접속해 Downloads 메뉴에서 최신 버전을 내려받아요.</li>' +
      '<li>설치 첫 화면에서 <strong>Add python.exe to PATH</strong>를 꼭 체크해요. (Windows)</li>' +
      '<li>Install Now를 눌러 설치해요.</li>' +
      '<li>시작 메뉴에서 IDLE을 열고 <code>print("안녕")</code>을 입력해 확인해요.</li></ol>' +
      '<p class="muted small">학교 컴퓨터는 설치가 막혀 있을 수 있어요. 그럴 땐 코랩을 쓰세요.</p>' +
      '<div class="modal-actions"><button class="btn primary" data-m="close">확인</button></div>');
    m.addEventListener("click", e => { if (e.target.closest("[data-m]")) m.remove(); });
  }
  function openColab(code) {
    const done = () => toast("코드를 복사했어요. 코랩 코드 칸에 붙여 넣고 ▶를 누르세요.");
    try {
      if (navigator.clipboard && code) navigator.clipboard.writeText(code).then(done, () => toast("코랩이 열려요. 예제 코드를 직접 입력해 보세요."));
      else done();
    } catch (e) { /* 복사 실패해도 코랩은 열어요 */ }
    window.open(COLAB_URL, "_blank", "noopener");
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  /* ---------- 이벤트 ---------- */
  app.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    if (act === "next") { if (ob.step === 1 && !ob.name.trim()) return; ob.step++; renderOnboarding(); }
    else if (act === "back") { ob.step = Math.max(0, ob.step - 1); renderOnboarding(); }
    else if (act === "goal") { ob.goal = +el.dataset.v; renderOnboarding(); }
    else if (act === "finish") {
      state.name = ob.name.trim().slice(0, 10); state.dailyGoal = ob.goal; state.onboarded = true; save(); renderHome();
    }
    else if (act === "colab") { e.preventDefault(); openColab(el.dataset.code); }
    else if (act === "settings") openSettings();
    else if (act === "install") { e.preventDefault(); openInstall(); }
    else if (act === "lesson") startLesson(el.dataset.id);
    else if (act === "review") startReview();
    else if (act === "check") checkAnswer();
    else if (act === "continue") nextStep();
    else if (act === "quit") { run = null; renderHome(); }
    else if (act === "home") { run = null; renderHome(); }
  });

  if (state.onboarded) renderHome(); else renderOnboarding();
})();
