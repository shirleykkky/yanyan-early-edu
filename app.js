// ===== 言言早教工作台 主逻辑 =====

// ---- 日期与主题计算 ----
const START_DATE = new Date(2026, 7, 17); // 8月17日为Day0
let _viewDate = new Date(); // 当前查看的日期，默认今天

function dateToKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isToday(d) {
  const now = new Date();
  return dateToKey(d) === dateToKey(now);
}

function getDayIndex(d) {
  const ref = d || _viewDate;
  const diff = Math.floor((ref - START_DATE) / 86400000);
  return Math.max(0, diff);
}

function getWeekIndex() {
  return Math.floor(getDayIndex() / 7) % WEEK_THEMES.length;
}

function formatDate(d) {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['日','一','二','三','四','五','六'];
  const todayTag = isToday(d) ? '' : '';
  return `${m}月${day}日 周${weekdays[d.getDay()]}`;
}

// ---- 日期切换 ----
function changeDate(offset) {
  const newDate = new Date(_viewDate);
  newDate.setDate(newDate.getDate() + offset);
  // 不能超过今天
  if (newDate > new Date()) return;
  // 不能早于START_DATE
  if (newDate < START_DATE) return;
  _viewDate = newDate;
  renderToday();
}

function showDatePicker() {
  const picker = document.getElementById('datePicker');
  picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
  picker.value = dateToKey(_viewDate);
  picker.max = dateToKey(new Date());
  picker.min = dateToKey(START_DATE);
}

function pickDate(val) {
  const parts = val.split('-');
  _viewDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  document.getElementById('datePicker').style.display = 'none';
  renderToday();
}

function switchPage(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('mainContent').scrollTop = 0;
}

