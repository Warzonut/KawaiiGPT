const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const clearBtn = document.getElementById('clearBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const chatTitle = document.getElementById('chatTitle');
const chatHistoryList = document.getElementById('chatHistoryList');
const noHistory = document.getElementById('noHistory');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const urlBadgeBar = document.getElementById('urlBadgeBar');

// ── URL detection & fetch ────────────────────────────────────────────────────
const URL_DETECT_RE = /https?:\/\/[^\s<>"']+/gi;

// Cache: url → { status: 'loading'|'ready'|'error', text: string }
const urlFetchCache = new Map();

function extractURLs(text) {
    return [...new Set((text.match(URL_DETECT_RE) || []).map(u => u.replace(/[.,;!?)]+$/, '')))];
}

function renderURLBadges(urls) {
    if (!urlBadgeBar) return;
    urlBadgeBar.innerHTML = '';
    if (urls.length === 0) {
        urlBadgeBar.style.display = 'none';
        return;
    }
    urlBadgeBar.style.display = 'flex';
    urls.forEach(url => {
        const entry = urlFetchCache.get(url) || { status: 'loading' };
        const badge = document.createElement('div');
        badge.className = 'url-badge ' + entry.status;
        badge.dataset.url = url;

        const SVG_LINK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-4.95-4.95l1.17-1.17a.75.75 0 0 1 1.06 1.06L3.084 9.086a2 2 0 0 0 2.829 2.828l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Zm-3.84 1.96a.75.75 0 0 1-1.061 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 4.95 4.95l-1.17 1.17a.75.75 0 1 1-1.06-1.06l1.17-1.17a2 2 0 0 0-2.829-2.828l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" clip-rule="evenodd"/></svg>';
        const SVG_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="2,6.5 4.5,9 10,3"/></svg>';
        const SVG_X     = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="12" height="12"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>';
        const SVG_SPIN  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" width="12" height="12" style="animation:badgeSpin 1s linear infinite"><circle cx="6" cy="6" r="4" stroke-dasharray="18 8" stroke-linecap="round"/></svg>';

        const icon = document.createElement('span');
        icon.className = 'url-badge-icon';
        icon.innerHTML = SVG_LINK;

        const label = document.createElement('span');
        label.className = 'url-badge-label';
        label.title = url;
        try { label.textContent = new URL(url).hostname; } catch { label.textContent = url.slice(0, 40); }

        const status = document.createElement('span');
        status.className = 'url-badge-status';
        status.innerHTML = entry.status === 'loading' ? SVG_SPIN : entry.status === 'ready' ? SVG_CHECK : SVG_X;

        badge.appendChild(icon);
        badge.appendChild(label);
        badge.appendChild(status);
        urlBadgeBar.appendChild(badge);
    });
}

async function fetchAndCacheURL(url) {
    if (urlFetchCache.has(url)) return;
    urlFetchCache.set(url, { status: 'loading', text: '' });
    try {
        const isGithubBlob = GITHUB_BLOB_RE ? GITHUB_BLOB_RE.test(url) : /github\.com\/[^/\s]+\/[^/\s]+\/blob\//.test(url);
        let text = '';
        if (isGithubBlob) {
            // Use the GitHub raw-file endpoint for blob URLs
            const resp = await fetch('/github-fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            text = data.content || '';
        } else {
            const resp = await fetch('/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            text = data.text || '';
        }
        urlFetchCache.set(url, { status: 'ready', text });
    } catch (e) {
        urlFetchCache.set(url, { status: 'error', text: '' });
    }
}

let urlDebounceTimer = null;
function onInputURLDetect() {
    clearTimeout(urlDebounceTimer);
    urlDebounceTimer = setTimeout(async () => {
        const urls = extractURLs(userInput.value);
        renderURLBadges(urls);
        for (const url of urls) {
            if (!urlFetchCache.has(url)) {
                await fetchAndCacheURL(url);
                renderURLBadges(extractURLs(userInput.value));
            }
        }
    }, 400);
}

function buildMessageWithURLContext(text) {
    const urls = extractURLs(text);
    const chunks = [];
    for (const url of urls) {
        const entry = urlFetchCache.get(url);
        if (entry && entry.status === 'ready' && entry.text) {
            chunks.push(`[Content fetched from ${url}]\n${entry.text}\n[End of fetched content]`);
        }
    }
    if (chunks.length === 0) return text;
    return text + '\n\n' + chunks.join('\n\n');
}

function clearURLBadges() {
    if (urlBadgeBar) { urlBadgeBar.innerHTML = ''; urlBadgeBar.style.display = 'none'; }
}
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'kawaiiGPT_chats';
const codeStore = {};

const PREVIEW_LANGS = new Set(['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'python', 'py', 'json']);
const RUN_LANGS = new Set(['html', 'css', 'javascript', 'js']);

const SVG_CHEVRON_RIGHT = '<svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor" style="display:inline-block;vertical-align:middle"><polygon points="1,1 7,5 1,9"/></svg>';
const SVG_CHEVRON_DOWN  = '<svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor" style="display:inline-block;vertical-align:middle"><polygon points="1,1 9,1 5,7"/></svg>';
const SVG_CLOSE         = '<svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="display:inline-block;vertical-align:middle"><line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/></svg>';

let conversationHistory = [];
let displayMessages = [];
let isStreaming = false;
let currentMode = 'chat';
let searchEnabled = localStorage.getItem('searchEnabled') !== 'false';
let currentChatId = generateId();
let messageQueue = [];
let editingQueueId = null;
const originalSendBtnHTML = sendBtn ? sendBtn.innerHTML : null;

// SVG icons
const SVG = {
    chat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM6 9a1 1 0 11-2 0 1 1 0 012 0zm7 1a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>`,
    drag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><circle cx="5.5" cy="3.5" r="1.25"/><circle cx="5.5" cy="8" r="1.25"/><circle cx="5.5" cy="12.5" r="1.25"/><circle cx="10.5" cy="3.5" r="1.25"/><circle cx="10.5" cy="8" r="1.25"/><circle cx="10.5" cy="12.5" r="1.25"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" /></svg>`,
    retry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" /></svg>`,
    brain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" /></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>`,
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clip-rule="evenodd" /></svg>`,
};

// ── Thinking panel helpers ────────────────────────────────────────────────────

function createThinkingPanel() {
    const panel = document.createElement('div');
    panel.className = 'thinking-panel collapsed';

    const header = document.createElement('button');
    header.className = 'thinking-header';
    header.addEventListener('click', () => panel.classList.toggle('collapsed'));

    const icon = document.createElement('span');
    icon.className = 'thinking-icon';
    icon.innerHTML = SVG.brain;

    const statusEl = document.createElement('span');
    statusEl.className = 'thinking-status';
    statusEl.textContent = 'Thinking...';

    const chevron = document.createElement('span');
    chevron.className = 'thinking-chevron';
    chevron.innerHTML = SVG.chevronDown;

    header.appendChild(icon);
    header.appendChild(statusEl);
    header.appendChild(chevron);

    const body = document.createElement('div');
    body.className = 'thinking-body';

    const textEl = document.createElement('div');
    textEl.className = 'thinking-text';

    body.appendChild(textEl);
    panel.appendChild(header);
    panel.appendChild(body);

    return { el: panel, statusEl, textEl, body };
}

function updateThinkingText(tp, text) {
    if (text) tp.textEl.textContent = text;
}

function finalizeThinking(tp, elapsedSec, finalText) {
    tp.el.classList.add('done');
    tp.el.classList.add('collapsed');
    tp.statusEl.textContent = `Thought for ${elapsedSec}s`;
    if (finalText) tp.textEl.textContent = finalText;
}

// ─────────────────────────────────────────────────────────────────────────────

marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: null
});

const renderer = new marked.Renderer();
renderer.code = function(token) {
    const code = typeof token === 'object' ? (token.text || '') : token;
    const language = (typeof token === 'object' ? token.lang : arguments[1]) || 'plaintext';
    const lang = (language || 'plaintext').toLowerCase();
    const id = 'code-' + Math.random().toString(36).substr(2, 9);
    codeStore[id] = code;
    const hasPreview = PREVIEW_LANGS.has(lang);
    const previewBtn = hasPreview
        ? `<button class="preview-btn" onclick="togglePreview('${id}')">${SVG_CHEVRON_RIGHT} Preview</button>`
        : '';
    return `
        <div class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-lang">${lang}</span>
                <div class="code-actions">
                    ${previewBtn}
                    <button class="copy-btn" onclick="copyCode('${id}')">Copy</button>
                </div>
            </div>
            <pre><code id="${id}" class="language-${lang}">${escapeHtml(code)}</code></pre>
        </div>
    `;
};

marked.use({ renderer });

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function decodeHtmlEntities(str) {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
}

function copyCode(id) {
    const el = document.getElementById(id);
    const btn = el.closest('.code-block-wrapper').querySelector('.copy-btn');
    navigator.clipboard.writeText(el.innerText).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    });
}

function enqueueMessage(text) {
    const id = 'queued-' + generateId();
    const item = { id, text, ts: Date.now() };
    messageQueue.push(item);
    console.debug('[DEBUG] enqueueMessage', { id, textPreview: text.slice(0, 120) });
    renderQueueUI();
    return item;
}

function renderQueueUI() {
    const container = document.getElementById('queuedList');
    if (!container) return;
    console.debug('[DEBUG] renderQueueUI queueLength=', messageQueue.length);
    container.innerHTML = '';
    if (messageQueue.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';
    messageQueue.forEach((q) => {
        const el = document.createElement('div');
        el.className = 'queued-item';
        el.id = q.id;
        const textEl = document.createElement('div');
        textEl.className = 'queued-text';
        textEl.title = q.text;
        textEl.textContent = q.text.length > 120 ? q.text.slice(0, 120) + '...' : q.text;

        const actions = document.createElement('div');
        actions.className = 'queued-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'queued-edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editQueued(q.id));

        const removeBtn = document.createElement('button');
        removeBtn.className = 'queued-remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeQueued(q.id));

        actions.appendChild(editBtn);
        actions.appendChild(removeBtn);

        el.appendChild(textEl);
        el.appendChild(actions);
        container.appendChild(el);
    });
}

function editQueued(id) {
    const q = messageQueue.find(x => x.id === id);
    if (!q) return;
    console.debug('[DEBUG] editQueued', { id, preview: q.text.slice(0, 120) });
    editingQueueId = id;
    userInput.value = q.text;
    userInput.focus();
    autoResize();
    if (originalSendBtnHTML) sendBtn.innerHTML = 'Update';
    sendBtn.dataset.mode = 'update';
}

function removeQueued(id) {
    console.debug('[DEBUG] removeQueued', { id });
    messageQueue = messageQueue.filter(x => x.id !== id);
    renderQueueUI();
}

function processQueue() {
    console.debug('[DEBUG] processQueue start', { isStreaming, queueLength: messageQueue.length });
    if (isStreaming) return;
    if (messageQueue.length === 0) {
        renderQueueUI();
        return;
    }
    const next = messageQueue.shift();
    console.debug('[DEBUG] processQueue dequeue', { id: next.id, preview: next.text.slice(0, 120) });
    renderQueueUI();
    setTimeout(() => sendMessage(next.text), 120);
}

// ── Edit / Delete user messages ──────────────────────────────────────────────

function removeUserMessageAndAfter(msgDiv, restoreToInput) {
    if (isStreaming) return;
    const allMsgs = [...messagesContainer.querySelectorAll('.message')];
    const idx = allMsgs.indexOf(msgDiv);
    if (idx < 0) return;

    const originalText = displayMessages[idx] ? displayMessages[idx].content : '';

    displayMessages = displayMessages.slice(0, idx);
    conversationHistory = conversationHistory.slice(0, idx);
    allMsgs.slice(idx).forEach(el => el.remove());

    if (displayMessages.length === 0) {
        restoreWelcomeScreen();
    }

    if (restoreToInput) {
        userInput.value = originalText;
        userInput.focus();
        autoResize();
    }

    saveCurrentChat();
}

// ─────────────────────────────────────────────────────────────────────────────

function buildPreviewContent(lang, code) {
    if (lang === 'html') {
        const trimmed = (code || '').trim();
        if (/^<!doctype/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
            return code;
        }
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/">
            <style>html,body{height:100%;margin:0;background:#fff;color:#111;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}</style>
        </head><body>${code}</body></html>`;
    }
    if (lang === 'css') {
        return `<!DOCTYPE html><html><head><style>
            body { font-family: sans-serif; padding: 24px; background: #fff; }
            h1,h2,h3 { margin: 8px 0; } p { margin: 8px 0; }
            ul { padding-left: 20px; }
        </style><style>${code}</style></head><body>
            <h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>
            <p>Paragraph with <a href="#">a link</a> and <strong>bold</strong> text.</p>
            <button>Button</button> <input placeholder="Input field">
            <ul><li>List item one</li><li>List item two</li></ul>
        </body></html>`;
    }
    if (lang === 'javascript' || lang === 'js') {
        return `<!DOCTYPE html><html><head><style>
            body { background:#0f0f13; color:#f0f0f5; font-family:monospace; padding:16px; margin:0; }
            #output { white-space:pre-wrap; font-size:13px; line-height:1.6; }
            .err { color:#f87171; } .log { color:#f0f0f5; } .info { color:#60a5fa; } .warn { color:#fb923c; }
            .label { color:#a78bfa; font-size:11px; margin-bottom:8px; }
        </style></head><body>
            <div class="label">${SVG_CHEVRON_RIGHT} Console Output</div>
            <div id="output"></div>
            <script>
                const _o = document.getElementById('output');
                const _fmt = (a) => a.map(x => typeof x === 'object' ? JSON.stringify(x,null,2) : String(x)).join(' ');
                console.log = (...a) => _o.innerHTML += '<span class="log">'+_fmt(a)+'</span>\\n';
                console.error = (...a) => _o.innerHTML += '<span class="err">'+_fmt(a)+'</span>\\n';
                console.info = (...a) => _o.innerHTML += '<span class="info">'+_fmt(a)+'</span>\\n';
                console.warn = (...a) => _o.innerHTML += '<span class="warn">'+_fmt(a)+'</span>\\n';
                try { ${code} } catch(e) { _o.innerHTML += '<span class="err">Error: '+e.message+'</span>'; }
            <\/script>
        </body></html>`;
    }
    if (lang === 'json') {
        try {
            const parsed = JSON.parse(code);
            const formatted = JSON.stringify(parsed, null, 2)
                .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                .replace(/"([^"]+)":/g, '<span style="color:#a78bfa">"$1"</span>:')
                .replace(/: "([^"]*)"/g, ': <span style="color:#34d399">"$1"</span>')
                .replace(/: (-?\d+\.?\d*)/g, ': <span style="color:#fb923c">$1</span>')
                .replace(/: (true|false)/g, ': <span style="color:#60a5fa">$1</span>')
                .replace(/: (null)/g, ': <span style="color:#94a3b8">$1</span>');
            return `<!DOCTYPE html><html><head><style>
                body{background:#0f0f13;color:#f0f0f5;font-family:monospace;padding:16px;margin:0;font-size:13px;line-height:1.6;}
                .label{color:#a78bfa;font-size:11px;margin-bottom:8px;}
            </style></head><body><div class="label">${SVG_CHEVRON_RIGHT} JSON Preview</div><pre>${formatted}</pre></body></html>`;
        } catch (e) {
            return `<!DOCTYPE html><html><body style="background:#0f0f13;color:#f87171;padding:16px;font-family:monospace;">Invalid JSON: ${e.message}</body></html>`;
        }
    }
    if (lang === 'python' || lang === 'py') {
        return `<!DOCTYPE html><html><head><style>
            body{background:#0f0f13;color:#f0f0f5;font-family:monospace;padding:16px;margin:0;font-size:13px;line-height:1.6;}
            .note{color:#a78bfa;font-size:11px;padding:8px 12px;border:1px solid rgba(167,139,250,0.3);border-radius:6px;margin-bottom:12px;}
            pre{margin:0;white-space:pre-wrap;}
        </style></head><body>
            <div class="note">Python runs server-side — showing read-only preview</div>
            <pre>${escapeHtml(code)}</pre>
        </body></html>`;
    }
    if (lang === 'typescript' || lang === 'ts') {
        return `<!DOCTYPE html><html><head><style>
            body{background:#0f0f13;color:#f0f0f5;font-family:monospace;padding:16px;margin:0;font-size:13px;line-height:1.6;}
            .note{color:#60a5fa;font-size:11px;padding:8px 12px;border:1px solid rgba(96,165,250,0.3);border-radius:6px;margin-bottom:12px;}
            pre{margin:0;white-space:pre-wrap;}
        </style></head><body>
            <div class="note">TypeScript requires compilation — showing read-only preview</div>
            <pre>${escapeHtml(code)}</pre>
        </body></html>`;
    }
    return `<!DOCTYPE html><html><body style="background:#0f0f13;color:#f0f0f5;padding:16px;font-family:monospace;">${escapeHtml(code)}</body></html>`;
}

// Collect every code block within the same message bubble as codeEl
function gatherMessageBlocks(codeEl) {
    const bubble = codeEl.closest('.message-content') || codeEl.closest('.message') || document.body;
    const blocks = { html: '', css: '', js: '', json: '', python: '', typescript: '' };
    bubble.querySelectorAll('code[id]').forEach(el => {
        const lang = el.className.replace('language-', '').toLowerCase();
        const raw = codeStore[el.id] || el.textContent || '';
        const code = decodeHtmlEntities(raw);
        if (lang === 'html')                          blocks.html += code;
        else if (lang === 'css')                      blocks.css  += '\n' + code;
        else if (lang === 'javascript' || lang === 'js') blocks.js += '\n' + code;
        else if (lang === 'json')                     blocks.json  = code;
        else if (lang === 'python' || lang === 'py')  blocks.python = code;
        else if (lang === 'typescript' || lang === 'ts') blocks.typescript = code;
    });
    return blocks;
}

// Build a merged HTML page from multiple blocks
function buildMergedContent(blocks) {
    const { html, css, js, json, python, typescript } = blocks;

    if (html) {
        const isFullDoc = /<!doctype/i.test(html) || /<html[\s>]/i.test(html);
        if (isFullDoc) {
            // Inject extra CSS/JS into a complete HTML document
            let doc = html;
            if (css)  doc = doc.replace('</head>', `<style>${css}</style>\n</head>`);
            if (js)   doc = doc.replace('</body>', `<script>\n${js}\n<\/script>\n</body>`);
            return doc;
        }
        // Partial HTML fragment
        return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>html,body{height:100%;margin:0;background:#fff;color:#111;font-family:system-ui,sans-serif}${css}</style>
</head><body>${html}<script>\n${js}\n<\/script></body></html>`;
    }
    if (css && js) {
        return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{font-family:sans-serif;padding:24px;background:#fff;}${css}</style>
</head><body>
<h1>CSS + JS Preview</h1><p>Paragraph</p><button>Button</button>
<script>\n${js}\n<\/script></body></html>`;
    }
    if (css)  return buildPreviewContent('css', css);
    if (js)   return buildPreviewContent('javascript', js);
    if (json) return buildPreviewContent('json', json);
    if (python) return buildPreviewContent('python', python);
    if (typescript) return buildPreviewContent('typescript', typescript);
    return null;
}

async function loadPreviewInIframe(iframe, content) {
    try {
        const resp = await fetch('/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        const { url } = await resp.json();
        iframe.src = url;
    } catch (e) {
        iframe.srcdoc = content; // fallback
    }
}

function togglePreview(id) {
    const codeEl = document.getElementById(id);
    if (!codeEl) return;
    const wrapper = codeEl.closest('.code-block-wrapper');
    const existing = wrapper.querySelector('.preview-panel');
    const btn = wrapper.querySelector('.preview-btn');

    if (existing) {
        const isHidden = existing.style.display === 'none';
        existing.style.display = isHidden ? 'block' : 'none';
        btn.innerHTML = isHidden ? SVG_CHEVRON_DOWN + ' Hide' : SVG_CHEVRON_RIGHT + ' Preview';
        return;
    }

    // Gather all blocks from this message and build merged content
    const blocks = gatherMessageBlocks(codeEl);
    const content = buildMergedContent(blocks) || buildPreviewContent(
        codeEl.className.replace('language-', '').toLowerCase(),
        decodeHtmlEntities(codeStore[id] || codeEl.textContent || '')
    );

    const hasMultiple = Object.values(blocks).filter(Boolean).length > 1;
    const lang = codeEl.className.replace('language-', '').toLowerCase().toUpperCase();
    const title = hasMultiple ? 'Merged Preview' : `Preview · ${lang}`;

    const panel = document.createElement('div');
    panel.className = 'preview-panel';

    const panelHeader = document.createElement('div');
    panelHeader.className = 'preview-panel-header';
    panelHeader.innerHTML = `
        <span class="preview-panel-title">${title}</span>
        <button class="preview-close-btn" onclick="togglePreview('${id}')">${SVG_CLOSE} Close</button>
    `;

    const iframe = document.createElement('iframe');
    iframe.className = 'preview-iframe';

    panel.appendChild(panelHeader);
    panel.appendChild(iframe);
    wrapper.appendChild(panel);

    loadPreviewInIframe(iframe, content);
    btn.innerHTML = SVG_CHEVRON_DOWN + ' Hide';
}

function addRetryButton(msgDiv) {
    const contentDiv = msgDiv.querySelector('.message-content');
    if (!contentDiv) return;
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    const btn = document.createElement('button');
    btn.className = 'retry-btn';
    btn.innerHTML = SVG.retry + ' Retry';
    btn.addEventListener('click', () => retryLastResponse(msgDiv));
    actions.appendChild(btn);
    contentDiv.appendChild(actions);
}

async function retryLastResponse(msgDiv) {
    console.debug('[DEBUG] retryLastResponse invoked', { isStreaming });
    if (isStreaming) return;

    conversationHistory.pop();
    displayMessages.pop();
    msgDiv.remove();

    isStreaming = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
        const payload = { messages: conversationHistory };

        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            removeTypingIndicator();
            throw new Error('Network response was not ok');
        }

        console.debug('[DEBUG] /chat response', { status: response.status });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let chunkCount = 0;

        const { bubble, contentDiv } = addMessage('bot', '');
        bubble.innerHTML = '';
        const newMsgDiv = contentDiv.closest('.message');
        let firstChunk = true;
        let rThinkingPanel = null, rThinkingStart = null, rThinkingDone = false;
        let rTwTarget = '', rTwPos = 0, rTwTimer = null, rStreamDone = false;

        function rGetMain() {
            let n = bubble.querySelector('.main-response');
            if (!n) { n = document.createElement('div'); n.className = 'main-response'; bubble.appendChild(n); }
            return n;
        }
        function rTwTick() {
            const mn = rGetMain();
            if (rTwPos < rTwTarget.length) {
                rTwPos = Math.min(rTwPos + 24, rTwTarget.length);
                mn.innerHTML = renderMarkdown(rTwTarget.slice(0, rTwPos));
                scrollToBottom();
            }
            if (rTwPos >= rTwTarget.length && rStreamDone) {
                clearInterval(rTwTimer); rTwTimer = null;
                mn.innerHTML = renderMarkdown(rTwTarget);
                highlightCodeBlocks(bubble); scrollToBottom();
            }
        }
        function rStartTypewriter() {
            if (rTwTimer === null) rTwTimer = setInterval(rTwTick, 16);
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            chunkCount += 1;
            fullText += chunk;
            if (firstChunk) { removeTypingIndicator(); firstChunk = false; }

            let thinkingText, mainText;
            const sepIdx = fullText.indexOf('\x02');
            if (sepIdx !== -1) {
                const thinkingRaw = fullText.slice(0, sepIdx);
                const afterSep    = fullText.slice(sepIdx + 1);
                if (thinkingRaw.includes('\x01')) {
                    thinkingText = thinkingRaw.replace(/\x01/g, '');
                    mainText = afterSep;
                } else {
                    thinkingText = '';
                    mainText = thinkingRaw + afterSep;
                }
            } else if (fullText.includes('\x01')) {
                thinkingText = fullText.replace(/\x01/g, '');
                mainText = '';
            } else {
                thinkingText = '';
                mainText = fullText;
            }

            if (thinkingText) {
                if (!rThinkingPanel) { rThinkingPanel = createThinkingPanel(); rThinkingStart = Date.now(); bubble.insertBefore(rThinkingPanel.el, bubble.firstChild); }
                updateThinkingText(rThinkingPanel, thinkingText);
            }
            if (rThinkingPanel && mainText && !rThinkingDone) {
                rThinkingDone = true;
                finalizeThinking(rThinkingPanel, ((Date.now() - rThinkingStart) / 1000).toFixed(1), rThinkingPanel.textEl.textContent);
            }
            // Start typewriter immediately when content arrives
            if (mainText) {
                rTwTarget = mainText;
                rStartTypewriter();
            }
        }

        if (firstChunk) removeTypingIndicator();
        rStreamDone = true;

        // Ensure typewriter is running (fallback if no thinking tokens were present)
        if (rTwTarget) rStartTypewriter();

        await new Promise(resolve => {
            if (rTwTimer === null) { resolve(); return; }
            const c = setInterval(() => { if (rTwTimer === null) { clearInterval(c); resolve(); } }, 50);
        });

        const rSepIdx = fullText.indexOf('\x02');
        const cleanText = rSepIdx === -1 ? fullText.replace(/\x01/g, '').trim() : fullText.slice(rSepIdx + 1).trim();

        conversationHistory.push({ role: 'assistant', content: cleanText });
        displayMessages.push({ role: 'bot', content: cleanText });
        saveCurrentChat();

        if (newMsgDiv) addRetryButton(newMsgDiv);

    } catch (error) {
        removeTypingIndicator();
        const errMsg = `Sorry, I ran into an error: ${error.message}. Please try again.`;
        addMessage('bot', errMsg);
        displayMessages.push({ role: 'bot', content: errMsg });
    } finally {
        isStreaming = false;
        sendBtn.disabled = userInput.value.trim() === '';
        if (messageQueue.length > 0) {
            setTimeout(processQueue, 150);
        }
    }
}

function renderMarkdown(text) {
    return marked.parse(text);
}

function highlightCodeBlocks(container) {
    container.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
}

function animateReveal(bubble, text, speed = 20) {
    bubble.innerHTML = '';
    if (!text) return;
    const minDuration = 120;
    const maxDuration = 2000;
    let targetDuration = 500;
    targetDuration = Math.max(minDuration, Math.min(maxDuration, targetDuration));
    const frameMs = 16;
    const steps = Math.max(2, Math.round(targetDuration / frameMs));
    const stepSize = Math.max(1, Math.ceil(text.length / steps));
    let i = 0;
    const totalSteps = Math.ceil(text.length / stepSize);
    const interval = Math.max(8, Math.round(targetDuration / totalSteps));
    const t = setInterval(() => {
        i += stepSize;
        if (i > text.length) i = text.length;
        bubble.innerHTML = renderMarkdown(text.slice(0, i));
        highlightCodeBlocks(bubble);
        scrollToBottom();
        if (i >= text.length) clearInterval(t);
    }, interval);
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

function getChats() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveChats(chats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function saveCurrentChat() {
    if (conversationHistory.length === 0) return;
    const chats = getChats();
    const title = chatTitle.textContent || 'New Chat';
    const idx = chats.findIndex(c => c.id === currentChatId);
    const chatData = {
        id: currentChatId,
        title,
        timestamp: Date.now(),
        messages: conversationHistory,
        displayMessages
    };
    if (idx >= 0) {
        chats[idx] = chatData;
    } else {
        chats.unshift(chatData);
    }
    saveChats(chats.slice(0, 50));
    renderHistoryList();
}

function renderHistoryList() {
    chatHistoryList.querySelectorAll('.history-item').forEach(el => el.remove());
    const chats = getChats();
    if (chats.length === 0) {
        noHistory.style.display = 'block';
        return;
    }
    noHistory.style.display = 'none';

    let dragSrcIndex = null;

    chats.forEach((chat, index) => {
        const item = document.createElement('div');
        item.className = 'history-item' + (chat.id === currentChatId ? ' active' : '');
        item.draggable = true;
        item.dataset.index = index;
        item.innerHTML = `
            <span class="history-drag-handle" title="Drag to reorder">${SVG.drag}</span>
            <span class="history-item-icon">${SVG.chat}</span>
            <div class="history-item-info">
                <span class="history-item-title">${escapeHtml(chat.title)}</span>
                <span class="history-item-time">${formatTimeAgo(chat.timestamp)}</span>
            </div>
            <button class="history-delete-btn" title="Delete">${SVG.close}</button>
        `;

        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = index;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index);
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            chatHistoryList.querySelectorAll('.history-item').forEach(el => el.classList.remove('drag-over'));
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            chatHistoryList.querySelectorAll('.history-item').forEach(el => el.classList.remove('drag-over'));
            if (dragSrcIndex !== index) item.classList.add('drag-over');
        });
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            if (dragSrcIndex === null || dragSrcIndex === index) return;
            const allChats = getChats();
            const [moved] = allChats.splice(dragSrcIndex, 1);
            allChats.splice(index, 0, moved);
            saveChats(allChats);
            renderHistoryList();
        });

        item.addEventListener('click', (e) => {
            if (!e.target.closest('.history-delete-btn') && !e.target.closest('.history-drag-handle')) {
                loadChat(chat.id);
            }
        });
        item.querySelector('.history-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        });
        chatHistoryList.appendChild(item);
    });
}

