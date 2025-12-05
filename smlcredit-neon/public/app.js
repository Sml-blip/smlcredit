// ==================== CONFIG ====================
const API_BASE = import.meta.env.VITE_API_URL || '/.netlify/functions';
const ADMIN_PIN = "1234"; // Default PIN

// ==================== DATA MODEL ====================
let suppliers = [];
let clients = [];
let adminPin = ADMIN_PIN;

// Current state
let currentEntityType = null; // 'supplier' or 'client'
let currentEntityId = null;
let isLoading = false;

// ==================== API CALLS ====================
async function apiCall(endpoint, method = 'GET', data = null) {
  const pin = sessionStorage.getItem('adminPin') || adminPin;
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pin}`,
        'X-Admin-Pin': pin
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== LOAD DATA FROM DATABASE ====================
async function loadData() {
  try {
    isLoading = true;
    const [suppliersData, clientsData] = await Promise.all([
      apiCall('/suppliers'),
      apiCall('/clients')
    ]);

    suppliers = suppliersData.map(s => ({
      id: s.id,
      name: s.name,
      totalDebt: parseFloat(s.total_debt),
      phone: s.phone,
      transactions: s.transactions || [],
      createdAt: s.created_at
    }));

    clients = clientsData.map(c => ({
      id: c.id,
      name: c.name,
      totalDebt: parseFloat(c.total_debt),
      phone: c.phone,
      dueDay: c.due_day,
      nextDueDate: c.next_due_date,
      transactions: c.transactions || [],
      createdAt: c.created_at
    }));

    renderSuppliers();
    renderClients();
  } catch (error) {
    console.error('Failed to load data:', error);
    alert('Failed to load data from database. Check your connection and PIN.');
  } finally {
    isLoading = false;
  }
}

// ==================== ADMIN LOGIN ====================
function checkLogin() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const loginModal = document.getElementById('loginModal');
  const mainApp = document.getElementById('mainApp');

  if (isLoggedIn === 'true') {
    loginModal.classList.remove('active');
    mainApp.style.filter = 'none';
    mainApp.style.pointerEvents = 'auto';
    loadData(); // Load data after login
  } else {
    loginModal.classList.add('active');
    mainApp.style.filter = 'blur(5px)';
    mainApp.style.pointerEvents = 'none';
  }
}

function login(e) {
  e.preventDefault();
  const pinInput = document.getElementById('adminPin');
  const pin = pinInput.value;

  // Store PIN for API calls
  sessionStorage.setItem('adminPin', pin);
  adminPin = pin;

  // Try to load data to verify PIN
  loadData().then(() => {
    sessionStorage.setItem('adminLoggedIn', 'true');
    checkLogin();
    pinInput.value = '';
  }).catch(() => {
    alert('Incorrect PIN or database connection failed');
    pinInput.value = '';
    sessionStorage.removeItem('adminPin');
  });
}

// ==================== UTILITY FUNCTIONS ====================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount) {
  return `${amount.toFixed(2)} TND`;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getEntityData(type) {
  return type === 'supplier' ? suppliers : clients;
}

function findEntity(type, id) {
  const data = getEntityData(type);
  return data.find(entity => entity.id === id);
}

function calculateNextDueDate(day) {
  const today = new Date();
  let nextDue = new Date(today.getFullYear(), today.getMonth(), day);

  if (today.getDate() > day) {
    nextDue.setMonth(nextDue.getMonth() + 1);
  }

  return nextDue.toISOString().split('T')[0]; // YYYY-MM-DD
}

function isOverdue(entity) {
  if (!entity.nextDueDate || entity.totalDebt <= 0) return false;
  const today = new Date();
  const dueDate = new Date(entity.nextDueDate);
  dueDate.setHours(23, 59, 59, 999);
  return today > dueDate;
}

// ==================== RENDERING ====================
function renderSuppliers() {
  const container = document.getElementById('suppliersList');

  if (suppliers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p>No suppliers yet. Add your first supplier to track debts.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = suppliers.map(supplier => renderEntityCard(supplier, 'supplier')).join('');
}

function renderClients() {
  const container = document.getElementById('clientsList');

  if (clients.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <p>No clients yet. Add your first client to track receivables.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = clients.map(client => renderEntityCard(client, 'client')).join('');
}

function renderEntityCard(entity, type) {
  const maxDebt = 10000;
  const percentage = Math.min((entity.totalDebt / maxDebt) * 100, 100);

  const overdue = type === 'client' && isOverdue(entity);
  const overdueClass = overdue ? 'overdue' : '';

  let dueDateHtml = '';
  if (type === 'client' && entity.nextDueDate) {
    const date = new Date(entity.nextDueDate);
    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dueDateHtml = `
            <div class="due-date-info ${overdue ? 'overdue' : ''}">
                <span>📅 Due: ${formattedDate}</span>
                ${overdue ? '<span>⚠️ OVERDUE</span>' : ''}
            </div>
        `;
  }

  let phoneHtml = '';
  if (entity.phone) {
    phoneHtml = `
            <div class="phone-info">
                <span>📞 ${entity.phone}</span>
            </div>
        `;
  }

  return `
    <div class="entity-card ${overdueClass}">
      <div class="entity-header">
        <div>
          <div class="entity-name">${entity.name}</div>
          <div class="entity-amount">${formatCurrency(entity.totalDebt)}</div>
          ${phoneHtml}
          ${dueDateHtml}
        </div>
        <div class="entity-actions">
          <button class="btn btn-add" onclick="openTransactionModal('${type}', '${entity.id}', 'debt')" title="Add Debt">
            +
          </button>
          <button class="btn btn-subtract" onclick="openTransactionModal('${type}', '${entity.id}', 'payment')" title="Record Payment">
            −
          </button>
          <button class="btn btn-icon" onclick="openHistoryModal('${type}', '${entity.id}')" title="View History">
            📊
          </button>
          <button class="btn btn-icon" onclick="openShareLinkModal('${type}', '${entity.id}')" title="Share">
            🔗
          </button>
          <button class="btn btn-icon" onclick="deleteEntity('${type}', '${entity.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </div>
      <div class="progress-container">
        <div class="progress-label">
          <span>Debt Progress</span>
          <span>${percentage.toFixed(1)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    </div>
  `;
}

// ==================== ENTITY MANAGEMENT ====================
function openAddEntityModal(type) {
  currentEntityType = type;
  const modal = document.getElementById('addEntityModal');
  const title = document.getElementById('addEntityModalTitle');
  const dueDayGroup = document.getElementById('dueDayGroup');

  title.textContent = type === 'supplier' ? 'Add Supplier' : 'Add Client';

  if (type === 'client') {
    dueDayGroup.style.display = 'block';
  } else {
    dueDayGroup.style.display = 'none';
  }

  document.getElementById('entityName').value = '';
  document.getElementById('initialDebt').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('clientDueDay').value = '';

  modal.classList.add('active');
}

function closeAddEntityModal() {
  document.getElementById('addEntityModal').classList.remove('active');
  currentEntityType = null;
}

async function addEntity() {
  const name = document.getElementById('entityName').value.trim();
  const initialDebt = parseFloat(document.getElementById('initialDebt').value) || 0;
  const phone = document.getElementById('clientPhone').value.trim();
  const dueDay = parseInt(document.getElementById('clientDueDay').value);

  if (!name) {
    alert('Please enter a name');
    return;
  }

  try {
    const id = generateId();
    const now = Date.now();

    const entity = {
      id: id,
      name: name,
      totalDebt: initialDebt,
      phone: phone,
      transactions: []
    };

    if (currentEntityType === 'client' && dueDay && dueDay >= 1 && dueDay <= 31) {
      entity.dueDay = dueDay;
      entity.nextDueDate = calculateNextDueDate(dueDay);
    }

    if (initialDebt > 0) {
      entity.transactions.push({
        id: generateId(),
        amount: initialDebt,
        type: 'debt',
        date: now,
        note: 'Initial debt'
      });
    }

    const endpoint = currentEntityType === 'supplier' ? '/suppliers' : '/clients';
    const result = await apiCall(endpoint, 'POST', entity);

    if (currentEntityType === 'supplier') {
      suppliers.push(result);
      renderSuppliers();
    } else {
      clients.push(result);
      renderClients();
    }

    closeAddEntityModal();
  } catch (error) {
    alert('Failed to add entity: ' + error.message);
  }
}

async function deleteEntity(type, id) {
  const entityName = findEntity(type, id)?.name;

  if (!confirm(`Are you sure you want to delete "${entityName}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const endpoint = type === 'supplier' ? `/suppliers/${id}` : `/clients/${id}`;
    await apiCall(endpoint, 'DELETE');

    if (type === 'supplier') {
      suppliers = suppliers.filter(s => s.id !== id);
      renderSuppliers();
    } else {
      clients = clients.filter(c => c.id !== id);
      renderClients();
    }
  } catch (error) {
    alert('Failed to delete entity: ' + error.message);
  }
}

