# KawaiiGPT

A kawaii-themed AI chatbot and code writer with pluggable model providers (Alibaba Qwen or OpenRouter) and Flask.

## Architecture

- **Backend**: Python Flask (`app.py`) serving on port 5000
- **Frontend**: Vanilla HTML/CSS/JS with markdown + syntax highlighting (highlight.js + marked.js)
- **AI**: OpenAI GPT-4o via streaming API
- **Original installer**: `kawaii.py` (kept for reference, not used in web mode)

## Project Structure

```
app.py              - Flask backend with streaming chat endpoint
kawaii.py           - Original CLI installer (unused in web mode)
templates/
  index.html        - Main chat UI
static/
  css/style.css     - Dark purple-themed UI styles
  js/app.js         - Chat logic, markdown rendering, streaming
```

## Features

- Real-time streaming responses
- Markdown + syntax-highlighted code blocks
- Chat mode and Code Writer mode
- Quick prompt shortcuts
- New chat / clear chat
- Mobile responsive sidebar
- Copy code button on all code blocks

## Environment Variables

- `PROVIDER` - Optional. Choose `qwen` (default) or `openrouter`.
- `QWEN_API_KEY` - Required when using `PROVIDER=qwen` (do NOT commit this key to source control).
- `QWEN_API_URL` - Required when using `PROVIDER=qwen`. Set this to your Qwen REST endpoint (or set `AI_BASE_URL`).
- `OPENROUTER_API_KEY` - Required when using `PROVIDER=openrouter`.
- `AI_BASE_URL` - Optional base URL override for the selected provider.
- `MODEL_NAME` - Optional. Defaults to `Qwen-Plus/Flash` for Qwen and `openrouter/hunter-alpha` for OpenRouter.

## Running

The app runs via the "Start application" workflow:
```
python3 app.py
```
Serves on `0.0.0.0:5000`.