function loadChat(id) {
    const chats = getChats();
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    if (conversationHistory.length > 0 && currentChatId !== id) {
        saveCurrentChat();
    }
    currentChatId = id;
    conversationHistory = chat.messages || [];
    displayMessages = chat.displayMessages || [];
    chatTitle.textContent = chat.title || 'KawaiiGPT';
    messagesContainer.innerHTML = '';
    displayMessages.forEach(msg => {
        addMessage(msg.role, msg.content);
    });
    renderHistoryList();
    scrollToBottom();
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
}

function deleteChat(id) {
    const chats = getChats().filter(c => c.id !== id);
    saveChats(chats);
    if (currentChatId === id) {
        startNewChat();
    } else {
        renderHistoryList();
    }
}

function startNewChat() {
    if (conversationHistory.length > 0) {
        saveCurrentChat();
    }
    currentChatId = generateId();
    conversationHistory = [];
    displayMessages = [];
    clearChatUI();
    renderHistoryList();
}

function hideWelcome() {
    const ws = document.getElementById('welcomeScreen');
    if (ws && ws.parentNode) {
        ws.style.opacity = '0';
        ws.style.transform = 'translateY(-10px)';
        ws.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            if (ws.parentNode) ws.parentNode.removeChild(ws);
        }, 300);
    }
}