// ==================== TRANSACTION MANAGEMENT ====================
function openTransactionModal(type, id, transactionType = 'debt') {
  currentEntityType = type;
  currentEntityId = id;

  const entity = findEntity(type, id);
  const modal = document.getElementById('transactionModal');
  const title = document.getElementById('transactionModalTitle');

  title.textContent = `${entity.name} - Add Transaction`;

  const debtLabel = document.getElementById('debtLabel');
  const paymentLabel = document.getElementById('paymentLabel');

  if (type === 'supplier') {
    debtLabel.textContent = 'Add Debt';
    paymentLabel.textContent = 'Record Payment';
  } else {
    debtLabel.textContent = 'Add Charge';
    paymentLabel.textContent = 'Record Payment';
  }

  document.querySelector('input[name="transactionType"][value="' + transactionType + '"]').checked = true;
  document.getElementById('transactionAmount').value = '';
  document.getElementById('transactionNote').value = '';

  modal.classList.add('active');
}

function closeTransactionModal() {
  document.getElementById('transactionModal').classList.remove('active');
  currentEntityType = null;
  currentEntityId = null;
}

async function addTransaction() {
  const amount = parseFloat(document.getElementById('transactionAmount').value);
  const type = document.querySelector('input[name="transactionType"]:checked').value;
  const note = document.getElementById('transactionNote').value.trim();

  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  try {
    const transactionId = generateId();
    const now = Date.now();

    const transaction = {
      id: transactionId,
      amount: amount,
      type: type,
      date: now,
      note: note || null
    };

    const endpoint = currentEntityType === 'supplier' 
      ? `/transactions/supplier/${currentEntityId}`
      : `/transactions/client/${currentEntityId}`;

    const result = await apiCall(endpoint, 'POST', transaction);

    // Update local data
    const entity = findEntity(currentEntityType, currentEntityId);
    if (entity) {
      entity.totalDebt = parseFloat(result.total_debt);
      entity.transactions = result.transactions || [];
    }

    if (currentEntityType === 'supplier') {
      renderSuppliers();
    } else {
      renderClients();
    }

    closeTransactionModal();
  } catch (error) {
    alert('Failed to add transaction: ' + error.message);
  }
}

