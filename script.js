/* Client Ledger - Base Styles */
:root {
  --bg: #eef4ff;
  --panel: #ffffff;
  --panel-alt: #f8fafc;
  --border: #dfe7f5;
  --text: #0f172a;
  --muted: #475569;
  --accent: #2563eb;
  --accent-soft: rgba(37, 99, 235, 0.12);
  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #dc2626;
  --shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  font-family: Inter, "Segoe UI", sans-serif;
  background: linear-gradient(135deg, #eef4ff 0%, #f8fafc 100%);
  color: var(--text);
}

body {
  min-height: 100vh;
  padding: 32px 20px;
}

button, input, select, textarea {
  font: inherit;
}

.page-shell {
  max-width: 1200px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1, h2 {
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.summary {
  background: linear-gradient(135deg, var(--accent), #1d4ed8);
  color: white;
  padding: 16px 20px;
  border-radius: 18px;
  min-width: 180px;
  box-shadow: var(--shadow);
}

.summary span {
  display: block;
  font-size: 0.8rem;
  opacity: 0.8;
}

.summary strong {
  display: block;
  margin-top: 8px;
  font-size: 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 24px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow);
  padding: 22px;
}

.form-panel {
  height: fit-content;
}

#clientForm {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

label {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-weight: 600;
}

input, select, textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--panel-alt);
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.inline-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

button.primary {
  background: var(--accent);
  color: white;
}

button.secondary {
  background: #e2e8f0;
  color: var(--text);
}

button.danger {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

#searchInput {
  max-width: 240px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;
}

th, td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}

th {
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

td strong {
  display: block;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-active {
  background: rgba(22, 163, 74, 0.12);
  color: var(--success);
}

.status-pending {
  background: rgba(245, 158, 11, 0.12);
  color: var(--warning);
}

.status-inactive {
  background: rgba(100, 116, 139, 0.12);
  color: #475569;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  padding: 20px 12px;
  color: var(--muted);
  text-align: center;
}

@media (max-width: 820px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .topbar,
  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  #searchInput {
    max-width: none;
  }
}