function restoreWelcomeScreen() {
    if (messagesContainer.querySelector('.welcome-screen')) return;
    const ws = document.createElement('div');
    ws.className = 'welcome-screen';
    ws.id = 'welcomeScreen';
    ws.innerHTML = `
        <div class="welcome-logo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="64" height="64"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.12"/><circle cx="9" cy="10.5" r="1.5" fill="currentColor"/><circle cx="15" cy="10.5" r="1.5" fill="currentColor"/><ellipse cx="7" cy="13.5" rx="2" ry="1.2" fill="currentColor" fill-opacity="0.35"/><ellipse cx="17" cy="13.5" rx="2" ry="1.2" fill="currentColor" fill-opacity="0.35"/><path d="M9 14.5 Q12 17.5 15 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></div>
        <h2>Welcome to KawaiiGPT</h2>
        <p>Your AI chatbot and code writing assistant. Ask me anything or pick a quick prompt to get started!</p>
        <div class="welcome-features">
            <div class="feature-card">
                <span class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path fill-rule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223 15.03 15.03 0 003-.165z" clip-rule="evenodd" /></svg></span>
                <h3>Smart Chat</h3>
                <p>Natural conversation with context memory</p>
            </div>
            <div class="feature-card">
                <span class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-10.28-.53a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06L8.56 12l1.72-1.72a.75.75 0 10-1.06-1.06L7.97 11.47a.75.75 0 00-.22.53z" clip-rule="evenodd" /></svg></span>
                <h3>Code Writer</h3>
                <p>Generate clean, commented code in any language</p>
            </div>
            <div class="feature-card">
                <span class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clip-rule="evenodd" /></svg></span>
                <h3>Code Review</h3>
                <p>Debug and improve your existing code</p>
            </div>
        </div>
    `;
    messagesContainer.appendChild(ws);
}

