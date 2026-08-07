/* ── Theme Variables ── */
:root {
  --bg: #0f1117;
  --surface: #1a1d27;
  --surface2: #1e2235;
  --border: #2d3148;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --text-faint: #64748b;
  --accent: #7c6af7;
  --accent-hover: #6a57e8;
  --success: #4ade80;
  --error: #f87171;
  --user-msg: #7c6af7;
}

[data-theme="light"] {
  --bg: #f1f5f9;
  --surface: #ffffff;
  --surface2: #f8fafc;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-muted: #64748b;
  --text-faint: #94a3b8;
  --accent: #6d55f5;
  --accent-hover: #5a45e0;
  --success: #16a34a;
  --error: #dc2626;
  --user-msg: #6d55f5;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  transition: background 0.3s, color 0.3s;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.logo { font-size: 1.3rem; font-weight: 700; color: var(--accent); }

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.main {
  display: grid;
  grid-template-columns: 380px 1fr;
  height: calc(100vh - 60px);
}

.panel {
  padding: 24px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.panel h2 { font-size: 1rem; color: var(--text-muted); font-weight: 600; }

/* Drop Zone */
.drop-zone {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: var(--surface2);
}

.drop-zone:hover, .drop-zone.dragover {
  border-color: var(--accent);
  background: rgba(124, 106, 247, 0.08);
}

.drop-icon { font-size: 2rem; }
.drop-zone p { font-size: 0.85rem; color: var(--text-faint); }

/* URL Section */
.url-section { display: flex; flex-direction: column; gap: 8px; }

.url-row {
  display: flex;
  gap: 8px;
}

.url-row input {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 0.85rem;
  outline: none;
}

.url-row input:focus { border-color: var(--accent); }
.url-row input::placeholder { color: var(--text-faint); }

/* Buttons */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-primary:hover { background: var(--accent-hover); }

.btn-danger {
  background: transparent;
  color: var(--error);
  border: 1px solid var(--error);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-danger:hover { background: rgba(248, 113, 113, 0.1); }

.btn-icon {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-icon:hover { border-color: var(--accent); }

.btn-small {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
}

.btn-small:hover { border-color: var(--accent); color: var(--accent); }

/* Status */
#upload-status {
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 6px;
  display: none;
}

#upload-status.success {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
  display: block;
}

#upload-status.error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--error);
  display: block;
}

#upload-status.loading {
  background: rgba(124, 106, 247, 0.15);
  color: var(--accent);
  display: block;
}

/* File List */
.file-list { display: flex; flex-direction: column; gap: 8px; }

.file-item {
  background: var(--surface2);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--text-muted);
  border-left: 3px solid var(--accent);
  word-break: break-all;
}

/* Chat */
.chat-panel { border-right: none; }

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0;
  max-height: calc(100vh - 200px);
}

.message {
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 88%;
}

.user-msg {
  background: var(--user-msg);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.assistant-msg {
  background: var(--surface2);
  color: var(--text);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.assistant-msg strong { color: var(--accent); display: block; margin-bottom: 6px; }

.chat-input-row {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.chat-input-row input {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
}

.chat-input-row input:focus { border-color: var(--accent); }
.chat-input-row input::placeholder { color: var(--text-faint); }

.thinking {
  color: var(--accent);
  font-style: italic;
  font-size: 0.85rem;
  padding: 8px;
}

.sources-tag {
  margin-top: 8px;
  font-size: 0.78rem;
  color: var(--text-faint);
}