// ---- 今日模块 ----
function renderToday() {
  const viewDate = _viewDate;
  const dateEl = document.getElementById('todayDate');
  dateEl.textContent = formatDate(viewDate);
  dateEl.className = 'date-nav-text' + (isToday(viewDate) ? ' is-today' : '');
  
  // 更新前后按钮状态
  const prevBtn = document.getElementById('datePrev');
  const nextBtn = document.getElementById('dateNext');
  if (prevBtn) prevBtn.disabled = (viewDate <= START_DATE);
  if (nextBtn) nextBtn.disabled = isToday(viewDate);

  const dayIdx = getDayIndex(viewDate);
  const weekIdx = Math.floor(dayIdx / 7) % WEEK_THEMES.length;
  const theme = WEEK_THEMES[weekIdx];
  document.getElementById('weekTheme').textContent = `本周主题：${theme.icon} ${theme.name}`;

  // 获取当日数据
  const fineDay = dayIdx % FINE_MOTOR_POOL.length;
  const langDay = dayIdx % LANGUAGE_POOL.length;
  const cogDay = dayIdx % COGNITION_POOL.length;
  const enDay = dayIdx % ENGLISH_POOL.length;
  const motorDay = dayIdx % GROSS_MOTOR_POOL.length;
  const reminderDay = dayIdx % REMINDERS_POOL.length;

  const fineData = FINE_MOTOR_POOL[fineDay];
  const langData = LANGUAGE_POOL[langDay];
  const cogData = COGNITION_POOL[cogDay];
  const enData = ENGLISH_POOL[enDay];
  const motorData = GROSS_MOTOR_POOL[motorDay];
  const reminder = REMINDERS_POOL[reminderDay];

  // 读取打卡状态（按查看日期）
  const dateKey = dateToKey(viewDate);
  const todayKey = `check_${dateKey}`;
  const checks = JSON.parse(localStorage.getItem(todayKey) || '{}');

  let html = '';

  // 1. 精细动作
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#FF8FAB,#FFB366);">✋</div>
      <div class="module-title">精细动作 & 专注力</div>
      <div class="module-check ${checks.fine?'done':''}" onclick="toggleCheck('fine')">✓</div>
    </div>`;
  fineData.forEach(item => {
    html += `<div class="activity-item">
      <div class="activity-name"><span class="activity-tag" style="background:${theme.color}22;color:${theme.color};">${item.tag}</span> ${item.name}</div>
      <div class="activity-desc">${item.desc}</div>
      <div class="activity-tips">💡 ${item.tips}</div>
    </div>`;
  });
  html += `</div>`;

  // 2. 语言启蒙
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#64B5F6,#B39DDB);">💬</div>
      <div class="module-title">语言启蒙</div>
      <div class="module-check ${checks.lang?'done':''}" onclick="toggleCheck('lang')">✓</div>
    </div>`;
  langData.forEach(item => {
    html += `<div class="activity-item">
      <div class="activity-name">${item.phrase}</div>
      <div class="activity-desc">场景：${item.scene}</div>
    </div>`;
  });
  html += `</div>`;

  // 3. 认知启蒙
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#7BC67E,#FFD54F);">🧠</div>
      <div class="module-title">认知启蒙</div>
      <div class="module-check ${checks.cog?'done':''}" onclick="toggleCheck('cog')">✓</div>
    </div>`;
  cogData.forEach(item => {
    html += `<div class="activity-item">
      <div class="activity-name">${item.topic}</div>
      <div class="activity-desc">${item.guide}</div>
    </div>`;
  });
  html += `</div>`;

  // 4. 英文启蒙
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#64B5F6,#1E88E5);">🔤</div>
      <div class="module-title">英文启蒙</div>
      <div class="module-check ${checks.en?'done':''}" onclick="toggleCheck('en')">✓</div>
    </div>`;
  enData.forEach(item => {
    const colorInfo = COLORS_EN.find(c => c.zh === item.zh);
    const colorDot = colorInfo ? `<span class="color-dot" style="background:${colorInfo.hex};"></span>` : '';
    html += `<div class="activity-item">
      <div class="activity-name">${colorDot}${item.en} <span style="font-size:12px;color:var(--text-light);">${item.zh}</span> <span class="activity-tag" style="background:#BBDEFB33;color:#1E88E5;">${item.type}</span></div>
      <button class="play-btn" onclick="speakEnglish('${item.en}')">🔊 播放</button>
    </div>`;
  });
  html += `</div>`;

  // 5. 大运动+感统
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#7BC67E,#43A047);">🏃</div>
      <div class="module-title">大运动 + 感统</div>
      <div class="module-check ${checks.motor?'done':''}" onclick="toggleCheck('motor')">✓</div>
    </div>
    <div style="font-size:11px;color:var(--text-light);margin-bottom:8px;padding:4px 8px;background:#FFF9C4;border-radius:6px;">言言目前处于爬行期→扶站期，以下活动适配此阶段</div>`;
  motorData.forEach(item => {
    html += `<div class="activity-item">
      <div class="activity-name">${item.name}</div>
      <div class="activity-desc">${item.desc}</div>
      <div class="activity-tips">💡 ${item.tips}</div>
    </div>`;
  });
  html += `</div>`;

  // 养育提醒
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#FFD54F,#FFB366);">💡</div>
      <div class="module-title">今日养育提醒</div>
    </div>
    <div class="reminder-box">${reminder}</div>
  </div>`;

  document.getElementById('todayModules').innerHTML = html;
  updateProgress(viewDate);
}

function toggleCheck(module) {
  const dateKey = dateToKey(_viewDate);
  const todayKey = `check_${dateKey}`;
  const checks = JSON.parse(localStorage.getItem(todayKey) || '{}');
  checks[module] = !checks[module];
  localStorage.setItem(todayKey, JSON.stringify(checks));
  renderToday();
}

function updateProgress(viewDate) {
  const dateKey = dateToKey(viewDate || _viewDate);
  const todayKey = `check_${dateKey}`;
  const checks = JSON.parse(localStorage.getItem(todayKey) || '{}');
  const done = Object.values(checks).filter(Boolean).length;
  document.getElementById('dailyProgress').style.width = `${done/5*100}%`;
  const label = isToday(viewDate || _viewDate) ? '今日' : formatDate(viewDate || _viewDate).slice(0,5);
  document.getElementById('progressText').textContent = `${label}进度 ${done}/5`;
}