function addMessage(role, content) {
    hideWelcome();

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : '✦';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (role === 'bot') {
        bubble.innerHTML = renderMarkdown(content);
        highlightCodeBlocks(bubble);
    } else {
        bubble.textContent = content;
    }

    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.textContent = formatTime(new Date());

    contentDiv.appendChild(bubble);

    // Edit / delete actions for user messages
    if (role === 'user') {
        const actions = document.createElement('div');
        actions.className = 'user-message-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'user-action-btn';
        editBtn.title = 'Edit message';
        editBtn.innerHTML = SVG.edit + ' Edit';
        editBtn.addEventListener('click', () => removeUserMessageAndAfter(msgDiv, true));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'user-action-btn delete';
        deleteBtn.title = 'Delete message';
        deleteBtn.innerHTML = SVG.trash + ' Delete';
        deleteBtn.addEventListener('click', () => removeUserMessageAndAfter(msgDiv, false));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        contentDiv.appendChild(actions);
    }

    contentDiv.appendChild(meta);
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(contentDiv);

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();

    return { bubble, contentDiv };
}

function showTypingIndicator(label = 'Thinking...') {
    removeTypingIndicator();

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '✦';

    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    const text = document.createElement('div');
    text.className = 'typing-text';
    text.textContent = label;

    indicator.appendChild(avatar);
    indicator.appendChild(dots);
    indicator.appendChild(text);
    messagesContainer.appendChild(indicator);
    scrollToBottom();
}

// ── Web search helpers ────────────────────────────────────────────────────────

function needsSearch(text) {
    if (!searchEnabled) return false;
    const t = text.trim();
    if (t.length < 8) return false;
    // Skip pure code pastes
    const codeChars = (t.match(/[{};]/g) || []).length;
    if (codeChars > 10 && t.startsWith('`')) return false;
    // Skip if it's only a URL
    if (/^https?:\/\/\S+$/.test(t)) return false;
    return true;
}

// ── GitHub raw-file fetch ──────────────────────────────────────────────────
const GITHUB_BLOB_RE = /github\.com\/([^/\s]+)\/([^/\s]+)\/blob\/(.+)/;

function githubBlobToRaw(url) {
    const m = GITHUB_BLOB_RE.exec(url);
    if (!m) return null;
    return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}`;
}

async function fetchGithubFile(url) {
    try {
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        const resp = await fetch('/github-fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: fullUrl })
        });
        const data = await resp.json();
        return data.content || '';
    } catch { return ''; }
}

// ── Search panel UI ────────────────────────────────────────────────────────
const SVG_SEARCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/></svg>`;
const SVG_LINK_SM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path fill-rule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-4.95-4.95l1.17-1.17a.75.75 0 0 1 1.06 1.06L3.084 9.086a2 2 0 0 0 2.829 2.828l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Zm-3.84 1.96a.75.75 0 0 1-1.061 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 4.95 4.95l-1.17 1.17a.75.75 0 1 1-1.06-1.06l1.17-1.17a2 2 0 0 0-2.829-2.828l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" clip-rule="evenodd"/></svg>`;
const SVG_GH = `<img src="/static/icons/git.svg" width="13" height="13" style="vertical-align:-2px;opacity:0.85;" alt="GitHub">`;

function createSearchPanel(query) {
    const panel = document.createElement('div');
    panel.className = 'search-panel';

    const header = document.createElement('button');
    header.className = 'search-panel-header';
    header.addEventListener('click', () => panel.classList.toggle('collapsed'));

    const icon = document.createElement('span');
    icon.className = 'search-panel-icon';
    icon.innerHTML = SVG_SEARCH;

    const statusEl = document.createElement('span');
    statusEl.className = 'search-panel-status';
    statusEl.textContent = `Searching: "${query.length > 50 ? query.slice(0, 50) + '…' : query}"`;

    const chevron = document.createElement('span');
    chevron.className = 'search-panel-chevron';
    chevron.innerHTML = SVG.chevronDown;

    header.appendChild(icon);
    header.appendChild(statusEl);
    header.appendChild(chevron);

    const body = document.createElement('div');
    body.className = 'search-panel-body';

    panel.appendChild(header);
    panel.appendChild(body);

    return { el: panel, statusEl, body };
}

function addSearchResultItem(sp, result) {
    const item = document.createElement('div');
    item.className = 'search-result-item';

    const icon = document.createElement('span');
    icon.className = 'search-result-icon';
    icon.innerHTML = SVG_LINK_SM;

    const textDiv = document.createElement('div');
    textDiv.className = 'search-result-text';

    const title = document.createElement('div');
    title.className = 'search-result-title';
    title.textContent = result.title || result.url;

    const urlEl = document.createElement('div');
    urlEl.className = 'search-result-url';
    try { urlEl.textContent = new URL(result.url).hostname + new URL(result.url).pathname; }
    catch { urlEl.textContent = result.url; }

    textDiv.appendChild(title);
    textDiv.appendChild(urlEl);
    item.appendChild(icon);
    item.appendChild(textDiv);
    sp.body.appendChild(item);
    scrollToBottom();
    return item;
}

function addGithubFetchItem(sp, url, done) {
    const item = document.createElement('div');
    item.className = 'search-github-item';
    item.innerHTML = SVG_GH + `&nbsp;${done ? 'Fetched' : 'Fetching'}: <span style="opacity:0.8;margin-left:4px">${url.replace('https://github.com/', '')}</span>`;
    sp.body.appendChild(item);
    scrollToBottom();
    return item;
}

function finalizeSearchPanel(sp, resultCount, githubCount) {
    sp.el.classList.add('done');
    sp.el.classList.add('collapsed');
    const parts = [`Found ${resultCount} result${resultCount !== 1 ? 's' : ''}`];
    if (githubCount > 0) parts.push(`fetched ${githubCount} GitHub file${githubCount !== 1 ? 's' : ''}`);
    sp.statusEl.textContent = parts.join(' · ');
}

async function runSearchWithPanel(query, container) {
    const sp = createSearchPanel(query);
    container.appendChild(sp.el);
    scrollToBottom();

    let results = [];
    let githubCount = 0;

    try {
        const resp = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await resp.json();
        results = data.results || [];

        // Stream each result into the panel
        for (const r of results) {
            addSearchResultItem(sp, r);
            // If result links to a GitHub blob, fetch the file
            if (r.url && GITHUB_BLOB_RE.test(r.url)) {
                addGithubFetchItem(sp, r.url, false);
                r.github_content = await fetchGithubFile(r.url);
                githubCount++;
            }
        }
    } catch (e) {
        console.debug('[DEBUG] runSearchWithPanel error:', e);
    }

    finalizeSearchPanel(sp, results.length, githubCount);
    return results;
}

