const STORAGE_KEY = 'client-ledger-data';
const THEME_KEY = 'client-ledger-theme';
const defaultClients = [
  {
    id: 'client-1',
    name: 'Ava Thompson',
    email: 'ava@example.com',
    phone: '(415) 555-0142',
    status: 'active',
    balance: 2400,
    notes: 'Website design retainer due next Friday.'
  },
  {
    id: 'client-2',
    name: 'Liam Patel',
    email: 'liam@example.com',
    phone: '(212) 555-0118',
    status: 'pending',
    balance: 875,
    notes: 'Awaiting final invoice approval.'
  },
  {
    id: 'client-3',
    name: 'Noah Garcia',
    email: 'noah@example.com',
    phone: '(310) 555-0195',
    status: 'inactive',
    balance: 0,
    notes: 'Previously engaged on a branding project.'
  },
  {
    id: 'client-4',
    name: 'Sophia Lee',
    email: 'sophia@example.com',
    phone: '(646) 555-0178',
    status: 'active',
    balance: 1320,
    notes: 'Monthly marketing support package.'
  },
  {
    id: 'client-5',
    name: 'Lucas Brown',
    email: 'lucas@example.com',
    phone: '(512) 555-0136',
    status: 'pending',
    balance: 460,
    notes: 'Waiting on scope confirmation for new landing page.'
  },
  {
    id: 'client-6',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    phone: '(702) 555-0104',
    status: 'active',
    balance: 3150,
    notes: 'Quarterly consulting contract renewed this month.'
  },
  {
    id: 'client-7',
    name: 'Daniel Kim',
    email: 'daniel@example.com',
    phone: '(206) 555-0160',
    status: 'inactive',
    balance: 210,
    notes: 'Final follow-up for prior invoice settlement.'
  },
  {
    id: 'client-8',
    name: 'Olivia Martinez',
    email: 'olivia@example.com',
    phone: '(305) 555-0189',
    status: 'active',
    balance: 1750,
    notes: 'Brand refresh and CMS migration in progress.'
  }
];

const form = document.getElementById('clientForm');
const clientIdInput = document.getElementById('clientId');
const formTitle = document.getElementById('formTitle');
const searchInput = document.getElementById('searchInput');
const clientTableBody = document.getElementById('clientTableBody');
const totalBalanceEl = document.getElementById('totalBalance');
const resetFormBtn = document.getElementById('resetFormBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const themeToggle = document.getElementById('themeToggle');

let editingId = null;

function createClientId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getClients() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClients));
      return [...defaultClients];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultClients];
  } catch (error) {
    console.warn('Client data could not be read from localStorage:', error);
    return [...defaultClients];
  }
}

function saveClients(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value || 0));
}

function applyTheme(theme) {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', resolvedTheme);
  localStorage.setItem(THEME_KEY, resolvedTheme);
  themeToggle.textContent = resolvedTheme === 'dark' ? '☀️' : '🌙';
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (preferredDark ? 'dark' : 'light'));
}

function setFormMode(isEdit) {
  formTitle.textContent = isEdit ? 'Edit Client' : 'Add Client';
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = isEdit ? 'Update client' : 'Save client';
  }
}

function resetForm() {
  form.reset();
  clientIdInput.value = '';
  editingId = null;
  setFormMode(false);
  document.getElementById('name').focus();
}

function renderSummary(clients) {
  const total = clients.reduce((sum, client) => sum + Number(client.balance || 0), 0);
  totalBalanceEl.textContent = formatCurrency(total);
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  const escaped = stringValue.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function exportClientsToCsv() {
  const clients = getClients();
  const headers = ['id', 'name', 'email', 'phone', 'status', 'balance', 'notes'];

  const lines = [
    headers.join(','),
    ...clients.map((client) =>
      headers
        .map((header) => escapeCsvValue(client[header]))
        .join(',')
    )
  ];

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `client-ledger-${now}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function renderClients() {
  const clients = getClients();
  const query = (searchInput.value || '').trim().toLowerCase();

  const filtered = clients.filter((client) => {
    const haystack = `${client.name} ${client.email}`.toLowerCase();
    return haystack.includes(query);
  });

  renderSummary(clients);

  if (!filtered.length) {
    clientTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No clients match your search.</td>
      </tr>
    `;
    return;
  }

  clientTableBody.innerHTML = filtered
    .map(
      (client) => `
        <tr>
          <td>
            <strong>${client.name}</strong>
            <small>${client.notes || 'No notes added'}</small>
          </td>
          <td>${client.email}<br /><small>${client.phone}</small></td>
          <td><span class="status-badge status-${client.status}">${client.status}</span></td>
          <td>${formatCurrency(client.balance)}</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="secondary" data-action="edit" data-id="${client.id}">Edit</button>
              <button type="button" class="danger" data-action="delete" data-id="${client.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

function handleSubmit(event) {
  event.preventDefault();

  const clients = getClients();
  const payload = {
    id: clientIdInput.value || createClientId(),
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    status: document.getElementById('status').value,
    balance: Number(document.getElementById('balance').value || 0),
    notes: document.getElementById('notes').value.trim()
  };

  if (!payload.name || !payload.email || !payload.phone) {
    return;
  }

  if (editingId) {
    const index = clients.findIndex((client) => client.id === editingId);
    if (index >= 0) {
      clients[index] = { ...clients[index], ...payload, id: editingId };
    }
  } else {
    clients.unshift(payload);
  }

  saveClients(clients);
  renderClients();
  resetForm();
}

function handleTableClick(event) {
  const actionTarget = event.target.closest('button[data-action]');
  if (!actionTarget) return;

  const { action, id } = actionTarget.dataset;
  const clients = getClients();

  if (action === 'delete') {
    const nextClients = clients.filter((client) => client.id !== id);
    saveClients(nextClients);
    renderClients();
    if (editingId === id) {
      resetForm();
    }
    return;
  }

  if (action === 'edit') {
    const client = clients.find((entry) => entry.id === id);
    if (!client) return;

    editingId = client.id;
    clientIdInput.value = client.id;
    document.getElementById('name').value = client.name;
    document.getElementById('email').value = client.email;
    document.getElementById('phone').value = client.phone;
    document.getElementById('status').value = client.status;
    document.getElementById('balance').value = client.balance;
    document.getElementById('notes').value = client.notes || '';
    setFormMode(true);
    document.getElementById('name').focus();
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
    });
  }
}

form.addEventListener('submit', handleSubmit);
searchInput.addEventListener('input', renderClients);
clientTableBody.addEventListener('click', handleTableClick);
resetFormBtn.addEventListener('click', resetForm);
exportCsvBtn.addEventListener('click', exportClientsToCsv);
themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

registerServiceWorker();
initTheme();
renderClients();
resetForm();