// ---- 发育观察 ----
function renderObserve() {
  const categories = [
    { key: 'motor', title: '🏃 大运动', items: OBSERVE_ITEMS.motor },
    { key: 'fine', title: '✋ 精细动作', items: OBSERVE_ITEMS.fine },
    { key: 'language', title: '💬 语言能力', items: OBSERVE_ITEMS.language },
    { key: 'cognition', title: '🧠 认知能力', items: OBSERVE_ITEMS.cognition },
    { key: 'social', title: '❤️ 社交情感', items: OBSERVE_ITEMS.social },
  ];
  let html = '';
  categories.forEach(cat => {
    html += `<div class="observe-section">
      <div class="observe-title">${cat.title}</div>`;
    cat.items.forEach((item, idx) => {
      const ageMonth = parseInt(item.age);
      const checkKey = `obs_${cat.key}_${idx}`;
      const checked = localStorage.getItem(checkKey) === '1';
      const ageColor = ageMonth <= 8 ? '#7BC67E' : ageMonth <= 10 ? '#FFB366' : '#64B5F6';
      html += `<div class="observe-item">
        <div class="observe-check ${checked?'done':''}" onclick="toggleObserve('${checkKey}', this)">✓</div>
        <span style="flex:1;">${item.text}</span>
        <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:${ageColor}22;color:${ageColor};">${item.age}+</span>
      </div>`;
    });
    html += `</div>`;
  });
  document.getElementById('observeContent').innerHTML = html;
}

function toggleObserve(key, el) {
  const current = localStorage.getItem(key) === '1';
  localStorage.setItem(key, current ? '0' : '1');
  if (current) {
    el.classList.remove('done');
  } else {
    el.classList.add('done');
  }
  showToast('已保存');
}

// ---- 活动库 ----
let actDomainFilter = '全部';
let actThemeFilter = '全部';

function renderActivityLib() {
  const domains = ['全部', '精细动作', '大运动', '语言认知', '感官探索', '生活技能', '艺术创意'];
  const themes = ['全部', '颜色', '水果', '动物', '五官', '日常物品', '家务', '自然'];

  let html = '';
  domains.forEach(d => {
    html += `<button class="filter-btn ${actDomainFilter===d?'active':''}" onclick="filterActivity('domain','${d}')">${d}</button>`;
  });
  document.getElementById('domainFilter').innerHTML = html;

  html = '';
  themes.forEach(t => {
    html += `<button class="filter-btn ${actThemeFilter===t?'active':''}" onclick="filterActivity('theme','${t}')">${t}</button>`;
  });
  document.getElementById('themeFilter').innerHTML = html;

  let filtered = ACTIVITY_LIBRARY;
  if (actDomainFilter !== '全部') filtered = filtered.filter(a => a.domain === actDomainFilter);
  if (actThemeFilter !== '全部') filtered = filtered.filter(a => a.theme === actThemeFilter);

  html = '';
  const domainColors = {
    '精细动作': '#FF8FAB', '大运动': '#7BC67E', '语言认知': '#64B5F6',
    '感官探索': '#B39DDB', '生活技能': '#FFB366', '艺术创意': '#FFD54F'
  };
  filtered.forEach(a => {
    const c = domainColors[a.domain] || '#999';
    html += `<div class="activity-item">
      <div class="activity-name">
        <span class="activity-tag" style="background:${c}22;color:${c};">${a.domain}</span>
        <span class="activity-tag" style="background:#FFE0B244;color:#FF8FAB;">${a.theme}</span>
        ${a.name}
      </div>
      <div class="activity-desc">${a.desc}</div>
      ${a.material ? `<div style="font-size:11px;color:var(--text-light);margin-top:2px;">📦 材料：${a.material}</div>` : ''}
    </div>`;
  });
  if (filtered.length === 0) html = '<div style="text-align:center;color:var(--text-light);padding:20px;">没有匹配的活动</div>';
  document.getElementById('activityList').innerHTML = html;
}

function filterActivity(type, val) {
  if (type === 'domain') actDomainFilter = val;
  else actThemeFilter = val;
  renderActivityLib();
}