function formatSearchContext(query, results) {
    if (!results || results.length === 0) return '';
    const lines = [`[Web Search Results for: "${query}"]`];
    results.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.title}`);
        if (r.url) lines.push(`   URL: ${r.url}`);
        lines.push(`   ${r.snippet}`);
        if (r.github_content) {
            lines.push(`   [GitHub file content]`);
            lines.push(r.github_content.slice(0, 3000));
            lines.push(`   [End of GitHub file content]`);
        }
    });
    lines.push('[End of web search results]');
    return lines.join('\n');
}
// ─────────────────────────────────────────────────────────────────────────────

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function autoResize() {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 160) + 'px';
    sendBtn.disabled = userInput.value.trim() === '' || isStreaming;
}

const CODE_REQUEST_RE = /\b(code|function|script|program|implement|write|create|build|generate|html|css|javascript|js|python|py|typescript|ts|snippet|class|method|algorithm|loop|array|object|regex|api|endpoint|query|sql|component|module|library|package|framework|compile|debug|fix the code|refactor|parse|render|deploy|server|backend|frontend)\b/i;

function isCodeRequest(text) {
    return CODE_REQUEST_RE.test(text);
}

function switchToCodeMode() {
    document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === 'code');
    });
    currentMode = 'code';
}

function injectSwitchToCodeBtn(bubble, originalText) {
    if (bubble.querySelector('.switch-to-code-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'switch-to-code-btn';
    btn.innerHTML = `${SVG.code} Switch to Code Writer`;
    btn.addEventListener('click', () => {
        switchToCodeMode();
        btn.remove();
        // Re-send the original request now that we're in Code Writer mode
        sendMessage(originalText);
    });
    bubble.appendChild(btn);
}

function getModePrefix() {
    if (currentMode === 'code') {
        return "You are in Code Writer mode. Please provide complete, production-ready code with clear explanations. ";
    }
    return "You are in Chat mode. This mode is for conversation only. You MUST NOT write any code blocks, code snippets, or technical implementations. If the user asks for code or programming help, politely decline in one sentence and tell them to switch to Code Writer mode. ";
}

async function sendMessage(text) {
    console.debug('[DEBUG] sendMessage invoked', { textLen: text ? text.length : 0, isStreaming, editingQueueId });
    if (!text) return;

    isStreaming = true;
    sendBtn.disabled = true;
    userInput.value = '';
    autoResize();
    clearURLBadges();

    displayMessages.push({ role: 'user', content: text });
    addMessage('user', text);

    // Wait for any in-progress URL fetches to complete before building the message
    const pendingURLs = extractURLs(text).filter(u => urlFetchCache.has(u) && urlFetchCache.get(u).status === 'loading');
    if (pendingURLs.length > 0) {
        showTypingIndicator('Fetching links...');
        await Promise.all(pendingURLs.map(u =>
            new Promise(resolve => {
                const poll = setInterval(() => {
                    const e = urlFetchCache.get(u);
                    if (!e || e.status !== 'loading') { clearInterval(poll); resolve(); }
                }, 100);
            })
        ));
        removeTypingIndicator();
    }

    // Also start fetches for any URLs we haven't seen yet (user typed fast)
    const unseenURLs = extractURLs(text).filter(u => !urlFetchCache.has(u));
    if (unseenURLs.length > 0) {
        showTypingIndicator('Fetching links...');
        await Promise.all(unseenURLs.map(u => fetchAndCacheURL(u)));
        removeTypingIndicator();
    }

    // Web search step — shows real-time search panel before AI response
    let searchCtx = '';
    if (needsSearch(text)) {
        const results = await runSearchWithPanel(text, messagesContainer);
        searchCtx = formatSearchContext(text, results);
    }

    // Inject repository context files if any are loaded
    const repoCtx = buildRepoContextStr();

    const urlText = buildMessageWithURLContext(text);
    const userText = getModePrefix() + urlText
        + (searchCtx ? '\n\n' + searchCtx : '')
        + (repoCtx   ? '\n\n' + repoCtx   : '');

    // Show Editing panel if this looks like a code generation request
    let editingPanel = null;
    const editFilename = guessFilenameFromText(text) || null;
    const editRepoFile = findRepoFileMatch(editFilename);
    if (currentMode === 'code' || editFilename) {
        const fname = editFilename || 'untitled';
        editingPanel = createEditingPanel(fname, editRepoFile);
        messagesContainer.appendChild(editingPanel.el);
        scrollToBottom();
    }

    conversationHistory.push({ role: 'user', content: userText });
    showTypingIndicator('Thinking...');

    try {
        const payload = { messages: conversationHistory };
        console.debug('[DEBUG] sending /chat payload', payload);

        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.debug('[DEBUG] /chat response', { status: response.status });

        if (!response.ok) {
            removeTypingIndicator();
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let chunkCount = 0;

        const { bubble, contentDiv } = addMessage('bot', '');
        bubble.innerHTML = '';
        let firstChunk = true;

        // Thinking token state — uses the existing createThinkingPanel system
        // Protocol: server prefixes reasoning chunks with \x01, sends \x02 once to signal content start
        let thinkingPanel = null;
        let thinkingStartTime = null;
        let thinkingDone = false;

        function parseStream(raw) {
            const sepIdx = raw.indexOf('\x02');
            if (sepIdx !== -1) {
                // Separator found: split into reasoning section and content section
                const thinkingRaw = raw.slice(0, sepIdx);
                const afterSep    = raw.slice(sepIdx + 1);
                if (thinkingRaw.includes('\x01')) {
                    // Genuine reasoning tokens preceded the separator
                    return { thinkingText: thinkingRaw.replace(/\x01/g, ''), mainText: afterSep };
                }
                // Separator exists but no reasoning tokens — treat everything as content
                return { thinkingText: '', mainText: thinkingRaw + afterSep };
            }
            // No separator yet
            if (raw.includes('\x01')) {
                // Still receiving reasoning tokens; no content has started
                return { thinkingText: raw.replace(/\x01/g, ''), mainText: '' };
            }
            // No reasoning tokens at all — model doesn't think, treat as plain content
            return { thinkingText: '', mainText: raw };
        }

        // Typewriter state — paces the main response text independent of chunk speed
        let twTarget  = '';  // full text received so far
        let twPos     = 0;   // chars revealed so far
        let twTimer   = null;
        let streamDone = false;

        const TW_CHARS_PER_TICK = 24;  // chars revealed per tick
        const TW_TICK_MS        = 16;  // ~1500 chars/s — fast but still readable

        function getOrCreateMainNode() {
            let mainNode = bubble.querySelector('.main-response');
            if (!mainNode) {
                mainNode = document.createElement('div');
                mainNode.className = 'main-response';
                bubble.appendChild(mainNode);
            }
            return mainNode;
        }

        function typewriterTick() {
            const mainNode = getOrCreateMainNode();
            if (twPos < twTarget.length) {
                twPos = Math.min(twPos + TW_CHARS_PER_TICK, twTarget.length);
                mainNode.innerHTML = renderMarkdown(twTarget.slice(0, twPos));
                scrollToBottom();
            }
            // Stop timer only when stream is finished and all chars are shown
            if (twPos >= twTarget.length && streamDone) {
                clearInterval(twTimer);
                twTimer = null;
                // Final render with full markdown + syntax highlighting
                mainNode.innerHTML = renderMarkdown(twTarget);
                highlightCodeBlocks(bubble);
                scrollToBottom();
            }
        }

        function startTypewriter() {
            if (twTimer === null) {
                twTimer = setInterval(typewriterTick, TW_TICK_MS);
            }
        }

        function updateBubble(thinkingText, mainText) {
            if (thinkingText) {
                if (!thinkingPanel) {
                    thinkingPanel = createThinkingPanel();
                    thinkingStartTime = Date.now();
                    bubble.insertBefore(thinkingPanel.el, bubble.firstChild);
                }
                updateThinkingText(thinkingPanel, thinkingText);
            }
            if (thinkingPanel && mainText && !thinkingDone) {
                thinkingDone = true;
                finalizeThinking(thinkingPanel, ((Date.now() - thinkingStartTime) / 1000).toFixed(1), thinkingPanel.textEl.textContent);
            }
            // Update target and start typewriter immediately when content arrives
            if (mainText) {
                twTarget = mainText;
                startTypewriter();
            }
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            chunkCount += 1;
            fullText += chunk;
            console.debug('[DEBUG] chunk', { index: chunkCount, len: chunk.length, preview: chunk.slice(0,120) });

            if (firstChunk) {
                removeTypingIndicator();
                firstChunk = false;
            }

            const { thinkingText, mainText } = parseStream(fullText);
            updateBubble(thinkingText, mainText);
        }

        if (firstChunk) removeTypingIndicator();
        streamDone = true;

        // Stream fully done — start typewriter now so message appears after thinking finishes
        if (twTarget) startTypewriter();

        // Wait for typewriter to finish before saving to history
        await new Promise(resolve => {
            if (twTimer === null) { resolve(); return; }
            const check = setInterval(() => {
                if (twTimer === null) { clearInterval(check); resolve(); }
            }, 50);
        });

        // Extract the clean content (everything after \x02, or everything stripped of \x01)
        const sepIdx = fullText.indexOf('\x02');
        const cleanText = sepIdx === -1
            ? fullText.replace(/\x01/g, '').trim()
            : fullText.slice(sepIdx + 1).trim();

        console.debug('[DEBUG] sendMessage complete', { chunkCount, totalLen: fullText.length });

        conversationHistory.push({ role: 'assistant', content: cleanText });
        displayMessages.push({ role: 'bot', content: cleanText });

        if (conversationHistory.length === 2) {
            const title = text.length > 40 ? text.substring(0, 40) + '...' : text;
            chatTitle.textContent = title;
        }

        saveCurrentChat();

        const msgDiv = bubble.closest('.message');
        if (msgDiv) addRetryButton(msgDiv);

        // Finalize editing panel — detect actual filename from AI response
        if (editingPanel) {
            const codeFilename = guessFilenameFromCode(cleanText) || editFilename || 'untitled';
            const repoFile = editRepoFile || findRepoFileMatch(codeFilename);
            // Sync the new code back into the in-memory repo context so pushes are up-to-date
            if (repoFile) {
                const newCode = extractLargestCodeBlock(cleanText);
                if (newCode) {
                    const idx = repoContextFiles.indexOf(repoFile);
                    if (idx !== -1) {
                        repoContextFiles[idx] = { ...repoFile, content: newCode };
                        renderContextFileBadges();
                    }
                }
            }
            finalizeEditingPanel(editingPanel, [codeFilename], repoFile);
        }

        // Show terminal panel if AI response contains shell commands
        const shellGroups = extractShellCommandGroups(cleanText);
        if (shellGroups.length > 0) {
            const termPanel = createTerminalPanel(shellGroups);
            const botMsgDiv = bubble.closest('.message');
            if (botMsgDiv && botMsgDiv.nextSibling) {
                messagesContainer.insertBefore(termPanel.el, botMsgDiv.nextSibling);
            } else {
                messagesContainer.appendChild(termPanel.el);
            }
            scrollToBottom();
        }

        // In chat mode, inject a switch button when user asked for code
        if (currentMode === 'chat' && isCodeRequest(text)) {
            injectSwitchToCodeBtn(bubble, text);
        }

    } catch (error) {
        removeTypingIndicator();
        const errMsg = `Sorry, I ran into an error: ${error.message}. Please try again.`;
        addMessage('bot', errMsg);
        displayMessages.push({ role: 'bot', content: errMsg });
    } finally {
        isStreaming = false;
        sendBtn.disabled = userInput.value.trim() === '';
        if (messageQueue.length > 0) {
            setTimeout(processQueue, 150);
        }
    }
}

function clearChatUI() {
    conversationHistory = [];
    displayMessages = [];
    chatTitle.textContent = 'KawaiiGPT';
    messagesContainer.innerHTML = '';
    restoreWelcomeScreen();
}

sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (!text) return;
    if (editingQueueId) {
        const q = messageQueue.find(x => x.id === editingQueueId);
        if (q) {
            q.text = text;
            renderQueueUI();
        }
        editingQueueId = null;
        sendBtn.dataset.mode = '';
        if (originalSendBtnHTML) sendBtn.innerHTML = originalSendBtnHTML;
        userInput.value = '';
        autoResize();
        return;
    }

    if (isStreaming) {
        enqueueMessage(text);
        userInput.value = '';
        autoResize();
        return;
    }

    sendMessage(text);
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        if (editingQueueId) {
            const q = messageQueue.find(x => x.id === editingQueueId);
            if (q) {
                q.text = text;
                renderQueueUI();
            }
            editingQueueId = null;
            sendBtn.dataset.mode = '';
            if (originalSendBtnHTML) sendBtn.innerHTML = originalSendBtnHTML;
            userInput.value = '';
            autoResize();
            return;
        }
        if (isStreaming) {
            enqueueMessage(text);
            userInput.value = '';
            autoResize();
            return;
        }
        sendMessage(text);
    }
});

userInput.addEventListener('input', () => { autoResize(); onInputURLDetect(); });

// ── Copilot-style panels: Read, Editing, Terminal ─────────────────────────

const SVG_READ = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M0 2.75A.75.75 0 01.75 2h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 2.75zm0 5A.75.75 0 01.75 7h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 7.75zm0 5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H.75a.75.75 0 01-.75-.75z"/></svg>`;
const SVG_EDIT_PEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.757l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.428 11.13c-.035.035-.061.077-.075.122l-.63 2.202 2.202-.63a.25.25 0 00.122-.075l6.142-6.498z"/></svg>`;
const SVG_TERM = `<img src="/static/icons/console.svg" width="14" height="14" style="vertical-align:middle;opacity:0.85" alt="">`;

