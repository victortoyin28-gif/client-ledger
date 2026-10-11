const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'clients.json');

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
  }
];

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultClients, null, 2), 'utf8');
  }
}

function readClients() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultClients;
  } catch (error) {
    return defaultClients;
  }
}

function writeClients(clients) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2), 'utf8');
}

function createClientId() {
  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  const escaped = stringValue.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function serializeCsv(clients) {
  const headers = ['id', 'name', 'email', 'phone', 'status', 'balance', 'notes'];
  const lines = [headers.join(',')];

  for (const client of clients) {
    lines.push(
      headers
        .map((header) => escapeCsvValue(client[header]))
        .join(',')
    );
  }

  return lines.join('\n');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  res.end(JSON.stringify(payload, null, 2));
}

function sendCsv(res, clients) {
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="client-ledger.csv"',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(serializeCsv(clients));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '/api') {
    sendJson(res, 200, {
      name: 'Client Ledger API',
      status: 'ok',
      endpoints: [
        'GET /api/clients',
        'POST /api/clients',
        'PUT /api/clients/:id',
        'DELETE /api/clients/:id',
        'GET /api/clients/export.csv'
      ]
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/clients') {
    sendJson(res, 200, readClients());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/clients/export.csv') {
    sendCsv(res, readClients());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/clients') {
    try {
      const data = await parseBody(req);
      const safeClient = {
        id: data.id || createClientId(),
        name: String(data.name || '').trim(),
        email: String(data.email || '').trim(),
        phone: String(data.phone || '').trim(),
        status: data.status || 'active',
        balance: Number(data.balance || 0),
        notes: String(data.notes || '').trim()
      };

      if (!safeClient.name || !safeClient.email || !safeClient.phone) {
        sendJson(res, 400, { error: 'name, email, and phone are required' });
        return;
      }

      const clients = readClients();
      clients.unshift(safeClient);
      writeClients(clients);
      sendJson(res, 201, safeClient);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Bad request' });
    }
    return;
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/clients/')) {
    try {
      const data = await parseBody(req);
      const id = url.pathname.split('/').pop();
      const clients = readClients();
      const index = clients.findIndex((client) => client.id === id);

      if (index === -1) {
        sendJson(res, 404, { error: 'Client not found' });
        return;
      }

      const updatedClient = {
        ...clients[index],
        name: String(data.name || clients[index].name).trim(),
        email: String(data.email || clients[index].email).trim(),
        phone: String(data.phone || clients[index].phone).trim(),
        status: data.status || clients[index].status,
        balance: Number(data.balance ?? clients[index].balance),
        notes: String(data.notes ?? clients[index].notes).trim()
      };

      clients[index] = updatedClient;
      writeClients(clients);
      sendJson(res, 200, updatedClient);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Bad request' });
    }
    return;
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/clients/')) {
    const id = url.pathname.split('/').pop();
    const clients = readClients();
    const filtered = clients.filter((client) => client.id !== id);

    if (filtered.length === clients.length) {
      sendJson(res, 404, { error: 'Client not found' });
      return;
    }

    writeClients(filtered);
    sendJson(res, 200, { deleted: true, id });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Client Ledger API running on http://localhost:${PORT}`);
});
