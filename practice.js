// Practice page: profile, MOIA class code, and the translate box.
// There is no server yet, so the profile and class code are kept in sessionStorage
// (cleared when the browser closes). Passwords are never stored.

const PROFILE_KEY = 'practice-english-profile';
const CLASS_KEY = 'practice-english-class';

// Class codes. Replace this with the real list (or a server lookup) once MOIA gives you codes.
// TEST123 is a made-up example so the page can be tried.
const CLASSES = {
  TEST123: { location: 'Example Library, Queens', teacher: 'Example Teacher' },
};

function read(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}
function write(key, value) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage blocked: works for this page only */ }
}

// ---- Profile ----
(function () {
  const profile = read(PROFILE_KEY) || {};
  const name = (profile.name || '').trim();
  document.getElementById('profile-name').textContent = name || 'Student';
  document.getElementById('profile-contact').textContent = profile.contact || '';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  document.getElementById('avatar').textContent = initials || 'S';
})();

// ---- MOIA class code ----
(function () {
  const form = document.getElementById('code-form');
  const input = document.getElementById('code-input');
  const error = document.getElementById('code-error');
  const card = document.getElementById('class-card');

  function show(saved) {
    form.hidden = !!saved;
    card.hidden = !saved;
    if (saved) {
      document.getElementById('class-location').textContent = saved.location;
      document.getElementById('class-teacher').textContent = saved.teacher;
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();
    const found = CLASSES[code];
    error.hidden = !!found || !code;
    if (!found) { input.focus(); return; }
    const saved = { code, ...found };
    write(CLASS_KEY, saved);
    show(saved);
  });

  document.getElementById('class-change').addEventListener('click', () => {
    write(CLASS_KEY, null);
    input.value = '';
    show(null);
    input.focus();
  });

  show(read(CLASS_KEY));
})();

// ---- Translate box ----
// Uses the free MyMemory service (no key needed, about 5,000 words a day per user).
(function () {
  const API_CODES = { 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW' };
  const select = document.getElementById('tr-lang');
  const panes = document.getElementById('tr-panes');
  const theirsText = document.getElementById('tr-theirs-text');
  const englishText = document.getElementById('tr-english-text');
  const go = document.getElementById('tr-go');
  const error = document.getElementById('tr-error');
  let toEnglish = true;

  LANGUAGES.filter(l => l.code !== 'en').forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.textContent = l.name;
    opt.lang = l.code;
    select.appendChild(opt);
  });

  function followSiteLanguage(code) {
    if (code && code !== 'en') select.value = code;
  }
  followSiteLanguage(window.currentLanguage ? window.currentLanguage() : 'es');
  document.addEventListener('languagechange', e => followSiteLanguage(e.detail));
  select.addEventListener('change', () => { theirsText.lang = select.value; });
  theirsText.lang = select.value;

  function setDirection(next) {
    toEnglish = next;
    panes.classList.toggle('reversed', !toEnglish);
    theirsText.readOnly = !toEnglish;
    englishText.readOnly = toEnglish;
    englishText.placeholder = toEnglish ? '' : theirsText.placeholder;
    (toEnglish ? theirsText : englishText).focus();
  }

  document.getElementById('tr-swap').addEventListener('click', () => {
    // The old answer becomes the new question.
    const from = toEnglish ? englishText.value : theirsText.value;
    setDirection(!toEnglish);
    (toEnglish ? theirsText : englishText).value = from;
    (toEnglish ? englishText : theirsText).value = '';
  });

  go.addEventListener('click', async () => {
    const source = toEnglish ? theirsText : englishText;
    const target = toEnglish ? englishText : theirsText;
    const text = source.value.trim();
    if (!text) { source.focus(); return; }
    const them = API_CODES[select.value] || select.value;
    const pair = toEnglish ? `${them}|en` : `en|${them}`;
    error.hidden = true;
    go.disabled = true;
    try {
      const url = 'https://api.mymemory.translated.net/get?' + new URLSearchParams({ q: text, langpair: pair });
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || Number(data.responseStatus) !== 200) throw new Error(data.responseDetails || res.status);
      // The service's top pick is sometimes a loose match from its phrase database
      // (e.g. "pharmacy" came back as "hospital"), so prefer its own machine translation.
      const machine = (data.matches || []).find(m => m['created-by'] === 'MT!');
      target.value = (machine && machine.translation) || data.responseData.translatedText;
    } catch {
      error.textContent = window.t ? window.t('translate_error') : "Translation isn't working right now. Try again later.";
      error.hidden = false;
    } finally {
      go.disabled = false;
    }
  });
})();

// ---- Log out ----
// Forget who is signed in on this tab, then go back to the welcome page.
document.getElementById('log-out').addEventListener('click', () => {
  write(PROFILE_KEY, null);
  write(CLASS_KEY, null);
});

// ---- Topics ----
// Only "Talking About School" has a conversation page so far.
// The other topics and General Practice don't do anything yet.
document.querySelector('[data-topic="school"]').addEventListener('click', () => {
  location.href = 'conversation.html?topic=school';
});