// ── Material icon helper ──────────────────────────────────────────────────────
function getFileIcon(filename, size = 14) {
    const base = (filename || '').split('/').pop().split('\\').pop();
    const lower = base.toLowerCase();
    const ext = lower.includes('.') ? lower.split('.').pop() : '';

    const specialFiles = {
        'dockerfile': 'docker', 'docker-compose.yml': 'docker', 'docker-compose.yaml': 'docker',
        'makefile': 'makefile', 'gnumakefile': 'makefile',
        '.gitignore': 'git', '.gitattributes': 'git', '.gitmodules': 'git',
        'procfile': 'console',
        'readme': 'readme', 'readme.md': 'readme', 'readme.txt': 'readme',
        'license': 'license', 'licence': 'license',
        'changelog': 'changelog', 'changelog.md': 'changelog',
        'package.json': 'npm', 'package-lock.json': 'lock',
        'yarn.lock': 'yarn', 'pnpm-lock.yaml': 'pnpm', 'bun.lockb': 'bun',
        'tsconfig.json': 'tsconfig',
        '.eslintrc': 'eslint', '.eslintrc.json': 'eslint', '.eslintrc.js': 'eslint', '.eslintrc.cjs': 'eslint',
        '.prettierrc': 'prettier', '.prettierrc.json': 'prettier',
        '.babelrc': 'babel', 'babel.config.js': 'babel', 'babel.config.ts': 'babel',
        'vite.config.ts': 'vite', 'vite.config.js': 'vite',
        'webpack.config.js': 'webpack', 'webpack.config.ts': 'webpack',
        'tailwind.config.js': 'tailwindcss', 'tailwind.config.ts': 'tailwindcss',
        'next.config.js': 'next', 'next.config.ts': 'next',
        'nuxt.config.ts': 'nuxt', 'nuxt.config.js': 'nuxt',
        '.env': 'settings', '.env.local': 'settings', '.env.production': 'settings', '.env.development': 'settings',
        'cargo.toml': 'rust', 'cargo.lock': 'rust',
        'go.mod': 'go', 'go.sum': 'go',
        'requirements.txt': 'python', 'setup.py': 'python', 'pyproject.toml': 'python',
        'schema.prisma': 'prisma', 'drizzle.config.ts': 'drizzle', 'drizzle.config.js': 'drizzle',
        '.editorconfig': 'editorconfig', 'renovate.json': 'renovate', 'biome.json': 'biome',
        'turbo.json': 'turborepo', 'turbo.jsonc': 'turborepo',
        '.prettierignore': 'prettier', '.eslintignore': 'eslint',
        'vitest.config.ts': 'vitest', 'vitest.config.js': 'vitest',
        'playwright.config.ts': 'playwright', 'playwright.config.js': 'playwright',
        'jest.config.js': 'jest', 'jest.config.ts': 'jest',
        'deno.json': 'deno', 'deno.jsonc': 'deno',
        'bun.toml': 'bun',
        'vercel.json': 'vercel', 'netlify.toml': 'netlify',
        'wrangler.toml': 'wrangler', 'wrangler.json': 'wrangler',
        '.github': 'git', 'commitlint.config.js': 'commitlint', 'commitlint.config.ts': 'commitlint',
    };
    const extMap = {
        'js': 'javascript', 'mjs': 'javascript', 'cjs': 'javascript',
        'ts': 'typescript', 'mts': 'typescript', 'cts': 'typescript',
        'jsx': 'react', 'tsx': 'react',
        'html': 'html', 'htm': 'html',
        'css': 'css', 'scss': 'sass', 'sass': 'sass', 'less': 'less',
        'vue': 'vue', 'svelte': 'svelte', 'astro': 'astro',
        'py': 'python', 'pyw': 'python', 'pyi': 'python',
        'java': 'java', 'kt': 'kotlin', 'kts': 'kotlin',
        'swift': 'swift', 'cpp': 'cpp', 'cxx': 'cpp', 'cc': 'cpp', 'c': 'c',
        'h': 'c', 'hpp': 'cpp', 'cs': 'csharp',
        'go': 'go', 'rs': 'rust', 'rb': 'ruby', 'php': 'php',
        'scala': 'scala', 'dart': 'dart', 'lua': 'lua',
        'hs': 'haskell', 'fs': 'fsharp', 'fsi': 'fsharp', 'ml': 'ocaml',
        'jl': 'julia', 'zig': 'zig', 'sol': 'solidity',
        'ex': 'elixir', 'exs': 'elixir', 'erl': 'erlang',
        'clj': 'clojure', 'elm': 'elm', 'coffee': 'coffee',
        'gleam': 'gleam', 'mojo': 'mojo', 'r': 'r', 'nim': 'nim',
        'cr': 'crystal', 'adb': 'ada', 'ads': 'ada',
        'v': 'vlang', 'odin': 'odin', 'gr': 'grain', 'purs': 'purescript',
        'vala': 'vala', 'bal': 'ballerina', 'cbl': 'cobol', 'cob': 'cobol',
        'f90': 'fortran', 'f95': 'fortran', 'for': 'fortran',
        'wasm': 'webassembly', 'cu': 'cuda',
        'graphql': 'graphql', 'gql': 'graphql',
        'json': 'json', 'json5': 'json', 'jsonc': 'json',
        'yaml': 'yaml', 'yml': 'yaml', 'toml': 'toml',
        'md': 'markdown', 'mdx': 'mdx', 'xml': 'xml', 'svg': 'svg',
        'sql': 'database',
        'sh': 'console', 'bash': 'console', 'zsh': 'console', 'fish': 'console',
        'ps1': 'powershell', 'psm1': 'powershell',
        'tf': 'terraform', 'tfvars': 'terraform',
        'tex': 'tex', 'adoc': 'asciidoc',
        'pug': 'pug', 'hbs': 'handlebars', 'njk': 'nunjucks',
        'liquid': 'liquid', 'twig': 'twig', 'cshtml': 'razor',
        'zip': 'zip', 'gz': 'zip', 'tar': 'zip', 'rar': 'zip',
        'pdf': 'pdf', 'png': 'image', 'jpg': 'image', 'jpeg': 'image',
        'gif': 'image', 'webp': 'image', 'ico': 'image',
        'mp4': 'video', 'mov': 'video', 'webm': 'video',
        'mp3': 'audio', 'wav': 'audio', 'ogg': 'audio',
        'ttf': 'font', 'woff': 'font', 'woff2': 'font', 'otf': 'font',
        'exe': 'exe', 'dll': 'dll', 'log': 'log', 'lock': 'lock',
        'diff': 'diff', 'patch': 'diff',
        'pem': 'certificate', 'crt': 'certificate', 'key': 'key',
        'prisma': 'prisma', 'pl': 'perl', 'pm': 'perl', 'd': 'd',
        'gradle': 'gradle', 'groovy': 'gradle', 'asm': 'assembly',
    };

    const iconName = specialFiles[lower] || extMap[ext] || 'file';
    return `<img src="/static/icons/${iconName}.svg" width="${size}" height="${size}" style="vertical-align:middle;flex-shrink:0;display:inline-block" alt="" onerror="this.src='/static/icons/file.svg'">`;
}

function makePanelEl(cls, accentHdr, accentBorder, accentBg, iconSvg, initialStatus) {
    const panel = document.createElement('div');
    panel.className = cls;
    const header = document.createElement('button');
    header.className = `${cls}-header`;
    header.addEventListener('click', () => panel.classList.toggle('collapsed'));
    const icon = document.createElement('span');
    icon.className = `${cls}-icon`;
    icon.innerHTML = iconSvg;
    const statusEl = document.createElement('span');
    statusEl.className = `${cls}-status`;
    statusEl.textContent = initialStatus;
    const chevron = document.createElement('span');
    chevron.className = `${cls}-chevron`;
    chevron.innerHTML = SVG.chevronDown;
    header.appendChild(icon); header.appendChild(statusEl); header.appendChild(chevron);
    const body = document.createElement('div');
    body.className = `${cls}-body`;
    panel.appendChild(header); panel.appendChild(body);
    return { el: panel, statusEl, body };
}

function createReadPanel(filenames) {
    const p = makePanelEl('read-panel', null, null, null, SVG_READ,
        filenames.length === 1 ? `Reading: ${filenames[0]}` : `Reading ${filenames.length} files`);
    filenames.forEach(name => {
        const item = document.createElement('div');
        item.className = 'read-file-item';
        item.innerHTML = getFileIcon(name, 13) + `&nbsp;${name}`;
        p.body.appendChild(item);
    });
    return p;
}

function finalizeReadPanel(p, count) {
    p.el.classList.add('done', 'collapsed');
    p.statusEl.textContent = `Read ${count} file${count !== 1 ? 's' : ''}`;
}

function findRepoFileMatch(filename) {
    if (!filename || repoContextFiles.length === 0) return null;
    const lower = filename.toLowerCase();
    return repoContextFiles.find(f =>
        f.path === filename ||
        f.path.split('/').pop() === filename ||
        f.path.toLowerCase() === lower ||
        f.path.split('/').pop().toLowerCase() === lower
    ) || null;
}

function extractLargestCodeBlock(text) {
    const matches = [...text.matchAll(/```[\w-]*\n([\s\S]*?)```/g)];
    if (!matches.length) return null;
    return matches.reduce((a, b) => b[1].length > a[1].length ? b : a)[1];
}