// ---- 教具清单 ----
function renderTools() {
  let html = '';
  Object.values(TOOLS_LIST).forEach(cat => {
    html += `<div class="tool-category">
      <div class="tool-category-title">${cat.title}</div>
      <div class="tool-list">`;
    cat.items.forEach(item => {
      html += `<div class="tool-item">${item}</div>`;
    });
    html += `</div></div>`;
  });
  document.getElementById('toolsContent').innerHTML = html;
}

// ---- 空间布置 ----
function renderSpace() {
  let html = '';
  SPACE_ZONES.forEach(zone => {
    html += `<div class="zone-card">
      <div class="zone-title"><span style="font-size:20px;">${zone.icon}</span> ${zone.name}</div>
      <div class="zone-desc">${zone.desc}</div>
      <div style="margin-top:8px;font-size:13px;font-weight:600;">布置建议：</div>
      <div style="margin-top:4px;">`;
    zone.setup.forEach(s => {
      html += `<div style="font-size:12px;padding:2px 0;color:var(--text-light);">• ${s}</div>`;
    });
    html += `</div>
      <div class="zone-checklist">
        <div style="font-size:13px;font-weight:600;margin-top:6px;">🔒 安全检查：</div>`;
    zone.safety.forEach(s => {
      const checkKey = `safety_${s}`;
      const checked = localStorage.getItem(checkKey) === '1';
      html += `<div class="safety-check">
        <input type="checkbox" ${checked?'checked':''} onchange="toggleSafety('${encodeURIComponent(s)}', this)">
        <label>${s}</label>
      </div>`;
    });
    html += `</div></div>`;
  });

  // 总安全清单
  html += `<div class="zone-card" style="background:linear-gradient(135deg,#FFEBEE,#FFF3E0);">
    <div class="zone-title">🛡️ 全屋安全总检</div>`;
  SAFETY_CHECKLIST.forEach(s => {
    const checkKey = `safety_total_${s}`;
    const checked = localStorage.getItem(checkKey) === '1';
    html += `<div class="safety-check">
      <input type="checkbox" ${checked?'checked':''} onchange="toggleSafetyTotal('${encodeURIComponent(s)}', this)">
      <label>${s}</label>
    </div>`;
  });
  html += `</div>`;

  document.getElementById('spaceContent').innerHTML = html;
}

function toggleSafety(key, el) {
  localStorage.setItem(`safety_${decodeURIComponent(key)}`, el.checked ? '1' : '0');
}
function toggleSafetyTotal(key, el) {
  localStorage.setItem(`safety_total_${decodeURIComponent(key)}`, el.checked ? '1' : '0');
}

