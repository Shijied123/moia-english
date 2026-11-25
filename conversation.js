// Paste the Worker's base URL here (e.g. https://moia-english-teacher.example.workers.dev),
// with no trailing slash; the code appends '/chat'.
// Leave it empty to use the built-in demo teacher (no AI, canned answers).
const CHAT_URL = 'https://moia-english-teacher.togud61.workers.dev';

// Conversation page: talk with the AI teacher about one topic.
// Speech in uses the browser's SpeechRecognition.
// Speech out depends on what the server offers (GET /config):
//   video mode   (face + voice): a realistic, lip-synced teacher (Simli) speaks the server's voice (/speak).
//   voice mode   (voice only):   the server's voice plays with Web Audio; the illustrated teacher moves her mouth.
//   browser mode (neither):      the browser's own speechSynthesis and the illustrated teacher.
// The chat history lives only in this page's memory; nothing is saved.

const MAX_MESSAGES = 40;      // the server refuses more than this
const MAX_CHARS = 600;        // per message, same as the server
const REQUEST_TIMEOUT_MS = 30000;
const SPEECH_START_WAIT_MS = 2500; // if the opening line has not started by then, the browser blocked it
const END_LINE = 'Great practice today! Tap "Start over" to talk again.';

const CONFIG_TIMEOUT_MS = 6000;
const SPEAK_TIMEOUT_MS = 20000;
const TOKEN_TIMEOUT_MS = 15000;
const VIDEO_CONNECT_TIMEOUT_MS = 30000; // Simli retries on its own; give up after this and use the voice alone
const AUDIO_UNLOCK_WAIT_MS = 400;       // how long to wait for the browser to allow sound
const PCM_BYTES_PER_SECOND = 32000;     // PCM16, 16 kHz, mono
const SIMLI_CHUNK_BYTES = 6000;         // must stay even (2 bytes per sample)
const TALK_SAFETY_MS = 1500;            // extra time after the audio's length before "talking" ends by itself
const VIDEO_MAX_MS = 10 * 60 * 1000;    // a Simli session lasts at most 10 minutes
const VIDEO_IDLE_MS = 2 * 60 * 1000;    // and ends after 2 minutes with no audio
const VIDEO_END_EARLY_MS = 3000;        // end it ourselves just before Simli does