function buildEditingFileItem(filename, repoFile) {
    const item = document.createElement('div');
    item.className = 'editing-file-item';
    const icon = document.createElement('span');
    icon.innerHTML = SVG_EDIT_PEN;
    item.appendChild(icon);
    const nameSpan = document.createElement('span');
    nameSpan.className = 'editing-file-name';
    nameSpan.textContent = '\u00a0' + (filename || 'untitled');
    item.appendChild(nameSpan);
    if (repoFile) {
        const link = document.createElement('a');
        link.className = 'editing-gh-link';
        link.href = `https://github.com/${repoFile.owner}/${repoFile.repo}/blob/HEAD/${repoFile.path}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = `View on GitHub: ${repoFile.owner}/${repoFile.repo}/${repoFile.path}`;
        link.innerHTML = SVG_GH + ' ' + repoFile.owner + '/' + repoFile.repo.split('/').pop() + '/' + repoFile.path.split('/').pop();
        item.appendChild(link);
    }
    return item;
}

function createEditingPanel(filename, repoFile) {
    const safeFilename = filename || 'untitled';
    const p = makePanelEl('editing-panel', null, null, null, SVG_EDIT_PEN, `Editing: ${safeFilename}`);
    const item = buildEditingFileItem(safeFilename, repoFile);
    p.body.appendChild(item);
    scrollToBottom();
    return p;
}

function addEditingFile(p, filename, repoFile) {
    const item = buildEditingFileItem(filename || 'untitled', repoFile);
    p.body.appendChild(item);
    scrollToBottom();
}

function finalizeEditingPanel(p, files, repoFile) {
    const safeFiles = files.map(f => f || 'untitled');
    p.el.classList.add('done', 'collapsed');
    p.statusEl.textContent = `Edited ${safeFiles.join(', ')}`;
    const existing = p.body.querySelectorAll('.editing-file-item');
    if (existing.length >= 1 && safeFiles.length >= 1) {
        existing[0].replaceWith(buildEditingFileItem(safeFiles[0], repoFile));
    } else if (existing.length === 0) {
        safeFiles.forEach(f => addEditingFile(p, f, repoFile));
    }
}

const RUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215z"/></svg>`;

function createTerminalPanel(groups) {
    const totalCmds = groups.reduce((n, g) => n + g.commands.length, 0);
    const p = makePanelEl('terminal-panel', null, null, null, SVG_TERM,
        `Terminal (${totalCmds} command${totalCmds !== 1 ? 's' : ''})`);

    groups.forEach(({ commands }) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'terminal-line-wrapper';

        commands.forEach(cmd => {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            const prompt = document.createElement('span');
            prompt.className = 'terminal-prompt';
            prompt.textContent = '$ ';
            const textEl = document.createElement('span');
            textEl.className = 'terminal-cmd-text';
            textEl.textContent = cmd;
            line.appendChild(prompt);
            line.appendChild(textEl);
            wrapper.appendChild(line);
        });

        const outputEl = document.createElement('div');
        outputEl.className = 'terminal-output hidden';

        const runBtn = document.createElement('button');
        runBtn.className = 'terminal-run-btn';
        runBtn.title = 'Run in terminal';
        runBtn.innerHTML = RUN_SVG + ' Run';

        runBtn.addEventListener('click', async () => {
            runBtn.disabled = true;
            runBtn.innerHTML = '…';
            outputEl.className = 'terminal-output';
            outputEl.textContent = 'Running…';
            let combined = '';
            try {
                for (const cmd of commands) {
                    const resp = await fetch('/exec', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cmd })
                    });
                    const data = await resp.json();
                    if (data.error) {
                        combined += `$ ${cmd}\nError: ${data.error}\n`;
                        outputEl.textContent = combined.trim();
                        outputEl.className = 'terminal-output error';
                        break;
                    }
                    const out = (data.stdout || '') + (data.stderr ? `[stderr] ${data.stderr}` : '');
                    combined += `$ ${cmd}\n${out.trim() || `(exit ${data.returncode})`}\n\n`;
                    outputEl.textContent = combined.trim();
                    outputEl.className = `terminal-output ${data.returncode !== 0 ? 'error' : 'success'}`;
                    if (data.returncode !== 0) break;
                }
            } catch (e) {
                outputEl.textContent = `Failed: ${e.message}`;
                outputEl.className = 'terminal-output error';
            } finally {
                runBtn.disabled = false;
                runBtn.innerHTML = RUN_SVG + ' Run';
                scrollToBottom();
            }
        });

        const btnRow = document.createElement('div');
        btnRow.className = 'terminal-btn-row';
        btnRow.appendChild(runBtn);
        wrapper.appendChild(btnRow);
        wrapper.appendChild(outputEl);
        p.body.appendChild(wrapper);
    });

    return p;
}

function extractShellCommandGroups(text) {
    const shellLangs = /^(bash|sh|shell|zsh|cmd|powershell|ps1|terminal|console|command)$/i;
    const fenceRe = /```([\w.-]*)\n([\s\S]*?)```/g;
    const groups = [];
    let m;
    while ((m = fenceRe.exec(text)) !== null) {
        const lang = m[1].trim();
        if (shellLangs.test(lang)) {
            const lines = m[2].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
            if (lines.length > 0) groups.push({ lang, commands: lines.slice(0, 10) });
        }
    }
    return groups;
}