// ==================== HISTORY MODAL ====================
function openHistoryModal(type, id) {
  const entity = findEntity(type, id);
  const modal = document.getElementById('historyModal');
  const title = document.getElementById('historyModalTitle');
  const list = document.getElementById('transactionList');

  title.textContent = `${entity.name} - Transaction History`;

  if (!entity.transactions || entity.transactions.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No transactions yet.</p></div>';
  } else {
    list.innerHTML = entity.transactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-type ${tx.type}">${tx.type === 'debt' ? '➕ Debt' : '➖ Payment'}</div>
          <div class="transaction-date">${formatDate(tx.date)}</div>
          ${tx.note ? `<div class="transaction-note">${tx.note}</div>` : ''}
        </div>
        <div class="transaction-amount">${formatCurrency(tx.amount)}</div>
      </div>
    `).join('');
  }

  modal.classList.add('active');
}

function closeHistoryModal() {
  document.getElementById('historyModal').classList.remove('active');
}

// ==================== SHARE LINK MODAL ====================
function openShareLinkModal(type, id) {
  const entity = findEntity(type, id);
  const modal = document.getElementById('shareLinkModal');
  const input = document.getElementById('shareLinkInput');

  // Create a shareable link with entity data encoded
  const entityData = btoa(JSON.stringify({
    type: type,
    entity: entity
  }));

  const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
  const shareLink = `${baseUrl}public.html?data=${entityData}`;

  input.value = shareLink;
  modal.classList.add('active');
}

function closeShareLinkModal() {
  document.getElementById('shareLinkModal').classList.remove('active');
}

function copyShareLink() {
  const input = document.getElementById('shareLinkInput');
  input.select();
  document.execCommand('copy');

  const feedback = document.getElementById('copyFeedback');
  feedback.classList.add('show');
  setTimeout(() => feedback.classList.remove('show'), 2000);
}

// ==================== SETTINGS MODAL ====================
function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('active');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('active');
}

function downloadBackup() {
  const backup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    suppliers: suppliers,
    clients: clients
  };

  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `smlcredit-backup-${Date.now()}.json`;
  link.click();
}

function uploadBackup() {
  document.getElementById('restoreInput').click();
}

document.getElementById('restoreInput')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup.suppliers || !backup.clients) {
      alert('Invalid backup file format');
      return;
    }

    if (!confirm('This will replace all current data. Are you sure?')) {
      return;
    }

    // TODO: Implement restore to database
    alert('Restore functionality coming soon - please contact support');
  } catch (error) {
    alert('Failed to read backup file: ' + error.message);
  }
});

function resetData() {
  if (!confirm('This will delete ALL data permanently. Are you sure?')) {
    return;
  }

  if (!confirm('This action cannot be undone. Delete everything?')) {
    return;
  }

  // TODO: Implement reset in database
  alert('Reset functionality coming soon - please contact support');
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  checkLogin();

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', login);

  // Add entity buttons
  document.getElementById('addSupplierBtn')?.addEventListener('click', () => openAddEntityModal('supplier'));
  document.getElementById('addClientBtn')?.addEventListener('click', () => openAddEntityModal('client'));

  // Add entity modal
  document.getElementById('closeAddEntityModal')?.addEventListener('click', closeAddEntityModal);
  document.getElementById('cancelAddEntity')?.addEventListener('click', closeAddEntityModal);
  document.getElementById('submitAddEntity')?.addEventListener('click', addEntity);

  // Transaction modal
  document.getElementById('closeTransactionModal')?.addEventListener('click', closeTransactionModal);
  document.getElementById('cancelTransaction')?.addEventListener('click', closeTransactionModal);
  document.getElementById('submitTransaction')?.addEventListener('click', addTransaction);

  // History modal
  document.getElementById('closeHistoryModal')?.addEventListener('click', closeHistoryModal);
  document.getElementById('closeHistoryBtn')?.addEventListener('click', closeHistoryModal);

  // Share link modal
  document.getElementById('closeShareLinkModal')?.addEventListener('click', closeShareLinkModal);
  document.getElementById('closeShareBtn')?.addEventListener('click', closeShareLinkModal);
  document.getElementById('copyLinkBtn')?.addEventListener('click', copyShareLink);

  // Settings modal
  document.getElementById('openSettingsBtn')?.addEventListener('click', openSettingsModal);
  document.getElementById('closeSettingsModal')?.addEventListener('click', closeSettingsModal);
  document.getElementById('closeSettingsBtn')?.addEventListener('click', closeSettingsModal);
  document.getElementById('backupBtn')?.addEventListener('click', downloadBackup);
  document.getElementById('restoreBtn')?.addEventListener('click', uploadBackup);
  document.getElementById('resetDataBtn')?.addEventListener('click', resetData);
});
