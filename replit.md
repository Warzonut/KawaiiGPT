# KawaiiGPT

A kawaii-themed AI chatbot and code writer with pluggable model providers (Alibaba Qwen or Hugging Face) and Flask.

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

- `PROVIDER` - Optional. Choose `qwen` (default) or `huggingface`.
- `QWEN_API_KEY` - Required when using `PROVIDER=qwen` (do NOT commit this key to source control).
- `QWEN_API_URL` - Required when using `PROVIDER=qwen`. Set this to your Qwen REST endpoint (or set `AI_BASE_URL`).
- `HF_TOKEN` - Required when using `PROVIDER=huggingface`. Your Hugging Face API token.
- `AI_BASE_URL` - Optional base URL override for the selected provider.
- `MODEL_NAME` - Optional. Defaults to `qwen/qwen3.6-plus:free` for Qwen and `Qwen/Qwen2.5-14B-Instruct-1M` for Hugging Face.

## Running

The app runs via the "Start application" workflow:
```
python3 app.py
```
Serves on `0.0.0.0:5000`.