function guessFilenameFromText(text) {
    // Check for explicit mention like "write server.py" or "create index.html"
    const explicit = text.match(/(?:write|create|edit|make|build|generate|update)\s+[`"]?([\w./\\-]+\.\w+)[`"]?/i);
    if (explicit) return explicit[1].split('/').pop().split('\\').pop();
    // Check for "filename.ext:" pattern
    const fenced = text.match(/`([\w./\\-]+\.\w+)`/);
    if (fenced) return fenced[1].split('/').pop();
    return null;
}

function guessFilenameFromCode(codeText) {
    // Look for ``` lang filename.ext pattern
    const m = codeText.match(/```[\w-]+ ([\w./\\-]+\.\w+)/);
    if (m) return m[1].split('/').pop();
    // Look for shebang
    if (/^#!.*\/python/.test(codeText)) return 'script.py';
    if (/^#!.*\/node/.test(codeText)) return 'script.js';
    if (/^#!.*\/bash/.test(codeText)) return 'script.sh';
    return null;
}

// ── Repo context store ────────────────────────────────────────────────────
let repoContextFiles = []; // [{path, content, owner, repo}]

function buildRepoContextStr() {
    if (repoContextFiles.length === 0) return '';
    const lines = ['[Repository context files loaded by user]'];
    repoContextFiles.forEach(f => {
        lines.push(`\n--- ${f.owner}/${f.repo}: ${f.path} ---`);
        lines.push(f.content.slice(0, 4000));
        if (f.content.length > 4000) lines.push('... [truncated]');
    });
    lines.push('[End of repository context]');
    return lines.join('\n');
}

function renderContextFileBadges() {
    const container = document.getElementById('copilotContextFiles');
    if (!container) return;
    container.innerHTML = '';
    repoContextFiles.forEach((f, idx) => {
        const badge = document.createElement('span');
        badge.className = 'context-file-badge';
        const name = f.path.split('/').pop();
        badge.textContent = name;
        badge.title = `${f.owner}/${f.repo}:${f.path}`;
        const rm = document.createElement('span');
        rm.className = 'cfb-remove';
        rm.textContent = '×';
        rm.addEventListener('click', (e) => { e.stopPropagation(); repoContextFiles.splice(idx, 1); renderContextFileBadges(); });
        badge.appendChild(rm);
        container.appendChild(badge);
    });
    const hasFiles = repoContextFiles.length > 0;
    const sep = document.getElementById('copilotToolbar')?.querySelector('.copilot-toolbar-sep');
    if (sep) sep.style.display = hasFiles ? '' : 'none';
    const pullBtn = document.getElementById('githubPullBtn');
    const pushBtn = document.getElementById('githubPushBtn');
    if (pullBtn) pullBtn.style.display = hasFiles ? '' : 'none';
    if (pushBtn) pushBtn.style.display = hasFiles ? '' : 'none';
}

// ── Import Repo Modal ─────────────────────────────────────────────────────
const importRepoModal = document.getElementById('importRepoModal');
const importRepoBtn   = document.getElementById('importRepoBtn');
const importRepoClose = document.getElementById('importRepoClose');
const repoUrlInput    = document.getElementById('repoUrlInput');
const repoFetchBtn    = document.getElementById('repoFetchBtn');
const repoLoading     = document.getElementById('repoLoading');
const repoError       = document.getElementById('repoError');
const repoTreeContainer = document.getElementById('repoTreeContainer');
const repoTreeHeader  = document.getElementById('repoTreeHeader');
const repoTreeList    = document.getElementById('repoTreeList');
const repoTreeSearch  = document.getElementById('repoTreeSearch');
const selectedFilesBar = document.getElementById('selectedFilesBar');
const selectedFileCount = document.getElementById('selectedFileCount');
const addFilesToContextBtn = document.getElementById('addFilesToContextBtn');
const importAllBtn         = document.getElementById('importAllBtn');

const IMPORT_ALL_MAX = 200; // max files imported at once

let currentRepoData = null;    // {owner, repo, branch, files}
let selectedFilePaths = new Set();

function openImportRepoModal() {
    if (importRepoModal) importRepoModal.style.display = 'flex';
    setTimeout(() => repoUrlInput?.focus(), 50);
}

function closeImportRepoModal() {
    if (importRepoModal) importRepoModal.style.display = 'none';
}

function showRepoLoading(v) {
    if (repoLoading) repoLoading.style.display = v ? 'flex' : 'none';
}
function showRepoError(msg) {
    if (repoError) { repoError.textContent = msg; repoError.style.display = msg ? '' : 'none'; }
}
function showRepoTree(v) {
    if (repoTreeContainer) repoTreeContainer.style.display = v ? 'flex' : 'none';
}

function renderFileTree(filter = '') {
    if (!repoTreeList || !currentRepoData) return;
    const q = filter.toLowerCase();
    const blobs = currentRepoData.files.filter(f => f.type === 'blob' && (!q || f.path.toLowerCase().includes(q)));
    repoTreeList.innerHTML = '';
    blobs.slice(0, 200).forEach(f => {
        const item = document.createElement('div');
        item.className = 'repo-tree-item' + (selectedFilePaths.has(f.path) ? ' selected' : '');
        const icon = document.createElement('span');
        icon.className = 'rti-icon';
        icon.innerHTML = getFileIcon(f.path, 14);
        const pathEl = document.createElement('span');
        pathEl.className = 'rti-path';
        pathEl.textContent = f.path;
        pathEl.title = f.path;
        const sizeEl = document.createElement('span');
        sizeEl.className = 'rti-size';
        if (f.size > 0) sizeEl.textContent = f.size > 1024 ? `${(f.size/1024).toFixed(1)}k` : `${f.size}b`;
        item.appendChild(icon); item.appendChild(pathEl); item.appendChild(sizeEl);
        item.addEventListener('click', () => {
            if (selectedFilePaths.has(f.path)) selectedFilePaths.delete(f.path);
            else selectedFilePaths.add(f.path);
            renderFileTree(filter);
            updateSelectedBar();
        });
        repoTreeList.appendChild(item);
    });
    if (blobs.length === 0) {
        repoTreeList.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-muted)">No files found</div>';
    }
}

function updateSelectedBar() {
    const n = selectedFilePaths.size;
    if (selectedFilesBar) selectedFilesBar.style.display = n > 0 ? 'flex' : 'none';
    if (selectedFileCount) selectedFileCount.textContent = `${n} file${n !== 1 ? 's' : ''} selected`;
}

async function fetchRepo() {
    const url = repoUrlInput?.value.trim();
    if (!url) return;
    showRepoError('');
    showRepoLoading(true);
    showRepoTree(false);
    if (repoFetchBtn) repoFetchBtn.disabled = true;
    selectedFilePaths.clear();
    currentRepoData = null;
    try {
        const resp = await fetch('/github-tree', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ repo_url: url })
        });
        const data = await resp.json();
        if (data.error) { showRepoError(data.error); return; }
        currentRepoData = data;
        if (repoTreeHeader) repoTreeHeader.textContent = `${data.owner}/${data.repo} · ${data.branch} · ${data.files.filter(f=>f.type==='blob').length} files${data.truncated ? ' (truncated)' : ''}`;
        renderFileTree();
        showRepoTree(true);
    } catch (e) {
        showRepoError('Failed to fetch repo: ' + e.message);
    } finally {
        showRepoLoading(false);
        if (repoFetchBtn) repoFetchBtn.disabled = false;
    }
}

async function addSelectedFilesToContext() {
    if (!currentRepoData || selectedFilePaths.size === 0) return;
    const { owner, repo, branch } = currentRepoData;
    const filenames = [...selectedFilePaths];

    if (addFilesToContextBtn) { addFilesToContextBtn.textContent = 'Loading...'; addFilesToContextBtn.disabled = true; }

    // Show read panel in chat
    const readPanel = createReadPanel(filenames.map(p => p.split('/').pop()));
    messagesContainer.appendChild(readPanel.el);
    scrollToBottom();

    const fetched = [];
    for (const path of filenames) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
        try {
            const resp = await fetch('/fetch-url', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ url: rawUrl })
            });
            const data = await resp.json();
            const content = data.text || '';
            repoContextFiles.push({ path, content, owner, repo });
            fetched.push(path);
        } catch {}
    }

    finalizeReadPanel(readPanel, fetched.length);
    renderContextFileBadges();
    selectedFilePaths.clear();
    updateSelectedBar();
    closeImportRepoModal();

    if (addFilesToContextBtn) { addFilesToContextBtn.textContent = 'Add to Context'; addFilesToContextBtn.disabled = false; }
}

async function importAllFiles() {
    if (!currentRepoData) return;
    const allBlobs = currentRepoData.files
        .filter(f => f.type === 'blob')
        .slice(0, IMPORT_ALL_MAX);

    if (allBlobs.length === 0) return;

    const btn = importAllBtn;
    if (btn) { btn.textContent = 'Importing...'; btn.disabled = true; }

    const { owner, repo, branch } = currentRepoData;
    const filenames = allBlobs.map(f => f.path.split('/').pop());

    const readPanel = createReadPanel(filenames);
    messagesContainer.appendChild(readPanel.el);
    scrollToBottom();

    let fetched = 0;
    for (const file of allBlobs) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
        try {
            const resp = await fetch('/fetch-url', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ url: rawUrl })
            });
            const data = await resp.json();
            const content = data.text || '';
            // Skip already-loaded paths
            if (!repoContextFiles.find(x => x.path === file.path && x.owner === owner && x.repo === repo)) {
                repoContextFiles.push({ path: file.path, content, owner, repo });
            }
            fetched++;
        } catch {}
    }

    finalizeReadPanel(readPanel, fetched);
    renderContextFileBadges();
    closeImportRepoModal();

    if (btn) { btn.textContent = 'Import All'; btn.disabled = false; }
}

if (importRepoBtn) importRepoBtn.addEventListener('click', openImportRepoModal);
if (importRepoClose) importRepoClose.addEventListener('click', closeImportRepoModal);
if (importRepoModal) importRepoModal.addEventListener('click', (e) => { if (e.target === importRepoModal) closeImportRepoModal(); });
if (repoFetchBtn) repoFetchBtn.addEventListener('click', fetchRepo);
if (repoUrlInput) repoUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchRepo(); });
if (repoTreeSearch) repoTreeSearch.addEventListener('input', () => renderFileTree(repoTreeSearch.value));
if (addFilesToContextBtn) addFilesToContextBtn.addEventListener('click', addSelectedFilesToContext);
if (importAllBtn) importAllBtn.addEventListener('click', importAllFiles);

// ── Pull from GitHub ───────────────────────────────────────────────────────
async function pullFromGitHub() {
    if (repoContextFiles.length === 0) return;
    const pullBtn = document.getElementById('githubPullBtn');
    if (pullBtn) { pullBtn.textContent = 'Pulling...'; pullBtn.disabled = true; }

    const filenames = repoContextFiles.map(f => f.path.split('/').pop());
    const readPanel = createReadPanel(filenames);
    messagesContainer.appendChild(readPanel.el);
    scrollToBottom();

    let fetched = 0;
    for (let i = 0; i < repoContextFiles.length; i++) {
        const f = repoContextFiles[i];
        const rawUrl = `https://raw.githubusercontent.com/${f.owner}/${f.repo}/HEAD/${f.path}`;
        try {
            const resp = await fetch('/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: rawUrl })
            });
            const data = await resp.json();
            if (data.text !== undefined) {
                repoContextFiles[i] = { ...f, content: data.text };
                fetched++;
            }
        } catch {}
    }

    finalizeReadPanel(readPanel, fetched);
    if (pullBtn) { pullBtn.textContent = 'Pull'; pullBtn.disabled = false; }
}

// ── Push to GitHub ─────────────────────────────────────────────────────────
const githubPushModal  = document.getElementById('githubPushModal');
const githubPushClose  = document.getElementById('githubPushClose');
const githubTokenInput = document.getElementById('githubTokenInput');
const pushCommitMsg    = document.getElementById('pushCommitMsg');
const pushFilesList    = document.getElementById('pushFilesList');
const pushError        = document.getElementById('pushError');
const pushSubmitBtn    = document.getElementById('pushSubmitBtn');

function openPushModal() {
    if (!githubPushModal) return;
    // Restore saved token
    const saved = localStorage.getItem('gh_token');
    if (saved && githubTokenInput) githubTokenInput.value = saved;

    // Populate file list
    if (pushFilesList) {
        pushFilesList.innerHTML = '';
        repoContextFiles.forEach(f => {
            const row = document.createElement('div');
            row.className = 'push-file-row';
            row.innerHTML = `<span class="pf-repo">${f.owner}/${f.repo}</span><span>${f.path}</span>`;
            pushFilesList.appendChild(row);
        });
    }
    if (pushError) { pushError.style.display = 'none'; pushError.textContent = ''; }
    githubPushModal.style.display = 'flex';
    setTimeout(() => pushCommitMsg?.focus(), 50);
}

function closePushModal() {
    if (githubPushModal) githubPushModal.style.display = 'none';
}

async function executePush() {
    const token = githubTokenInput?.value.trim();
    const msg   = pushCommitMsg?.value.trim() || 'Update via KawaiiGPT';
    if (!token) {
        if (pushError) { pushError.textContent = 'Please enter a GitHub token.'; pushError.style.display = ''; }
        return;
    }
    if (repoContextFiles.length === 0) return;

    // Save token locally
    localStorage.setItem('gh_token', token);

    if (pushSubmitBtn) { pushSubmitBtn.textContent = 'Pushing...'; pushSubmitBtn.disabled = true; }
    if (pushError) pushError.style.display = 'none';

    // Group files by repo
    const byRepo = {};
    repoContextFiles.forEach(f => {
        const key = `${f.owner}/${f.repo}`;
        if (!byRepo[key]) byRepo[key] = { owner: f.owner, repo: f.repo, branch: 'HEAD', files: [] };
        byRepo[key].files.push({ path: f.path, content: f.content });
    });

    // Update row statuses in modal
    const rows = pushFilesList?.querySelectorAll('.push-file-row') || [];
    let rowIdx = 0;
    let allOk = true;

    for (const key of Object.keys(byRepo)) {
        const { owner, repo, files } = byRepo[key];
        // Detect branch from currentRepoData if available
        const branch = (currentRepoData?.owner === owner && currentRepoData?.repo === repo)
            ? currentRepoData.branch : 'main';
        try {
            const resp = await fetch('/github-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, owner, repo, branch, message: msg, files })
            });
            const data = await resp.json();
            if (data.results) {
                data.results.forEach(r => {
                    if (rows[rowIdx]) {
                        rows[rowIdx].classList.add(r.ok ? 'ok' : 'err');
                        const st = document.createElement('span');
                        st.className = 'pf-status';
                        st.textContent = r.ok ? '✓ pushed' : `✗ ${r.error || 'error'}`;
                        rows[rowIdx].appendChild(st);
                        if (!r.ok) allOk = false;
                    }
                    rowIdx++;
                });
            } else {
                if (pushError) { pushError.textContent = data.error || 'Push failed.'; pushError.style.display = ''; }
                allOk = false;
            }
        } catch (e) {
            if (pushError) { pushError.textContent = `Network error: ${e.message}`; pushError.style.display = ''; }
            allOk = false;
        }
    }

    if (pushSubmitBtn) { pushSubmitBtn.textContent = allOk ? '✓ Done' : 'Retry'; pushSubmitBtn.disabled = false; }
    if (allOk) setTimeout(() => closePushModal(), 1200);
}

const githubPullBtn = document.getElementById('githubPullBtn');
const githubPushBtn = document.getElementById('githubPushBtn');
if (githubPullBtn) githubPullBtn.addEventListener('click', pullFromGitHub);
if (githubPushBtn) githubPushBtn.addEventListener('click', openPushModal);
if (githubPushClose) githubPushClose.addEventListener('click', closePushModal);
if (githubPushModal) githubPushModal.addEventListener('click', (e) => { if (e.target === githubPushModal) closePushModal(); });
if (pushSubmitBtn) pushSubmitBtn.addEventListener('click', executePush);
if (pushCommitMsg) pushCommitMsg.addEventListener('keydown', e => { if (e.key === 'Enter') executePush(); });

renderContextFileBadges();

// ── Search toggle ──────────────────────────────────────────────────────────
const searchToggleBtn = document.getElementById('searchToggle');
const searchToggleRow = document.getElementById('searchToggleRow');

function applySearchToggle() {
    if (searchToggleBtn) {
        searchToggleBtn.setAttribute('aria-checked', searchEnabled ? 'true' : 'false');
    }
}

function toggleSearch() {
    searchEnabled = !searchEnabled;
    localStorage.setItem('searchEnabled', searchEnabled ? 'true' : 'false');
    applySearchToggle();
}

if (searchToggleBtn) searchToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSearch(); });
if (searchToggleRow) searchToggleRow.addEventListener('click', (e) => { if (e.target !== searchToggleBtn) toggleSearch(); });

applySearchToggle();

newChatBtn.addEventListener('click', () => {
    startNewChat();
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

clearBtn.addEventListener('click', startNewChat);

clearHistoryBtn.addEventListener('click', () => {
    saveChats([]);
    currentChatId = generateId();
    conversationHistory = [];
    displayMessages = [];
    clearChatUI();
    renderHistoryList();
});

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== menuToggle) {
        sidebar.classList.remove('open');
    }
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
    });
});

document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        userInput.value = prompt;
        autoResize();
        sendMessage(prompt);
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
});

renderHistoryList();
renderQueueUI();
userInput.focus();
console.debug('[DEBUG] KawaiiGPT client ready', { queueLength: messageQueue.length });
