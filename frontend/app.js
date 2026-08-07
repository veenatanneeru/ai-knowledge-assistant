const API = "http://localhost:8000/api";

// ── Load saved data ──
let chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
let uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
let theme = localStorage.getItem("theme") || "dark";
let currentKB = localStorage.getItem("currentKB") || "default";

// ── Apply saved theme ──
document.documentElement.setAttribute("data-theme", theme);
document.getElementById("theme-toggle").textContent = theme === "dark" ? "🌙" : "☀️";

// ── Restore chat ──
function restoreChat() {
  const win = document.getElementById("chat-window");
  win.innerHTML = "";
  if (chatHistory.length === 0) {
    win.innerHTML = `<div class="message assistant-msg">
      <strong>Assistant:</strong> Hello! Upload a PDF, TXT, DOCX, or URL and ask me anything.
    </div>`;
    return;
  }
  chatHistory.forEach(msg => {
    addMessage(msg.content, msg.role === "user" ? "user" : "assistant", null, false);
  });
}

// ── Render file list ──
function renderFileList() {
  const list = document.getElementById("file-list");
  list.innerHTML = uploadedFiles.map(f =>
    `<div class="file-item">📄 ${f}</div>`
  ).join("");
  localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
}

// ── Health check ──
async function checkHealth() {
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    document.getElementById("doc-count").textContent =
      `${data.documents_indexed} chunks indexed`;
    updateKBDropdown(data.collections || []);
  } catch {
    document.getElementById("doc-count").textContent = "API offline";
  }
}

// ── Knowledge Base ──
function updateKBDropdown(collections) {
  const select = document.getElementById("kb-select");
  const current = select.value;
  select.innerHTML = "";
  const all = collections.length > 0 ? collections : ["default"];
  all.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    if (name === currentKB) opt.selected = true;
    select.appendChild(opt);
  });
}

function showNewKB() {
  const row = document.getElementById("new-kb-row");
  row.style.display = row.style.display === "none" ? "flex" : "none";
}

async function createKB() {
  const name = document.getElementById("kb-name-input").value.trim();
  if (!name) return;

  await fetch(`${API}/collection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  currentKB = name;
  localStorage.setItem("currentKB", name);
  document.getElementById("new-kb-row").style.display = "none";
  document.getElementById("kb-name-input").value = "";
  checkHealth();
}

document.getElementById("kb-select").addEventListener("change", async (e) => {
  currentKB = e.target.value;
  localStorage.setItem("currentKB", currentKB);
  await fetch(`${API}/collection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: currentKB })
  });
  checkHealth();
});

// ── Theme toggle ──
document.getElementById("theme-toggle").addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("theme-toggle").textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem("theme", theme);
});

// ── File Upload ──
document.getElementById("file-input").addEventListener("change", (e) => {
  if (e.target.files[0]) uploadFile(e.target.files[0]);
});

const dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});

async function uploadFile(file) {
  const status = document.getElementById("upload-status");
  status.className = "loading";
  status.textContent = `⏳ Uploading ${file.name}...`;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API}/upload`, { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      status.className = "success";
      status.textContent = `✅ ${data.message}`;
      uploadedFiles.push(file.name);
      renderFileList();
      checkHealth();
      // Auto summarize
      autoSummarize(file);
    } else {
      status.className = "error";
      status.textContent = `❌ Error: ${data.detail}`;
    }
  } catch {
    status.className = "error";
    status.textContent = "❌ Could not reach API.";
  }
}

// ── Auto Summary ──
async function autoSummarize(file) {
  const box = document.getElementById("summary-box");
  const text = document.getElementById("summary-text");
  box.style.display = "block";
  text.textContent = "⏳ Generating summary...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API}/summarize`, { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      text.innerHTML = data.summary.replace(/\n/g, "<br>");
    } else {
      text.textContent = "Could not generate summary.";
    }
  } catch {
    text.textContent = "Could not reach API.";
  }
}

// ── URL Upload ──
async function uploadURL() {
  const input = document.getElementById("url-input");
  const url = input.value.trim();
  if (!url) return;

  const status = document.getElementById("upload-status");
  status.className = "loading";
  status.textContent = `⏳ Loading URL...`;

  try {
    const res = await fetch(`${API}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    if (res.ok) {
      status.className = "success";
      status.textContent = `✅ ${data.message}`;
      uploadedFiles.push(url);
      renderFileList();
      checkHealth();
      input.value = "";
    } else {
      status.className = "error";
      status.textContent = `❌ Error: ${data.detail}`;
    }
  } catch {
    status.className = "error";
    status.textContent = "❌ Could not reach API.";
  }
}

// ── Chat ──
async function sendQuestion() {
  const input = document.getElementById("question-input");
  const question = input.value.trim();
  if (!question) return;

  addMessage(question, "user");
  input.value = "";

  const thinking = document.createElement("div");
  thinking.className = "thinking";
  thinking.textContent = "🤔 Thinking...";
  document.getElementById("chat-window").appendChild(thinking);
  scrollChat();

  try {
    const res = await fetch(`${API}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, chat_history: chatHistory })
    });
    const data = await res.json();
    thinking.remove();
    addMessage(data.answer, "assistant", data.sources_used);
  } catch {
    thinking.remove();
    addMessage("❌ Error: Could not reach the server.", "assistant");
  }
}

function addMessage(text, role, sources = null, save = true) {
  const win = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = `message ${role}-msg`;

  if (role === "assistant") {
    div.innerHTML = `<strong>Assistant:</strong> ${text}` +
      (sources ? `<div class="sources-tag">📚 ${sources} source chunk(s) used</div>` : "");
  } else {
    div.textContent = text;
  }

  win.appendChild(div);
  scrollChat();

  if (save) {
    chatHistory.push({ role: role === "user" ? "user" : "assistant", content: text });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }
}

function scrollChat() {
  const win = document.getElementById("chat-window");
  win.scrollTop = win.scrollHeight;
}

// ── Export Chat as PDF ──
document.getElementById("export-btn").addEventListener("click", async () => {
  if (chatHistory.length === 0) {
    alert("No chat history to export!");
    return;
  }

  try {
    const res = await fetch(`${API}/export-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatHistory)
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-export.pdf";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert("Could not export chat.");
  }
});

// ── Clear Chat ──
document.getElementById("clear-chat-btn").addEventListener("click", () => {
  chatHistory = [];
  localStorage.removeItem("chatHistory");
  restoreChat();
});

// ── Reset Knowledge Base ──
document.getElementById("reset-btn").addEventListener("click", async () => {
  if (!confirm("Clear all indexed documents?")) return;
  await fetch(`${API}/reset`, { method: "DELETE" });
  uploadedFiles = [];
  chatHistory = [];
  localStorage.removeItem("chatHistory");
  localStorage.removeItem("uploadedFiles");
  renderFileList();
  checkHealth();
  restoreChat();
  document.getElementById("summary-box").style.display = "none";
});

// ── Init ──
restoreChat();
renderFileList();
checkHealth();