// Also tolerates a pasted URL that already ends in /chat or a slash.
const API_BASE = CHAT_URL.trim() ? CHAT_URL.trim().replace(/\/+$/, '').replace(/\/chat$/, '') : '';
const CHAT_ENDPOINT = API_BASE ? API_BASE + '/chat' : '';

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
  const stage = document.getElementById('stage');
  const videoEl = document.getElementById('teacher-video');
  const audioEl = document.getElementById('teacher-audio');
  const stageBtn = document.getElementById('stage-start');
  const stageLabel = document.getElementById('stage-start-label');
  const backLink = document.querySelector('.convo-top .pill.back');

  const noop = () => {};
  const avatar = window.createAvatar
    ? window.createAvatar(stage)
    : { startTalking: noop, stopTalking: noop, pulse: noop, setListening: noop, destroy: noop };

  document.getElementById('demo-note').hidden = !!CHAT_ENDPOINT;

  // What this browser can do.
  const synth = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext || null;

  // ---- Which teacher: 'loading' until /config answers, then 'video' | 'voice' | 'browser' ----
  let mode = API_BASE ? 'loading' : 'browser';
  // The video session. state: 'off' (not video mode) | 'idle' (before Start) | 'connecting' | 'live' | 'ended'
  const sim = {
    state: 'off',
    client: null,
    attempt: 0,        // bumped whenever a session is dropped, so late answers from an old attempt are ignored
    startedAt: 0,
    lastAudioEnd: 0,   // when the last audio sent to Simli finishes playing (for the idle limit)
    watchdog: null,
    talkTimer: null,   // set while the teacher is saying something we sent
    finishTimer: null, // stops the session after the last line of a finished conversation
    heardSpeaking: false,
  };
  let pendingEntry = null; // a teacher line waiting for the video to start
  let voiceNoteShown = false;

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
    else if (sim.state === 'connecting') text = t('connecting');
    else if (note) { text = t(note); warn = note !== 'didnt_hear'; }
    else if (SR) text = t('tap_to_talk');
    else { text = t('no_speech_support'); warn = true; }
    status.textContent = text;
    status.classList.toggle('warn', warn);

    hideLabel.textContent = transcriptHidden ? t('show') : t('hide');
    hideBtn.setAttribute('aria-label', transcriptHidden ? t('show_transcript') : t('hide_transcript'));
    hideBtn.setAttribute('aria-expanded', String(!transcriptHidden));
    input.setAttribute('aria-label', t('type_answer'));
    renderStage();
  }

  // Start / Connecting… / Continue button over the stage, and the video in place of the drawing.
  function renderStage() {
    const isVideo = mode === 'video';
    const live = isVideo && sim.state === 'live';
    const connecting = sim.state === 'connecting';
    // After the 40-message end there is nothing left to say: no Start / Continue until "Start over".
    stageBtn.hidden = !isVideo || !(connecting || (!ended && (sim.state === 'idle' || sim.state === 'ended')));
    stageBtn.disabled = connecting;
    stageBtn.setAttribute('aria-busy', String(connecting));
    stageLabel.textContent = t(connecting ? 'connecting' : sim.state === 'ended' ? 'continue_video' : 'start_conversation');
    // The video stays in the layout while connecting (under the drawing) so its first frame can arrive.
    videoEl.hidden = !isVideo;
    stage.classList.toggle('video-on', live);
  }

  // ---- Transcript ----
  const entries = []; // one per You/Teacher line: { text, trEl, cache, failed, pending }
  let interimEl = null;

  function nearBottom() { return lines.scrollHeight - lines.scrollTop - lines.clientHeight < 40; }
  function scrollToEnd() { lines.scrollTop = lines.scrollHeight; }

  // entry.audio keeps the teacher's recorded voice for that line, so "Hear again" never asks /speak twice.
  function addLine(who, text) {
    const entry = { text, trEl: null, cache: {}, failed: {}, pending: {}, audio: null };
    const li = document.createElement('li');
    li.className = `line ${who}`;
    const head = document.createElement('div');
    head.className = 'line-head';
    const label = document.createElement('span');
    label.className = 'who';
    label.dataset.label = who === 'teacher' ? 'teacher_label' : 'you_label';
    head.appendChild(label);
    if (who === 'teacher' && canSpeak()) {
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'hear-again';
      again.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg><span data-label="hear_again"></span>';
      again.addEventListener('click', () => {
        stopListening(true);
        hearFirst.hidden = true;
        speakEntry(entry);
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
    entry.trEl = tr;
    entries.push(entry);
    showTranslation(entry);
    scrollToEnd();
    return entry;
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

  // Stops whatever the teacher is saying, in every mode. Also how the student interrupts her.
  function stopSpeaking() {
    speakToken++;
    if (synth) synth.cancel();
    stopVoiceSource();
    if (sim.talkTimer) {
      clearTalk();
      if (sim.client) {
        try { sim.client.ClearBuffer(); } catch { /* the session is already gone */ }
      }
    }
    setSpeaking(false);
  }

  function canSpeak() { return !!synth || mode === 'voice' || mode === 'video'; }

  // Says one teacher line with the best voice available right now.
  // onBlocked: called if the browser won't start speech yet (no tap on the page so far).
  async function speakEntry(entry, onBlocked) {
    stopSpeaking();
    hearFirst.hidden = true;
    if (mode !== 'voice' && mode !== 'video') { speakBrowser(entry.text, onBlocked); return; }
    const token = speakToken;
    if (!videoLive()) {
      // Web Audio needs a tap on the page first. Don't pay for audio nobody can hear yet.
      const ctx = getAudioCtx();
      if (!ctx) { speakBrowser(entry.text, onBlocked); return; }
      const allowed = await audioAllowed(ctx);
      if (token !== speakToken) return;
      if (!allowed) { showHearFirst(entry); return; }
    }
    if (!entry.audio) {
      try {
        entry.audio = await fetchSpeech(entry.text);
      } catch {
        if (token !== speakToken) return;
        // The server's voice failed: the browser's voice reads this line instead.
        voiceTrouble();
        speakBrowser(entry.text, onBlocked);
        return;
      }
      if (token !== speakToken) return;
    }
    if (videoLive() && sendToSimli(entry.audio)) return;
    playPcm(entry, token);
  }

  function voiceTrouble() {
    if (voiceNoteShown) return;
    voiceNoteShown = true;
    addNote(t('voice_failed'));
  }

  // The teacher's line as raw PCM16, 16 kHz, mono. Longer than /speak allows: ask in pieces and join them.
  async function fetchSpeech(text) {
    const parts = text.length > MAX_CHARS ? chunks(text, MAX_CHARS) : [text];
    const buffers = [];
    for (const part of parts) buffers.push(await fetchSpeechPart(part));
    if (buffers.length === 1) return buffers[0];
    const sizes = buffers.map(b => b.byteLength - (b.byteLength % 2));
    const joined = new Uint8Array(sizes.reduce((a, b) => a + b, 0));
    let offset = 0;
    buffers.forEach((b, i) => { joined.set(new Uint8Array(b, 0, sizes[i]), offset); offset += sizes[i]; });
    return joined.buffer;
  }

  async function fetchSpeechPart(text) {
    let res;
    try {
      res = await fetchWithTimeout(API_BASE + '/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }, SPEAK_TIMEOUT_MS);
    } catch {
      throw new Error(t('network_error'));
    }
    if (!res.ok) throw await serverError(res);
    const buf = await res.arrayBuffer();
    if (!buf || buf.byteLength < 2) throw new Error('No audio');
    return buf;
  }

  // ---- Voice mode: play the PCM with Web Audio ----
  let audioCtx = null;
  let voiceSource = null;

  function getAudioCtx() {
    if (!audioCtx && AudioCtx) {
      try { audioCtx = new AudioCtx(); } catch { audioCtx = null; }
    }
    return audioCtx;
  }

  async function audioAllowed(ctx) {
    if (ctx.state === 'running') return true;
    try {
      await Promise.race([ctx.resume(), wait(AUDIO_UNLOCK_WAIT_MS)]);
    } catch { /* still blocked */ }
    return ctx.state === 'running';
  }

  // Browsers allow sound only after a tap, so wake the audio on every tap and key press.
  function unlockAudio() {
    if (mode !== 'voice' && mode !== 'video' && mode !== 'loading') return;
    const ctx = getAudioCtx();
    if (ctx && ctx.state !== 'running' && ctx.resume) ctx.resume().catch(noop);
  }
  ['pointerdown', 'click', 'keydown', 'touchend'].forEach(type => document.addEventListener(type, unlockAudio, true));

  async function playPcm(entry, token) {
    const ctx = getAudioCtx();
    if (!ctx) { speakBrowser(entry.text); return; }
    const allowed = await audioAllowed(ctx);
    if (token !== speakToken) return;
    if (!allowed) { showHearFirst(entry); return; }
    const buf = entry.audio;
    const count = Math.floor(buf.byteLength / 2);
    const view = new DataView(buf);
    let audioBuffer;
    try {
      audioBuffer = ctx.createBuffer(1, count, 16000);
    } catch {
      speakBrowser(entry.text);
      return;
    }
    const samples = audioBuffer.getChannelData(0);
    for (let i = 0; i < count; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => {
      if (voiceSource !== source) return;
      voiceSource = null;
      if (token === speakToken) setSpeaking(false);
    };
    voiceSource = source;
    source.start();
    setSpeaking(true);
  }

  function stopVoiceSource() {
    const source = voiceSource;
    if (!source) return;
    voiceSource = null;
    source.onended = null;
    try { source.stop(); } catch { /* already stopped */ }
  }

  // ---- Browser voice (speechSynthesis) ----
  function speakBrowser(text, onBlocked) {
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

  function showHearFirst(entry) {
    hearFirst.hidden = false;
    hearFirst.onclick = () => {
      hearFirst.hidden = true;
      speakEntry(entry);
    };
  }

  // ---- Video teacher (Simli) ----
  // Nothing connects before the student taps Start: every minute of video costs money,
  // and browsers need a tap before sound can play.
  function videoLive() { return mode === 'video' && sim.state === 'live' && !!sim.client; }

  async function loadMode() {
    if (!API_BASE) return 'browser';
    let cfg = null;
    try {
      const res = await fetchWithTimeout(API_BASE + '/config', { method: 'GET' }, CONFIG_TIMEOUT_MS);
      if (res.ok) cfg = await res.json();
    } catch { /* no answer: use the browser's own voice */ }
    if (!cfg || cfg.voice !== true || !AudioCtx) return 'browser';
    if (cfg.face === true && typeof window.SimliClient === 'function') return 'video';
    return 'voice';
  }

  const modeReady = loadMode().then(m => {
    mode = m;
    if (m === 'video') sim.state = 'idle';
    render();
    return m;
  });

  async function fetchSimliToken() {
    let res;
    try {
      res = await fetchWithTimeout(API_BASE + '/simli-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }, TOKEN_TIMEOUT_MS);
    } catch {
      throw new Error(t('network_error'));
    }
    if (!res.ok) throw await serverError(res);
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (!data || typeof data.session_token !== 'string' || !data.session_token) throw new Error('No session token');
    return data.session_token;
  }

  // Start and Continue both come here: a new token and a new session. History is kept.
  async function startVideo() {
    if (mode !== 'video' || (sim.state !== 'idle' && sim.state !== 'ended')) return;
    unlockAudio(); // inside the tap, so the voice-only fallback can play too
    const attempt = ++sim.attempt;
    sim.state = 'connecting';
    render();
    let client = null;
    try {
      const token = await fetchSimliToken();
      if (attempt !== sim.attempt) return;
      const level = window.SimliLogLevel && typeof window.SimliLogLevel.ERROR === 'number' ? window.SimliLogLevel.ERROR : 2;
      client = new window.SimliClient(token, videoEl, audioEl, null, level, 'livekit');
      sim.client = client;
      listenToSimli(client);
      await withTimeout(client.start(), VIDEO_CONNECT_TIMEOUT_MS);
      if (attempt !== sim.attempt) return;
      goLive(client);
    } catch {
      if (attempt !== sim.attempt) return; // dropped on purpose (left the page)
      sim.attempt++;
      sim.client = null;
      if (client) stopClient(client);
      fallBackToVoice();
    }
  }

  function listenToSimli(client) {
    const mine = () => sim.client === client;
    client.on('start', () => { if (mine()) goLive(client); });
    client.on('speaking', () => {
      if (!mine() || !sim.talkTimer) return;
      sim.heardSpeaking = true;
      setSpeaking(true);
    });
    client.on('silent', () => {
      // Only after she really started, so an early "silent" doesn't end the line.
      if (mine() && sim.talkTimer && sim.heardSpeaking) videoTalkDone();
    });
    // While connecting, start() reports failures itself (and Simli retries on its own).
    const onEnd = () => { if (mine() && sim.state === 'live') endVideo(true); };
    client.on('stop', onEnd);
    client.on('error', onEnd);
    client.on('startup_error', onEnd);
  }

  function goLive(client) {
    if (sim.client !== client || sim.state !== 'connecting') return;
    sim.state = 'live';
    sim.startedAt = Date.now();
    sim.lastAudioEnd = sim.startedAt;
    clearInterval(sim.watchdog);
    sim.watchdog = setInterval(checkVideoLimits, 2000);
    try {
      const p = audioEl.play();
      if (p && p.catch) p.catch(noop);
    } catch { /* Simli plays it when it can */ }
    stopSpeaking(); // a voice-only line from while the video was off
    render();
    if (pendingEntry) {
      const entry = pendingEntry;
      pendingEntry = null;
      speakEntry(entry);
    } else if (history.length === 0 && !busy && !ended) {
      requestReply();
    }
  }

  // Simli ends a session after 10 minutes, or 2 minutes with no audio. End it ourselves just before,
  // so the page shows Continue instead of a frozen face.
  function checkVideoLimits() {
    if (sim.state !== 'live') return;
    const now = Date.now();
    if (now - sim.startedAt >= VIDEO_MAX_MS - VIDEO_END_EARLY_MS ||
        now - sim.lastAudioEnd >= VIDEO_IDLE_MS - VIDEO_END_EARLY_MS) {
      endVideo(!ended);
    }
  }

  // Sends one line to Simli in ~6000-byte pieces (even sizes: 2 bytes per sample). Simli plays it, lip-synced.
  function sendToSimli(buf) {
    const client = sim.client;
    const total = buf.byteLength - (buf.byteLength % 2);
    try {
      for (let offset = 0; offset < total; offset += SIMLI_CHUNK_BYTES) {
        client.sendAudioData(new Uint8Array(buf, offset, Math.min(SIMLI_CHUNK_BYTES, total - offset)));
      }
    } catch {
      endVideo(true);
      return false;
    }
    const ms = (total / PCM_BYTES_PER_SECOND) * 1000;
    sim.lastAudioEnd = Date.now() + ms;
    sim.heardSpeaking = false;
    clearTimeout(sim.talkTimer);
    // In case 'silent' never arrives.
    sim.talkTimer = setTimeout(videoTalkDone, ms + TALK_SAFETY_MS);
    clearTimeout(sim.finishTimer);
    sim.finishTimer = null;
    if (ended) {
      // The conversation is over: stop paying once she has said goodbye.
      sim.finishTimer = setTimeout(() => { if (ended && sim.state === 'live') endVideo(false); }, ms + TALK_SAFETY_MS + 1500);
    }
    setSpeaking(true);
    return true;
  }

  function videoTalkDone() {
    clearTalk();
    setSpeaking(false);
  }

  function clearTalk() {
    clearTimeout(sim.talkTimer);
    sim.talkTimer = null;
    sim.heardSpeaking = false;
  }

  function stopClient(client) {
    try {
      return Promise.resolve(client.stop()).catch(noop);
    } catch {
      return Promise.resolve();
    }
  }

  // Ends the video session so minutes stop counting. The conversation itself carries on (voice only).
  function endVideo(showNote) {
    const client = sim.client;
    const wasTalking = !!sim.talkTimer;
    sim.client = null;
    sim.attempt++;
    clearInterval(sim.watchdog);
    sim.watchdog = null;
    clearTimeout(sim.finishTimer);
    sim.finishTimer = null;
    clearTalk();
    const stopped = client ? stopClient(client) : Promise.resolve();
    if (sim.state === 'connecting' || sim.state === 'live') {
      sim.state = 'ended';
      if (wasTalking) setSpeaking(false);
      if (showNote) addNote(t('video_ended'));
      render();
    }
    return stopped;
  }

  // Token or start() failed: keep going with the voice alone.
  function fallBackToVoice() {
    mode = 'voice';
    sim.state = 'off';
    addNote(t('video_failed'));
    render();
    if (pendingEntry) {
      const entry = pendingEntry;
      pendingEntry = null;
      speakEntry(entry);
    } else if (history.length === 0 && !busy && !ended) {
      requestReply();
    }
  }

  stageBtn.addEventListener('click', startVideo);

  // A new teacher line. In video mode the opening line waits for the student to tap Start.
  function deliver(entry, opening) {
    if (mode === 'video' && (sim.state === 'connecting' || (opening && sim.state !== 'live'))) {
      pendingEntry = entry;
      return;
    }
    pendingEntry = null;
    speakEntry(entry, opening ? () => showHearFirst(entry) : null);
  }

  // ---- Server helpers ----
  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  function withTimeout(promise, ms) {
    let timer = null;
    const timeout = new Promise((resolve, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  async function fetchWithTimeout(url, options, ms) {
    const controller = window.AbortController ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), ms) : null;
    try {
      return await fetch(url, controller ? Object.assign({}, options, { signal: controller.signal }) : options);
    } finally {
      clearTimeout(timer);
    }
  }

  async function serverError(res) {
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    return new Error((data && typeof data.error === 'string' && data.error) || t('network_error'));
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
    await modeReady; // which voice to use (and whether "Hear again" can work)
    busy = false;
    history.push({ role: 'assistant', content: reply });
    const entry = addLine('teacher', reply);

    // No room for another student message: finish kindly.
    if (history.length + 1 > MAX_MESSAGES) {
      ended = true;
      stopListening(true);
      addLine('teacher', END_LINE);
      render();
      pendingEntry = null;
      speakEntry({ text: `${reply} ${END_LINE}`, audio: null });
      return;
    }
    render();
    deliver(entry, opening);
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
    pendingEntry = null;
    clearTimeout(sim.finishTimer);
    sim.finishTimer = null;
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

  // Don't keep talking or listening after leaving the page, and stop the video so minutes stop counting.
  window.addEventListener('pagehide', () => {
    if (synth) synth.cancel();
    if (rec) rec.abort();
    stopVoiceSource();
    endVideo(false);
  });
  window.addEventListener('beforeunload', () => { endVideo(false); });
  // Back from the browser's page cache: the session was stopped, so show Continue.
  window.addEventListener('pageshow', e => { if (e.persisted) render(); });

  // Go Back: stop the video first (briefly), then leave.
  if (backLink) {
    backLink.addEventListener('click', e => {
      if (!sim.client || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const href = backLink.href;
      Promise.race([endVideo(false), wait(1000)]).then(() => { location.href = href; });
    });
  }

  updateTopicText();
  updatePicker();
  render();
  begin();
})();