// ---- 英文启蒙页 ----
function renderEnglish() {
  let html = '';

  // SSS儿歌
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#FF8FAB,#FFB366);">🎵</div>
      <div class="module-title">SSS 儿歌</div>
    </div>
    <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;">Super Simple Songs · 磨耳朵 · 跟着旋律动起来</div>`;
  SSS_SONGS.forEach(song => {
    html += `<div class="activity-item">
      <div class="activity-name">${song.title}</div>
      <div class="activity-desc">${song.desc}</div>
      <button class="play-btn" onclick="speakEnglish('${song.title}')">🔊 播放歌名</button>
    </div>`;
  });
  html += `</div>`;

  // 亲子口语
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#64B5F6,#1E88E5);">🗣️</div>
      <div class="module-title">亲子口语</div>
    </div>
    <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;">日常生活场景 · 简单短句 · 边做边说</div>`;
  ENGLISH_DAILY.forEach(scene => {
    html += `<div class="activity-item">
      <div class="activity-name" style="color:var(--blue);">📌 ${scene.scene}</div>`;
    scene.phrases.forEach(p => {
      html += `<div style="font-size:13px;padding:2px 0;display:flex;align-items:center;gap:6px;">
        <span>${p}</span>
        <button class="play-btn" onclick="speakEnglish('${p.replace(/'/g, "\\'")}')" style="font-size:10px;padding:2px 8px;margin:0;">🔊</button>
      </div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;

  // TPR
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#7BC67E,#43A047);">🤸</div>
      <div class="module-title">TPR 全身反应教学</div>
    </div>
    <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;">边做动作边说 · 身体记忆英语 · 无压力</div>`;
  TPR_COMMANDS.forEach(item => {
    html += `<div class="activity-item">
      <div class="activity-name">${item.en} <span style="font-size:12px;color:var(--text-light);">${item.zh}</span></div>
      <div class="activity-desc">动作：${item.action}</div>
      <button class="play-btn" onclick="speakEnglish('${item.en.replace(/'/g, "\\'")}')">🔊 播放</button>
    </div>`;
  });
  html += `</div>`;

  // 8大颜色
  html += `<div class="module-card">
    <div class="module-header">
      <div class="module-icon" style="background:linear-gradient(135deg,#B39DDB,#8E24AA);">🎨</div>
      <div class="module-title">8大基础颜色</div>
    </div>`;
  COLORS_EN.forEach(c => {
    html += `<div class="activity-item" style="display:flex;align-items:center;gap:10px;">
      <span class="color-dot" style="background:${c.hex};width:24px;height:24px;flex-shrink:0;"></span>
      <span style="font-size:14px;font-weight:600;flex:1;">${c.en} <span style="color:var(--text-light);font-weight:400;">${c.zh}</span></span>
      <button class="play-btn" onclick="speakEnglish('${c.en}')">🔊</button>
    </div>`;
  });
  html += `</div>`;

  document.getElementById('englishContent').innerHTML = html;
}

// ---- 主题周 ----
function renderThemes() {
  const weekIdx = getWeekIndex();
  let html = '';
  WEEK_THEMES.forEach((theme, idx) => {
    const isCurrent = idx === weekIdx;
    html += `<div class="week-card" style="${isCurrent?'border:2px solid '+theme.color+';':''}">
      <div class="week-badge" style="background:${theme.color}22;color:${theme.color};">${isCurrent?'📌 本周':'第'+(idx+1)+'周'}</div>
      <div style="font-size:16px;margin-bottom:4px;">${theme.icon} ${theme.name}</div>
      <div style="font-size:12px;color:var(--text-light);line-height:1.6;">${theme.desc}</div>
    </div>`;
  });

  html += `<div class="reminder-box" style="margin-top:12px;">
    <strong>📌 主题周规则：</strong>每周轮换一个主题，简单重复巩固。所有日常活动、语言输入、认知启蒙围绕本周主题展开，让宝宝在反复接触中自然习得。7周一个完整循环后重新开始。
  </div>`;

  document.getElementById('themeContent').innerHTML = html;
}

// ---- 养育原则 ----
function renderPrinciples() {
  let html = '';
  PRINCIPLES.forEach((p, i) => {
    html += `<div class="principle-card">
      <div class="principle-num" style="background:${p.color};">${i+1}</div>
      <div class="principle-text">${p.text}</div>
    </div>`;
  });
  document.getElementById('principleContent').innerHTML = html;

  let banHtml = '';
  BANS.forEach(b => {
    banHtml += `<div class="ban-item">
      <span style="font-size:16px;">${b.icon}</span>
      <span style="color:var(--red);font-weight:500;">${b.text}</span>
    </div>`;
  });
  document.getElementById('banContent').innerHTML = banHtml;
}

// ---- 语音播放（Web Speech API） ----
function speakEnglish(text) {
  if (!('speechSynthesis' in window)) {
    showToast('您的浏览器不支持语音播放');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.8;
  utterance.pitch = 1.1;
  // 尝试选择英文语音
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en'));
  if (enVoice) utterance.voice = enVoice;
  window.speechSynthesis.speak(utterance);
  showToast('🔊 正在播放...');
}

// 预加载语音列表
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
  window.speechSynthesis.getVoices();
}

// ---- Toast提示 ----
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

// ---- 初始化 ----
function init() {
  const fns = [renderToday, renderObserve, renderActivityLib, renderTools, renderSpace, renderEnglish, renderThemes, renderPrinciples];
  fns.forEach(fn => { try { fn(); } catch(e) { console.error('Init error:', fn.name, e); } });
}

document.addEventListener('DOMContentLoaded', init);
