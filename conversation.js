// Paste the Worker's base URL here (e.g. https://moia-english-teacher.example.workers.dev),
// with no trailing slash; the code appends '/chat'.
// Leave it empty to use the built-in demo teacher (no AI, canned answers).
const CHAT_URL = 'https://moia-english-teacher.togud61.workers.dev';

// Conversation page: talk with the AI teacher about one topic.
// Speech in uses the browser's SpeechRecognition, speech out uses speechSynthesis.
// The chat history lives only in this page's memory; nothing is saved.

const MAX_MESSAGES = 40;      // the server refuses more than this
const MAX_CHARS = 600;        // per message, same as the server
const REQUEST_TIMEOUT_MS = 30000;
const SPEECH_START_WAIT_MS = 2500; // if the opening line has not started by then, the browser blocked it
const END_LINE = 'Great practice today! Tap "Start over" to talk again.';

// Also tolerates a pasted URL that already ends in /chat or a slash.
const CHAT_ENDPOINT = CHAT_URL.trim()
  ? CHAT_URL.trim().replace(/\/+$/, '').replace(/\/chat$/, '') + '/chat'
  : '';

// id -> English name (shown as the heading) and the i18n key for its translation.
const TOPICS = {
  school: { name: 'Talking About School', key: 'topic_school' },
  interview: { name: 'Interview', key: 'topic_interview' },
  finances: { name: 'Talking About Finances', key: 'topic_finances' },
  help: { name: 'Requesting Help', key: 'topic_help' },
  restaurant: { name: 'Restaurant (Ordering + Paying)', key: 'topic_restaurant' },
  doctor: { name: 'Visiting the Doctor', key: 'topic_doctor' },
  vote: { name: 'Register to Vote', key: 'topic_vote' },
  911: { name: 'Calling 911', key: 'topic_911' },
  weather: { name: 'Weather / Storms', key: 'topic_weather' },
  'parent-teacher': { name: 'Parent/Teacher Conference', key: 'topic_parent_teacher' },
  mta: { name: 'Navigating the MTA / Directions', key: 'topic_mta' },
  party: { name: 'Planning a Party', key: 'topic_party' },
  friends: { name: 'Making Plans with a Friend', key: 'topic_friends' },
  appointment: { name: 'Booking an Appointment', key: 'topic_appointment' },
  general: { name: 'General Practice', key: 'general_practice' },
};

// Demo teacher, used only while CHAT_URL is empty.
const MOCK = {
  school: {
    opening: "Hi! I'm your English teacher. Today let's talk about school. What do you like about your English class?",
    replies: [
      "That's great! Thank you for telling me. What day and time is your English class?",
      'Nice. Who do you sit next to in class? Tell me about a classmate.',
      'That sounds fun. What is the hardest part of learning English for you?',
      'Good answer! Practice helps a lot. What do you like to do after class?',
      'Wonderful. When you were young, what was your favorite subject in school?',
    ],
  },
  other: {
    opening: name => `Hi! I'm your English teacher. Today let's practice: ${name}. Are you ready to start?`,
    replies: [
      'Good! Can you tell me a little more?',
      "Thank you. That's a nice answer. What else can you say?",
      "Great job. Let's keep practicing. What would you say next?",
    ],
  },
};

