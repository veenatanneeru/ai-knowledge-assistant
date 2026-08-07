const API = "http://localhost:8000/api";
let chatHistory = [];
let uploadedFiles = [];

async function checkHealth() {
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    document.getElementById("doc-count").textContent =
      `${data.documents_indexed} chunks indexed`;
  } catch {
    document.getElementById("doc-count").textContent = "API offline";
  }
}

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
  if (file && file.name.endsWith(".pdf")) uploadFile(file);
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
    } else {
      status.className = "error";
      status.textContent = `❌ Error: ${data.detail}`;
    }
  } catch (err) {
    status.className = "error";
    status.textContent = "❌ Could not reach API. Is the server running?";
  }
}

function renderFileList() {
  const list = document.getElementById("file-list");
  list.innerHTML = uploadedFiles.map(f =>
    `<div class="file-item">📄 ${f}</div>`
  ).join("");
}

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

    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: data.answer });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);

  } catch {
    thinking.remove();
    addMessage("❌ Error: Could not reach the server.", "assistant");
  }
}

function addMessage(text, role, sources = null) {
  const win = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = `message ${role}-msg`;

  if (role === "assistant") {
    div.innerHTML = `<strong>Assistant:</strong> ${text}` +
      (sources ? `<div style="margin-top:8px;font-size:0.78rem;color:#64748b">📚 ${sources} source chunk(s) used</div>` : "");
  } else {
    div.textContent = text;
  }

  win.appendChild(div);
  scrollChat();
}

function scrollChat() {
  const win = document.getElementById("chat-window");
  win.scrollTop = win.scrollHeight;
}

document.getElementById("reset-btn").addEventListener("click", async () => {
  if (!confirm("Clear all indexed documents?")) return;
  await fetch(`${API}/reset`, { method: "DELETE" });
  uploadedFiles = [];
  chatHistory = [];
  renderFileList();
  checkHealth();
  document.getElementById("upload-status").className = "";
  document.getElementById("upload-status").textContent = "";
  document.getElementById("chat-window").innerHTML =
    `<div class="message assistant-msg"><strong>Assistant:</strong> Knowledge base cleared. Upload a new PDF to get started.</div>`;
});

checkHealth();