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
let currentChatId = generateId();
let messageQueue = [];
let editingQueueId = null;
const originalSendBtnHTML = sendBtn ? sendBtn.innerHTML : null;

// SVG icons
const SVG = {
    chat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM6 9a1 1 0 11-2 0 1 1 0 012 0zm7 1a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" /></svg>`,
    retry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" /></svg>`,
    brain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" /></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>`,
};

// ── Thinking panel helpers ────────────────────────────────────────────────────

function createThinkingPanel() {
    const panel = document.createElement('div');
    panel.className = 'thinking-panel';

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
    tp.textEl.textContent = text;
    // auto-scroll thinking body
    tp.body.scrollTop = tp.body.scrollHeight;
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

    const lang = codeEl.className.replace('language-', '').toLowerCase();
    const raw = codeStore[id] || codeEl.textContent || codeEl.innerText || '';
    const code = decodeHtmlEntities(raw);
    const content = buildPreviewContent(lang, code);

    const panel = document.createElement('div');
    panel.className = 'preview-panel';

    const panelHeader = document.createElement('div');
    panelHeader.className = 'preview-panel-header';
    panelHeader.innerHTML = `
        <span class="preview-panel-title">Preview · ${lang.toUpperCase()}</span>
        <button class="preview-close-btn" onclick="togglePreview('${id}')">${SVG_CLOSE} Close</button>
    `;

    const iframe = document.createElement('iframe');
    iframe.className = 'preview-iframe';

    panel.appendChild(panelHeader);
    panel.appendChild(iframe);
    wrapper.appendChild(panel);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();

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

        const { bubble, contentDiv } = addMessage('bot', 'Thinking...');
        const newMsgDiv = contentDiv.closest('.message');
        let firstChunk = true;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            chunkCount += 1;
            fullText += chunk;
            console.debug('[DEBUG] retry chunk', { chunkIndex: chunkCount, len: chunk.length, preview: chunk.slice(0,120) });
            if (firstChunk) {
                removeTypingIndicator();
                firstChunk = false;
            }
            bubble.innerHTML = renderMarkdown(fullText);
            highlightCodeBlocks(bubble);
            scrollToBottom();
        }

        if (firstChunk) removeTypingIndicator();

        if (chunkCount <= 1 && fullText.length > 0) {
            animateReveal(bubble, fullText);
        }

        conversationHistory.push({ role: 'assistant', content: fullText });
        displayMessages.push({ role: 'bot', content: fullText });
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
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'history-item' + (chat.id === currentChatId ? ' active' : '');
        item.innerHTML = `
            <span class="history-item-icon">${SVG.chat}</span>
            <div class="history-item-info">
                <span class="history-item-title">${escapeHtml(chat.title)}</span>
                <span class="history-item-time">${formatTimeAgo(chat.timestamp)}</span>
            </div>
            <button class="history-delete-btn" title="Delete">${SVG.close}</button>
        `;
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.history-delete-btn')) {
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

function showTypingIndicator() {
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
    text.textContent = 'Thinking...';

    indicator.appendChild(avatar);
    indicator.appendChild(dots);
    indicator.appendChild(text);
    messagesContainer.appendChild(indicator);
    scrollToBottom();
}

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

function getModePrefix() {
    if (currentMode === 'code') {
        return "You are in Code Writer mode. Please provide complete, production-ready code with clear explanations. ";
    }
    return "";
}

async function sendMessage(text) {
    console.debug('[DEBUG] sendMessage invoked', { textLen: text ? text.length : 0, isStreaming, editingQueueId });
    if (!text) return;

    isStreaming = true;
    sendBtn.disabled = true;
    userInput.value = '';
    autoResize();

    const userText = getModePrefix() + text;

    conversationHistory.push({ role: 'user', content: userText });
    displayMessages.push({ role: 'user', content: text });
    addMessage('user', text);
    showTypingIndicator();

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

        const { bubble, contentDiv } = addMessage('bot', 'Thinking...');
        let firstChunk = true;

        // Thinking token state
        // Protocol: server prefixes reasoning chunks with \x01, sends \x02 once to signal content start
        let thinkingDiv = null;
        let thinkingContent = null;

        function ensureThinkingBlock() {
            if (!thinkingDiv) {
                thinkingDiv = document.createElement('div');
                thinkingDiv.className = 'thinking-block';
                const header = document.createElement('div');
                header.className = 'thinking-header';
                header.innerHTML = '<span class="thinking-toggle">' + SVG_CHEVRON_RIGHT + '</span> Thinking';
                thinkingContent = document.createElement('div');
                thinkingContent.className = 'thinking-content';
                header.addEventListener('click', () => {
                    thinkingDiv.classList.toggle('expanded');
                    header.querySelector('.thinking-toggle').innerHTML =
                        thinkingDiv.classList.contains('expanded') ? SVG_CHEVRON_DOWN : SVG_CHEVRON_RIGHT;
                });
                thinkingDiv.appendChild(header);
                thinkingDiv.appendChild(thinkingContent);
                bubble.insertBefore(thinkingDiv, bubble.firstChild);
            }
        }

        function parseStream(raw) {
            // Split on the \x02 separator (thinking done → content begins)
            const sepIdx = raw.indexOf('\x02');
            let thinkingRaw, mainText;
            if (sepIdx === -1) {
                // Still in thinking phase (no \x02 yet)
                thinkingRaw = raw;
                mainText = '';
            } else {
                thinkingRaw = raw.slice(0, sepIdx);
                mainText = raw.slice(sepIdx + 1);
            }
            // Each reasoning token starts with \x01; strip them all to get plain text
            const thinkingText = thinkingRaw.replace(/\x01/g, '');
            return { thinkingText, mainText };
        }

        // Typewriter state — paces the main response text independent of chunk speed
        let twTarget  = '';  // full text received so far
        let twPos     = 0;   // chars revealed so far
        let twTimer   = null;
        let streamDone = false;

        const TW_CHARS_PER_TICK = 6;   // chars revealed per tick
        const TW_TICK_MS        = 14;  // ~70 chars/s — feels natural

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
                ensureThinkingBlock();
                thinkingContent.innerHTML = renderMarkdown(thinkingText);
            }
            if (mainText && mainText !== twTarget) {
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

        // If no typewriter was started (no main content), clear immediately
        if (twTimer === null && twTarget) {
            typewriterTick();
        }

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

userInput.addEventListener('input', autoResize);

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