(function () {
  const t = key => (window.t ? window.t(key) : key);
  const lang = () => (window.currentLanguage ? window.currentLanguage() : 'en');

  const params = new URLSearchParams(location.search);
  const requested = params.get('topic');
  const topicId = Object.prototype.hasOwnProperty.call(TOPICS, requested) ? requested : 'school';
  const topic = TOPICS[topicId];

  const convo = document.getElementById('convo');
  const panel = document.getElementById('transcript-panel');
  const lines = document.getElementById('lines');
  const toolRow = document.querySelector('#transcript-tools .tool-row');
  const trPick = document.getElementById('tr-pick');
  const trSelect = document.getElementById('tr-lang');
  const translateBtn = document.getElementById('translate-btn');
  const hideBtn = document.getElementById('hide-btn');
  const hideLabel = document.getElementById('hide-label');
  const convoTop = document.getElementById('convo-top');
  const topicName = document.getElementById('topic-name');
  const topicHint = document.getElementById('topic-hint');
  const hearFirst = document.getElementById('hear-first');
  const mic = document.getElementById('mic');
  const status = document.getElementById('mic-status');
  const startOver = document.getElementById('start-over');
  const form = document.getElementById('type-form');
  const input = document.getElementById('type-input');
  const sendBtn = document.getElementById('send-btn');

  const noop = () => {};
  const avatar = window.createAvatar
    ? window.createAvatar(document.getElementById('stage'))
    : { startTalking: noop, stopTalking: noop, pulse: noop, setListening: noop, destroy: noop };

  document.getElementById('demo-note').hidden = !!CHAT_ENDPOINT;

  // What this browser can do.
  const synth = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  // ---- State ----
  let history = [];          // [{ role: 'user' | 'assistant', content }]
  let busy = false;          // waiting for the teacher's reply
  let ended = false;         // reached MAX_MESSAGES
  let listening = false;
  let speaking = false;
  let note = null;           // i18n key of a short message for the status line
  let transcriptHidden = false;

  // ---- Labels written by this script ----
  // Elements with data-label="key" get t(key) now and again when the language changes.
  function relabel(root) {
    (root || document).querySelectorAll('[data-label]').forEach(el => { el.textContent = t(el.dataset.label); });
  }

  function updateTopicText() {
    topicName.textContent = topic.name;
    topicHint.dataset.i18nHint = topic.key; // so i18n.js keeps the right hint on a language change
    const translated = t(topic.key);
    const hasTranslation = lang() !== 'en' && translated !== topic.key;
    topicHint.textContent = hasTranslation ? translated : '';
    document.title = `${hasTranslation ? translated : topic.name} · Practice English`;
  }

  function render() {
    mic.hidden = !SR;
    mic.disabled = busy || ended;
    mic.classList.toggle('listening', listening);
    mic.setAttribute('aria-pressed', String(listening));
    mic.setAttribute('aria-label', listening ? t('stop_listening') : t('tap_to_talk'));
    sendBtn.disabled = busy || ended;
    input.disabled = ended;
    startOver.hidden = !ended;

    let text;
    let warn = false;
    if (ended) text = t('great_practice');
    else if (busy) text = t('thinking');
    else if (listening) text = t('listening');
    else if (speaking) text = t('teacher_talking');
    else if (note) { text = t(note); warn = note !== 'didnt_hear'; }
    else if (SR) text = t('tap_to_talk');
    else { text = t('no_speech_support'); warn = true; }
    status.textContent = text;
    status.classList.toggle('warn', warn);

    hideLabel.textContent = transcriptHidden ? t('show') : t('hide');
    hideBtn.setAttribute('aria-label', transcriptHidden ? t('show_transcript') : t('hide_transcript'));
    hideBtn.setAttribute('aria-expanded', String(!transcriptHidden));
    input.setAttribute('aria-label', t('type_answer'));
  }

  // ---- Transcript ----
  const entries = []; // one per You/Teacher line: { text, trEl, cache, failed, pending }
  let interimEl = null;

  function nearBottom() { return lines.scrollHeight - lines.scrollTop - lines.clientHeight < 40; }
  function scrollToEnd() { lines.scrollTop = lines.scrollHeight; }

  function addLine(who, text) {
    const li = document.createElement('li');
    li.className = `line ${who}`;
    const head = document.createElement('div');
    head.className = 'line-head';
    const label = document.createElement('span');
    label.className = 'who';
    label.dataset.label = who === 'teacher' ? 'teacher_label' : 'you_label';
    head.appendChild(label);
    if (who === 'teacher' && synth) {
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'hear-again';
      again.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg><span data-label="hear_again"></span>';
      again.addEventListener('click', () => {
        stopListening(true);
        hearFirst.hidden = true;
        speak(text);
      });
      head.appendChild(again);
    }
    const body = document.createElement('p');
    body.className = 'line-text';
    body.lang = 'en';
    body.dir = 'ltr';
    body.textContent = text;
    const tr = document.createElement('p');
    tr.className = 'line-tr';
    tr.hidden = true;
    li.append(head, body, tr);
    relabel(li);
    lines.insertBefore(li, interimEl);
    const entry = { text, trEl: tr, cache: {}, failed: {}, pending: {} };
    entries.push(entry);
    showTranslation(entry);
    scrollToEnd();
  }

  // System notes (errors) are not spoken and not part of the chat history.
  function addNote(text, canRetry) {
    const li = document.createElement('li');
    li.className = 'line note';
    const p = document.createElement('p');
    p.textContent = text;
    li.appendChild(p);
    if (canRetry) {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'link-btn retry';
      retry.dataset.label = 'try_again';
      retry.textContent = t('try_again');
      retry.addEventListener('click', () => { if (!busy && !ended) requestReply(); });
      li.appendChild(retry);
    }
    lines.insertBefore(li, interimEl);
    scrollToEnd();
  }

  function clearRetryButtons() {
    lines.querySelectorAll('.retry').forEach(b => b.remove());
  }

  // What the student is saying right now (greyed). Screen readers skip it; the final text is announced.
  function showInterim(text) {
    if (!text) { clearInterim(); return; }
    if (!interimEl) {
      interimEl = document.createElement('li');
      interimEl.className = 'line user interim';
      interimEl.setAttribute('aria-hidden', 'true');
      interimEl.innerHTML = '<div class="line-head"><span class="who" data-label="you_label"></span></div><p class="line-text" lang="en" dir="ltr"></p>';
      relabel(interimEl);
      lines.appendChild(interimEl);
    }
    interimEl.querySelector('.line-text').textContent = text;
    scrollToEnd();
  }
  function clearInterim() {
    if (interimEl) { interimEl.remove(); interimEl = null; }
  }

  // ---- Translate (MyMemory, same service as the Practice page) ----
  const API_CODES = { 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW' };
  let translateOn = false;
  let queue = Promise.resolve();

  LANGUAGES.filter(l => l.code !== 'en').forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.textContent = l.name;
    opt.lang = l.code;
    trSelect.appendChild(opt);
  });

  function targetLang() { return lang() !== 'en' ? lang() : trSelect.value; }

  function showTranslation(entry) {
    const el = entry.trEl;
    if (!translateOn) { el.hidden = true; return; }
    const code = targetLang();
    const info = LANGUAGES.find(l => l.code === code);
    el.hidden = false;
    el.lang = code;
    el.dir = info && info.rtl ? 'rtl' : 'ltr';
    el.classList.remove('pending', 'failed');
    if (typeof entry.cache[code] === 'string') {
      el.textContent = entry.cache[code];
    } else if (entry.failed[code]) {
      el.textContent = t('translate_error');
      el.dir = '';
      el.classList.add('failed');
    } else {
      el.textContent = t('translating');
      el.dir = '';
      el.classList.add('pending');
      enqueue(entry, code);
    }
  }

  function showAllTranslations() {
    const atEnd = nearBottom();
    entries.forEach(showTranslation);
    if (atEnd) scrollToEnd();
  }

  // One request at a time, so a long chat doesn't flood the free service.
  function enqueue(entry, code) {
    if (entry.pending[code]) return;
    entry.pending[code] = true;
    queue = queue.then(async () => {
      try {
        entry.cache[code] = await translateText(entry.text, code);
      } catch {
        entry.failed[code] = true;
      }
      entry.pending[code] = false;
      const atEnd = nearBottom();
      showTranslation(entry);
      if (atEnd) scrollToEnd();
    });
  }

  async function translateText(text, code) {
    const pair = `en|${API_CODES[code] || code}`;
    const out = [];
    // MyMemory takes up to 500 characters per request.
    for (const piece of chunks(text, 450)) out.push(await translatePiece(piece, pair));
    return out.join(' ');
  }

  async function translatePiece(q, pair) {
    const url = 'https://api.mymemory.translated.net/get?' + new URLSearchParams({ q, langpair: pair });
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || Number(data.responseStatus) !== 200) throw new Error(data.responseDetails || res.status);
    // Prefer the service's own machine translation over loose phrase-database matches.
    const machine = (data.matches || []).find(m => m['created-by'] === 'MT!');
    const result = (machine && machine.translation) || (data.responseData && data.responseData.translatedText);
    if (!result) throw new Error('empty');
    return result;
  }

  function chunks(text, max) {
    const out = [];
    let current = '';
    sentences(text).forEach(s => {
      while (s.length > max) {
        const cut = s.lastIndexOf(' ', max) > 0 ? s.lastIndexOf(' ', max) : max;
        if (current) { out.push(current); current = ''; }
        out.push(s.slice(0, cut));
        s = s.slice(cut).trim();
      }
      if (current && (current + ' ' + s).length > max) { out.push(current); current = s; }
      else current = current ? current + ' ' + s : s;
    });
    if (current) out.push(current);
    return out;
  }

  translateBtn.addEventListener('click', () => {
    translateOn = !translateOn;
    translateBtn.setAttribute('aria-pressed', String(translateOn));
    // Turning it on again retries lines that failed before.
    if (translateOn) entries.forEach(e => { e.failed = {}; });
    showAllTranslations();
  });
  trSelect.addEventListener('change', showAllTranslations);

  // Only needed when the site is in English; otherwise translations go to the site language.
  function updatePicker() { trPick.hidden = lang() !== 'en'; }

  // ---- Hide / Show the transcript ----
  hideBtn.addEventListener('click', () => {
    transcriptHidden = !transcriptHidden;
    panel.hidden = transcriptHidden;
    convo.classList.toggle('transcript-hidden', transcriptHidden);
    // The same button moves to the top bar while the panel is hidden.
    if (transcriptHidden) convoTop.prepend(hideBtn);
    else toolRow.appendChild(hideBtn);
    render();
    hideBtn.focus();
    if (!transcriptHidden) scrollToEnd();
  });

  // ---- Speech out ----
  const PREFERRED_VOICES = ['Samantha', 'Google US English', 'Microsoft Aria', 'Jenny'];
  let voice = null;
  let speakToken = 0;

  function chooseVoice() {
    if (!synth) return;
    const voices = synth.getVoices() || [];
    const english = voices.filter(v => /^en([-_]|$)/i.test(v.lang));
    let found = null;
    for (const name of PREFERRED_VOICES) {
      found = english.find(v => v.name.includes(name));
      if (found) break;
    }
    voice = found || english.find(v => /^en[-_]US/i.test(v.lang)) || null;
  }
  if (synth) {
    chooseVoice();
    // Most browsers load voices a moment after the page.
    if (synth.addEventListener) synth.addEventListener('voiceschanged', chooseVoice);
    else synth.onvoiceschanged = chooseVoice;
  }

  // Chrome can stop in the middle of a long utterance, so speak one sentence at a time.
  function sentences(text) {
    const parts = String(text).match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) || [];
    return parts.map(s => s.trim()).filter(Boolean);
  }

  function setSpeaking(on) {
    if (speaking === on) return;
    speaking = on;
    if (on) avatar.startTalking();
    else avatar.stopTalking();
    render();
  }

  function stopSpeaking() {
    speakToken++;
    if (synth) synth.cancel();
    setSpeaking(false);
  }

  // onBlocked: called if the browser won't start speech yet (no tap on the page so far).
  function speak(text, onBlocked) {
    if (!synth) return;
    stopSpeaking();
    if (!voice) chooseVoice();
    const token = speakToken;
    const parts = sentences(text);
    if (!parts.length) return;
    let started = false;
    let waitTimer = null;

    function blocked() {
      clearTimeout(waitTimer);
      stopSpeaking();
      if (onBlocked) onBlocked();
    }
    if (onBlocked) waitTimer = setTimeout(() => { if (token === speakToken && !started) blocked(); }, SPEECH_START_WAIT_MS);

    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = 'en-US';
      u.rate = 0.9;
      if (voice) u.voice = voice;
      u.onstart = () => {
        if (token !== speakToken) return;
        started = true;
        clearTimeout(waitTimer);
        setSpeaking(true);
      };
      u.onboundary = e => {
        if (token === speakToken && (!e.name || e.name === 'word')) avatar.pulse();
      };
      u.onend = () => {
        if (token === speakToken && i === parts.length - 1) setSpeaking(false);
      };
      u.onerror = e => {
        if (token !== speakToken) return;
        if (e.error === 'not-allowed' && !started) { blocked(); return; }
        if (i === parts.length - 1 || e.error === 'not-allowed') setSpeaking(false);
      };
      synth.speak(u);
    });
  }

  function showHearFirst(text) {
    hearFirst.hidden = false;
    hearFirst.onclick = () => {
      hearFirst.hidden = true;
      speak(text);
    };
  }

  // ---- Speech in ----
  let rec = null;

  function startListening() {
    if (!SR || busy || ended || rec) return;
    stopSpeaking();
    hearFirst.hidden = true;
    note = null;
    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = true;
    r.continuous = false; // stops by itself when the student stops talking
    r.maxAlternatives = 1;
    r.discard = false;
    let finalText = '';

    r.onresult = e => {
      let interim = '';
      finalText = '';
      for (let i = 0; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += piece;
        else interim += piece;
      }
      if (!r.discard) showInterim(`${finalText} ${interim}`.trim());
    };
    r.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') note = 'mic_blocked';
      else if (e.error === 'audio-capture') note = 'no_mic';
      else if (e.error === 'no-speech') note = 'didnt_hear';
      else if (e.error !== 'aborted') note = 'didnt_hear';
    };
    r.onend = () => {
      if (rec === r) rec = null;
      listening = false;
      avatar.setListening(false);
      clearInterim();
      const text = finalText.trim().slice(0, MAX_CHARS);
      if (text && !r.discard) sendUser(text);
      else render();
    };

    try {
      r.start();
    } catch {
      note = 'didnt_hear';
      render();
      return;
    }
    rec = r;
    listening = true;
    avatar.setListening(true);
    render();
  }

  // discard = true drops whatever was heard (used when the student types or taps something else).
  function stopListening(discard) {
    if (!rec) return;
    const r = rec;
    if (discard) {
      r.discard = true;
      clearInterim();
      r.abort();
    } else {
      r.stop(); // the final result still arrives and is sent
    }
  }

  mic.addEventListener('click', () => {
    if (rec) stopListening(false);
    else startListening();
  });

  // ---- Chat ----
  function sendUser(text) {
    if (busy || ended || !text) return;
    stopListening(true);
    stopSpeaking();
    hearFirst.hidden = true;
    note = null;
    addLine('user', text);
    history.push({ role: 'user', content: text });
    requestReply();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim().slice(0, MAX_CHARS);
    if (!text) { input.focus(); return; }
    if (busy || ended) return;
    input.value = '';
    sendUser(text);
  });

  function messagesToSend() {
    // Only these two roles, and never longer than the server allows.
    return history.slice(-MAX_MESSAGES).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, MAX_CHARS),
    }));
  }

  async function fetchReply() {
    const controller = window.AbortController ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
    let res;
    try {
      res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicId, messages: messagesToSend() }),
        signal: controller ? controller.signal : undefined,
      });
    } catch {
      throw new Error(t('network_error'));
    } finally {
      clearTimeout(timer);
    }
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (res.ok && data && typeof data.reply === 'string' && data.reply.trim()) return data.reply.trim();
    throw new Error((data && typeof data.error === 'string' && data.error) || t('network_error'));
  }

  function mockReply() {
    const set = MOCK[topicId] || MOCK.other;
    const userCount = history.filter(m => m.role === 'user').length;
    const reply = userCount === 0
      ? (typeof set.opening === 'function' ? set.opening(topic.name) : set.opening)
      : set.replies[(userCount - 1) % set.replies.length];
    return new Promise(resolve => setTimeout(() => resolve(reply), 600));
  }

  async function requestReply() {
    if (busy) return;
    const opening = history.length === 0;
    busy = true;
    clearRetryButtons();
    render();
    let reply;
    try {
      reply = CHAT_ENDPOINT ? await fetchReply() : await mockReply();
    } catch (err) {
      busy = false;
      addNote((err && err.message) || t('network_error'), true);
      render();
      return;
    }
    busy = false;
    history.push({ role: 'assistant', content: reply });
    addLine('teacher', reply);

    // No room for another student message: finish kindly.
    if (history.length + 1 > MAX_MESSAGES) {
      ended = true;
      stopListening(true);
      addLine('teacher', END_LINE);
      render();
      speak(`${reply} ${END_LINE}`);
      return;
    }
    render();
    speak(reply, opening ? () => showHearFirst(reply) : null);
  }

  function begin() {
    stopListening(true);
    stopSpeaking();
    history = [];
    ended = false;
    note = null;
    entries.length = 0;
    lines.textContent = '';
    interimEl = null;
    hearFirst.hidden = true;
    requestReply();
  }

  startOver.addEventListener('click', () => {
    begin();
    input.focus();
  });

  // ---- Language ----
  document.addEventListener('languagechange', () => {
    updateTopicText();
    updatePicker();
    relabel();
    showAllTranslations();
    render();
  });

  // Don't keep talking or listening after leaving the page.
  window.addEventListener('pagehide', () => {
    if (synth) synth.cancel();
    if (rec) rec.abort();
  });

  updateTopicText();
  updatePicker();
  render();
  begin();
})();
